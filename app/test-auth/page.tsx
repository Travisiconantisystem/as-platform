'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuth() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>NextAuth 測試頁面</CardTitle>
          <CardDescription>
            測試登入功能和session狀態
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>狀態:</strong> {status}
          </div>
          
          {session ? (
            <div className="space-y-4">
              <div>
                <strong>用戶信息:</strong>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              <Button onClick={() => signOut()} variant="destructive" className="w-full">
                登出
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={() => signIn('google', { callbackUrl: '/test-auth' })} 
                className="w-full"
              >
                Google 登入
              </Button>
              <Button 
                onClick={() => signIn('github', { callbackUrl: '/test-auth' })} 
                className="w-full"
                variant="outline"
              >
                GitHub 登入
              </Button>
              <Button 
                onClick={() => signIn('credentials', { callbackUrl: '/test-auth' })} 
                className="w-full"
                variant="secondary"
              >
                憑證登入
              </Button>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <strong>當前URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>NEXTAUTH_URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}