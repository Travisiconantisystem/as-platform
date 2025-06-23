'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 數據在 5 分鐘後被視為過時
            staleTime: 5 * 60 * 1000,
            // 緩存時間為 10 分鐘
            gcTime: 10 * 60 * 1000,
            // 窗口重新獲得焦點時重新獲取數據
            refetchOnWindowFocus: false,
            // 重新連接時重新獲取數據
            refetchOnReconnect: true,
            // 重試次數
            retry: (failureCount, error: any) => {
              // 對於 4xx 錯誤不重試
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              // 最多重試 3 次
              return failureCount < 3
            },
            // 重試延遲
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // 突變重試次數
            retry: 1,
            // 突變重試延遲
            retryDelay: 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境下顯示 React Query 開發工具 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}