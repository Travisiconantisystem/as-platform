'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OAuthTest() {
  const [testResult, setTestResult] = useState<string>('')

  const testOAuthURL = (provider: string) => {
    const baseUrl = window.location.origin
    const callbackUrl = `${baseUrl}/api/auth/callback/${provider}`
    const signInUrl = `${baseUrl}/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent('/oauth-test')}`
    
    setTestResult(`
測試 ${provider.toUpperCase()} OAuth:

當前域名: ${baseUrl}
預期回調URL: ${callbackUrl}
登入URL: ${signInUrl}

請確保在 ${provider.toUpperCase()} OAuth 應用中配置了以下回調URL:
${callbackUrl}
    `)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>OAuth 回調 URL 測試</CardTitle>
          <CardDescription>
            檢查 OAuth 應用的回調 URL 配置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => testOAuthURL('google')}
              className="w-full"
            >
              檢查 Google OAuth
            </Button>
            <Button 
              onClick={() => testOAuthURL('github')}
              className="w-full"
              variant="outline"
            >
              檢查 GitHub OAuth
            </Button>
          </div>
          
          {testResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">測試結果:</h3>
              <pre className="p-4 bg-gray-100 rounded text-sm whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">重要提醒:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Google OAuth: 前往 Google Cloud Console → APIs & Services → Credentials</li>
              <li>• GitHub OAuth: 前往 GitHub Settings → Developer settings → OAuth Apps</li>
              <li>• 確保回調 URL 完全匹配（包括協議、域名、端口和路徑）</li>
              <li>• 對於 localhost，使用 http:// 而不是 https://</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">直接測試登入:</h3>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/api/auth/signin/google?callbackUrl=/oauth-test'}
                className="w-full"
              >
                嘗試 Google 登入
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/auth/signin/github?callbackUrl=/oauth-test'}
                className="w-full"
                variant="outline"
              >
                嘗試 GitHub 登入
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}