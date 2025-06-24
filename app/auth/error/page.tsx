import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

interface AuthErrorPageProps {
  searchParams: { error?: string }
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const error = searchParams.error || null

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: '配置錯誤',
          description: '認證服務配置有誤，請聯繫系統管理員。',
        }
      case 'AccessDenied':
        return {
          title: '訪問被拒絕',
          description: '您沒有權限訪問此應用程式。',
        }
      case 'Verification':
        return {
          title: '驗證失敗',
          description: '無法驗證您的身份，請重新嘗試登入。',
        }
      case 'Callback':
        return {
          title: 'OAuth 回調錯誤',
          description: 'OAuth 登入回調過程中發生錯誤，但您可能已成功登入。請嘗試訪問主頁面。',
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth 回調錯誤',
          description: 'OAuth 提供商回調配置可能有誤，請檢查回調 URL 設置。',
        }
      case 'Default':
      default:
        return {
          title: '認證錯誤',
          description: '登入過程中發生未知錯誤，請稍後再試。',
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorInfo.description}
            </AlertDescription>
          </Alert>

          {error && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">錯誤代碼：</p>
              <code className="bg-muted px-2 py-1 rounded text-xs">{error}</code>
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                重新登入
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                返回首頁
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>如果問題持續發生，請聯繫技術支援。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}