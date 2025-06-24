'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Github, Mail, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formError, setFormError] = useState('')

  // 檢查是否已登入
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError('登入失敗，請檢查您的電子郵件和密碼')
      } else {
        router.push(callbackUrl)
      }
    } catch (error) {
      setFormError('登入過程中發生錯誤，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setFormError(`${provider === 'google' ? 'Google' : 'GitHub'} 登入失敗`)
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return '登入憑證無效，請檢查您的電子郵件和密碼'
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
        return 'OAuth 登入失敗，請稍後再試'
      case 'Callback':
        return '登入回調失敗'
      case 'OAuthAccountNotLinked':
        return '此帳戶已與其他登入方式關聯'
      case 'EmailSignin':
        return '電子郵件登入失敗'
      case 'SessionRequired':
        return '需要登入才能訪問此頁面'
      default:
        return '登入失敗，請稍後再試'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            登入 AS Platform
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            歡迎回來！請登入您的帳戶
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 錯誤訊息 */}
          {(error || formError) && (
            <Alert variant="destructive">
              <AlertDescription>
                {formError || getErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth 登入按鈕 */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              使用 Google 登入
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              使用 GitHub 登入
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或使用電子郵件
              </span>
            </div>
          </div>

          {/* 電子郵件登入表單 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="輸入您的密碼"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登入
            </Button>
          </form>

          {/* 註冊連結 */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">還沒有帳戶？</span>{' '}
            <Link href="/auth/signup" className="text-primary hover:underline">
              立即註冊
            </Link>
          </div>

          {/* 忘記密碼 */}
          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
              忘記密碼？
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}