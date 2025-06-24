'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuth() {
  const [authConfig, setAuthConfig] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 檢查 NextAuth 配置
    fetch('/api/auth/providers')
      .then(res => res.json())
      .then(data => setAuthConfig(data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>NextAuth 調試信息</CardTitle>
            <CardDescription>
              檢查 NextAuth 配置和環境變量
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>當前 URL:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </div>
            </div>
            
            <div>
              <strong>NEXTAUTH_URL (客戶端):</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                {process.env.NEXT_PUBLIC_NEXTAUTH_URL || '未設置'}
              </div>
            </div>
            
            <div>
              <strong>可用的 Auth Providers:</strong>
              {error ? (
                <div className="mt-1 p-2 bg-red-100 rounded text-sm text-red-700">
                  錯誤: {error}
                </div>
              ) : authConfig ? (
                <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(authConfig, null, 2)}
                </pre>
              ) : (
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                  載入中...
                </div>
              )}
            </div>
            
            <div>
              <strong>預期的回調 URLs:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm space-y-1">
                <div>Google: http://localhost:3001/api/auth/callback/google</div>
                <div>GitHub: http://localhost:3001/api/auth/callback/github</div>
                <div>Credentials: http://localhost:3001/api/auth/callback/credentials</div>
              </div>
            </div>
            
            <div>
              <strong>測試連結:</strong>
              <div className="mt-1 space-y-2">
                <div>
                  <a 
                    href="/api/auth/signin/google?callbackUrl=/debug-auth" 
                    className="text-blue-600 hover:underline"
                  >
                    測試 Google OAuth
                  </a>
                </div>
                <div>
                  <a 
                    href="/api/auth/signin/github?callbackUrl=/debug-auth" 
                    className="text-blue-600 hover:underline"
                  >
                    測試 GitHub OAuth
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <strong>URL 參數:</strong>
              <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                {typeof window !== 'undefined' ? (
                  Object.entries(Object.fromEntries(new URLSearchParams(window.location.search))).length > 0 ? (
                    <pre>{JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)}</pre>
                  ) : (
                    '無 URL 參數'
                  )
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}