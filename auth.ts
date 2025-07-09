import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Custom fields are extended in types/next-auth.d.ts

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = credentialsSchema.extend({
  name: z.string().min(2),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
            name,
            email,
            password: hashedPassword,
            role: 'free',
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          return {
            id: newUser[0].id,
            name: newUser[0].name,
            email: newUser[0].email,
            role: newUser[0].role,
            isGuest: false
          };
        }
        
        // Handle signin
        const validation = credentialsSchema.safeParse(credentials);
        if (!validation.success) {
          return null;
        }
        
        const { email, password } = validation.data;
        
        // Find user
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length === 0) {
          return null;
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user[0].password || '');
        if (!isValidPassword) {
          return null;
        }
        
        return {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          role: user[0].role,
          isGuest: false
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
          email: null, // Guest users don't have emails
          name: guestName,
          password: null, // Guest users don't have passwords
          role: 'free',
          guestId: guestId,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        
        return {
          id: newGuest[0].id,
          name: newGuest[0].name,
          role: newGuest[0].role,
          guestId: newGuest[0].guestId || undefined,
          isGuest: true
        };
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      // Trigger character generation for new users
      if (user) {
        // This will be handled by a separate service after sign in
        // to avoid blocking the auth flow
      }
      return true;
    }
  },
  secret: process.env.AUTH_SECRET,
});