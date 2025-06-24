import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    email: string
    name?: string
    image?: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    email: string
    name?: string
    image?: string
    role?: string
  }
}

// 擴展 NextRequest 類型以包含 nextauth 屬性
declare module 'next/server' {
  interface NextRequest {
    nextauth: {
      token: JWT | null
    }
  }
}