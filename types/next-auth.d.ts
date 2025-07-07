import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      guestId?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    guestId?: string | null
    /** @deprecated Use role === 'free' && guestId instead */
    isGuest?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    guestId?: string
  }
}