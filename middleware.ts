import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 定義路由配置
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/verify-request',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
  '/api/auth',
  '/api/health',
  '/api/webhooks',
  '/not-found',
]



const adminRoutes = [
  '/admin',
  '/system',
]

const apiRoutes = [
  '/api/users',
  '/api/platforms',
  '/api/workflows',
  '/api/ai',
  '/api/system',
]

// 檢查路由是否匹配
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    // 精確匹配或子路徑匹配
    if (pathname === route) {
      return true
    }
    // 對於 /api/auth 路由，允許所有子路徑
    if (route === '/api/auth' && pathname.startsWith('/api/auth/')) {
      return true
    }
    // 其他路由的子路徑匹配
    return pathname.startsWith(route + '/')
  })
}

// 檢查用戶權限
function hasPermission(userRole: string, pathname: string): boolean {
  // 超級管理員擁有所有權限
  if (userRole === 'super_admin') {
    return true
  }

  // 管理員路由檢查
  if (matchesRoute(pathname, adminRoutes)) {
    return ['admin', 'super_admin'].includes(userRole)
  }

  // 系統設置權限檢查
  if (pathname.startsWith('/settings/system')) {
    return ['admin', 'super_admin'].includes(userRole)
  }

  // 用戶管理權限檢查
  if (pathname.startsWith('/settings/users')) {
    return ['admin', 'super_admin', 'manager'].includes(userRole)
  }

  // API路由權限檢查
  if (matchesRoute(pathname, apiRoutes)) {
    // 系統API只允許管理員訪問
    if (pathname.startsWith('/api/system')) {
      return ['admin', 'super_admin'].includes(userRole)
    }
    
    // 用戶管理API
    if (pathname.startsWith('/api/users') && pathname !== '/api/users/profile') {
      return ['admin', 'super_admin', 'manager'].includes(userRole)
    }
  }

  // 其他受保護路由允許所有已認證用戶訪問
  return true
}

// 速率限制配置
const rateLimitConfig = {
  '/api/auth': { max: 5, window: 15 * 60 * 1000 }, // 15分鐘5次
  '/api/users': { max: 100, window: 15 * 60 * 1000 }, // 15分鐘100次
  '/api/workflows': { max: 50, window: 15 * 60 * 1000 }, // 15分鐘50次
  '/api/ai': { max: 20, window: 15 * 60 * 1000 }, // 15分鐘20次
  default: { max: 200, window: 15 * 60 * 1000 }, // 默認15分鐘200次
}

// 速率限制存儲（生產環境應使用Redis）
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// 檢查速率限制
function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const pathname = request.nextUrl.pathname
  
  // 獲取對應的速率限制配置
  let config = rateLimitConfig.default
  for (const [route, routeConfig] of Object.entries(rateLimitConfig)) {
    if (route !== 'default' && pathname.startsWith(route)) {
      config = routeConfig
      break
    }
  }
  
  const key = `${ip}:${pathname}`
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    // 重置或創建新記錄
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window,
    })
    return true
  }
  
  if (record.count >= config.max) {
    return false
  }
  
  record.count++
  return true
}

// 清理過期的速率限制記錄
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000) // 每5分鐘清理一次

// 主中間件函數
export default withAuth(
  async function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token
    
    // 對於公共路由，直接放行
    if (matchesRoute(pathname, publicRoutes)) {
      const response = NextResponse.next()
      // 基本安全標頭已在 next.config.js 中配置
      return response
    }
    
    // 速率限制檢查
    if (!checkRateLimit(request)) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: '請求過於頻繁，請稍後再試',
            code: 'RATE_LIMIT_EXCEEDED',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Retry-After': '900', // 15分鐘
            },
          }
        )
      }
      
      return NextResponse.redirect(new URL('/auth/error?error=RateLimitExceeded', request.url))
    }
    
    // 檢查是否已認證
    if (!token) {
      // API路由返回401
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: '未授權訪問',
            code: 'UNAUTHORIZED',
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
          }
        )
      }
      
      // 頁面路由重定向到登入頁
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // 檢查用戶是否被禁用
    if (token.isActive === false) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: '帳戶已被禁用',
            code: 'ACCOUNT_DISABLED',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
          }
        )
      }
      
      return NextResponse.redirect(new URL('/auth/error?error=AccountDisabled', request.url))
    }
    
    // 檢查權限
    const userRole = token.role as string
    if (!hasPermission(userRole, pathname)) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: '權限不足',
            code: 'INSUFFICIENT_PERMISSIONS',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
            },
          }
        )
      }
      
      return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', request.url))
    }
    
    // 創建響應（安全標頭已在 next.config.js 中統一配置）
    const response = NextResponse.next()
    
    // 添加用戶信息到請求標頭（供API使用）
    if (token) {
      response.headers.set('X-User-ID', token.userId as string)
      response.headers.set('X-User-Role', token.role as string)
      response.headers.set('X-User-Email', token.email as string)
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // 公開路由不需要認證
        if (matchesRoute(pathname, publicRoutes)) {
          return true
        }
        
        // API路由需要token
        if (pathname.startsWith('/api/')) {
          return !!token
        }
        
        // 其他受保護路由需要token
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
)

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路由除了:
     * - _next/static (靜態文件)
     * - _next/image (圖片優化)
     * - favicon.ico (網站圖標)
     * - public文件夾中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}