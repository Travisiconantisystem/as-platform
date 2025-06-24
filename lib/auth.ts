import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development',
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
    // GitHub OAuth - 根據環境自動選擇配置
    GitHubProvider({
      clientId: process.env.NODE_ENV === 'development' 
        ? process.env.GITHUB_CLIENT_ID_LOCAL! 
        : process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.NODE_ENV === 'development' 
        ? process.env.GITHUB_CLIENT_SECRET_LOCAL! 
        : process.env.GITHUB_CLIENT_SECRET!,
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
          // 查找用戶
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            return null
          }

          // 檢查用戶是否被禁用
          if (!user.is_active) {
            return null
          }

          // 驗證密碼
          if (!user.password_hash) {
            return null
          }
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!isValid) {
            return null
          }

          // 更新最後登入時間
          await supabaseAdmin
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id)

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar || null,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 首次登入時，將用戶角色和ID添加到token
      if (user) {
        token.userId = user.id
        token.role = (user as any).role || 'user'
      }

      // OAuth登入時處理用戶資料
      if (account && user) {
        try {
          // 檢查用戶是否已存在
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError)
            return token
          }

          if (existingUser) {
            // 用戶已存在，更新最後登入時間
            await supabaseAdmin
              .from('users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', existingUser.id)

            token.userId = existingUser.id
            token.role = existingUser.role
          } else {
            // 創建新用戶
            const { data: newUser, error: createError } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email!,
                name: user.name || '',
                avatar: user.image || null,
                role: 'user' as const,
                is_active: true,
                last_login_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating user:', createError)
              return token
            }

            token.userId = newUser.id
            token.role = newUser.role
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // 將token中的userId和role添加到session
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // 檢查用戶是否被禁用
      if (user.email) {
        try {
          const { data: userData, error } = await supabaseAdmin
            .from('users')
            .select('is_active')
            .eq('email', user.email)
            .single()

          if (error && error.code !== 'PGRST116') {
            console.error('Error checking user status:', error)
            return false
          }

          if (userData && !userData.is_active) {
            return false
          }
        } catch (error) {
          console.error('SignIn callback error:', error)
          return false
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      
      // 如果是相對路徑，組合成完整URL
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`
        console.log('Relative path redirect:', fullUrl)
        return fullUrl
      }
      
      // 如果是同源URL，允許重定向
      if (url.startsWith(baseUrl)) {
        console.log('Same origin redirect:', url)
        return url
      }
      
      // 默認重定向到baseUrl
      console.log('Default redirect to baseUrl:', baseUrl)
      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // 記錄登入事件
      try {
        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'sign_in',
          resource_type: 'auth',
          new_values: {
            provider: account?.provider,
            isNewUser,
          },
          ip_address: null,
          user_agent: null,
        })
      } catch (error) {
        console.error('SignIn event error:', error)
      }
    },
    async signOut({ session }) {
      // 記錄登出事件
      try {
        if (session?.user && (session.user as any).id) {
          await supabaseAdmin.from('audit_logs').insert({
            user_id: (session.user as any).id,
            action: 'sign_out',
            resource_type: 'auth',
            new_values: {},
            ip_address: null,
            user_agent: null,
          })
        }
      } catch (error) {
        console.error('SignOut event error:', error)
      }
    },
  },
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