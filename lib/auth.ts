import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from './supabase'
import { Database } from './database.types'
import bcrypt from 'bcryptjs'

// Supabase adapter配置
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'next_auth',
    },
  }
)

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // 自定義憑證登入
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 從Supabase查詢用戶
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            return null
          }

          // 驗證密碼
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash || ''
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // 初次登入時將用戶信息添加到token
      if (user) {
        token.role = user.role
        token.userId = user.id
      }

      // OAuth登入時處理用戶資料
      if (account && profile) {
        try {
          // 檢查用戶是否已存在
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', profile.email!)
            .single()

          if (!existingUser) {
            // 創建新用戶
            const { data: newUser, error } = await supabaseAdmin
              .from('users')
              .insert({
                email: profile.email!,
                full_name: profile.name || '',
                avatar_url: profile.image || '',
                provider: account.provider,
                provider_id: account.providerAccountId,
                role: 'user',
                is_active: true,
              })
              .select()
              .single()

            if (!error && newUser) {
              token.role = newUser.role
              token.userId = newUser.id
            }
          } else {
            token.role = existingUser.role
            token.userId = existingUser.id
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // 將token中的信息添加到session
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }

      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // 檢查用戶是否被禁用
      if (user.email) {
        try {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('is_active')
            .eq('email', user.email)
            .single()

          if (userData && !userData.is_active) {
            return false
          }
        } catch (error) {
          console.error('SignIn callback error:', error)
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // 重定向邏輯
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // 記錄登入事件
      try {
        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'sign_in',
          details: {
            provider: account?.provider,
            isNewUser,
          },
          ip_address: '', // 需要從request中獲取
          user_agent: '', // 需要從request中獲取
        })
      } catch (error) {
        console.error('SignIn event error:', error)
      }
    },
    async signOut({ session, token }) {
      // 記錄登出事件
      try {
        if (session?.user?.id) {
          await supabaseAdmin.from('audit_logs').insert({
            user_id: session.user.id,
            action: 'sign_out',
            details: {},
            ip_address: '',
            user_agent: '',
          })
        }
      } catch (error) {
        console.error('SignOut event error:', error)
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// 密碼加密函數
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// 密碼驗證函數
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 生成隨機密碼
export function generateRandomPassword(length: number = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// 用戶角色檢查
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    super_admin: 4,
    admin: 3,
    manager: 2,
    user: 1,
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}

// 權限檢查
export function hasPermission(
  userRole: string,
  action: string,
  resource: string
): boolean {
  // 超級管理員擁有所有權限
  if (userRole === 'super_admin') {
    return true
  }

  // 定義權限矩陣
  const permissions = {
    admin: {
      users: ['create', 'read', 'update', 'delete'],
      platforms: ['create', 'read', 'update', 'delete'],
      workflows: ['create', 'read', 'update', 'delete'],
      agents: ['create', 'read', 'update', 'delete'],
      settings: ['read', 'update'],
    },
    manager: {
      users: ['read', 'update'],
      platforms: ['create', 'read', 'update'],
      workflows: ['create', 'read', 'update', 'delete'],
      agents: ['create', 'read', 'update', 'delete'],
      settings: ['read'],
    },
    user: {
      users: ['read'],
      platforms: ['read'],
      workflows: ['create', 'read', 'update'],
      agents: ['create', 'read', 'update'],
      settings: ['read'],
    },
  }

  const userPermissions = permissions[userRole as keyof typeof permissions]
  if (!userPermissions) {
    return false
  }

  const resourcePermissions = userPermissions[resource as keyof typeof userPermissions]
  if (!resourcePermissions) {
    return false
  }

  return resourcePermissions.includes(action)
}