'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { MainLayout } from '@/components/layout/main-layout'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {/* 主要內容 */}
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                <MainLayout>
                  {children}
                </MainLayout>
              </div>
            </div>
            
            {/* 全局通知 */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: 'hsl(var(--muted-foreground))',
                    secondary: 'hsl(var(--muted))',
                  },
                },
              }}
            />
            
            {/* 無障礙功能 */}
            <div id="skip-to-content" className="sr-only">
              <a
                href="#main-content"
                className="fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
              >
                跳到主要內容
              </a>
            </div>
            
            {/* 離線提示 */}
            <div id="offline-indicator" className="hidden">
              <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-yellow-500 p-4 text-center text-white shadow-lg md:left-auto md:right-4 md:w-80">
                <p className="text-sm font-medium">您目前處於離線狀態</p>
                <p className="text-xs opacity-90">部分功能可能無法使用</p>
              </div>
            </div>
            
            {/* 更新提示 */}
            <div id="update-indicator" className="hidden">
              <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-blue-500 p-4 text-center text-white shadow-lg md:left-auto md:right-4 md:w-80">
                <p className="text-sm font-medium">有新版本可用</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                >
                  立即更新
                </button>
              </div>
            </div>
          </ModalProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  )
}