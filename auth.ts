import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Custom fields are extended in types/next-auth.d.ts

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = credentialsSchema.extend({
  name: z.string().min(2),
});

export const config: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials) {
        // Handle signup
        if (credentials?.action === "signup") {
          const validation = signupSchema.safeParse(credentials);
          if (!validation.success) {
            throw new Error("Invalid signup data");
          }
          
          const { email, password, name } = validation.data;
          
          // Check if user exists
          const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (existingUser.length > 0) {
            throw new Error("User already exists");
          }
          
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Create user
          const newUser = await db.insert(users).values({
            id: nanoid(),
            email,
            password: hashedPassword,
            name,
            role: 'free',
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          return {
            id: newUser[0].id,
            email: newUser[0].email,
            name: newUser[0].name,
            role: newUser[0].role,
            guestId: newUser[0].guestId
          };
        }
        
        // Handle login
        const validation = credentialsSchema.safeParse(credentials);
        if (!validation.success) {
          return null;
        }
        
        const { email, password } = validation.data;
        
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length === 0) {
          return null;
        }
        
        const validPassword = await bcrypt.compare(password, user[0].password || "");
        if (!validPassword) {
          return null;
        }
        
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: user[0].role,
          guestId: user[0].guestId
        };
      }
    }),
    
    // Guest provider
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        const guestId = `guest_${nanoid(10)}`;
        const guestName = `Courier_${Math.random().toString(36).substring(2, 7)}`;
        
        // Create guest user
        const newGuest = await db.insert(users).values({
          id: guestId,
          name: guestName,
          role: 'free',
          guestId: guestId,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        return {
          id: newGuest[0].id,
          name: newGuest[0].name,
          role: newGuest[0].role,
          guestId: newGuest[0].guestId || undefined
        };
      }
    })
  ],
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.guestId = user.guestId || undefined;
      }
      
      // Handle user update (guest to registered conversion)
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.guestId = token.guestId as string | undefined;
      
      return session;
    },
    
    async signIn({ user }) {
      // Trigger character generation for new users
      if (user) {
        // This will be handled by a separate service after sign in
        // to avoid blocking the auth flow
      }
      return true;
    }
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);