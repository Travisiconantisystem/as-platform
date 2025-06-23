import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    
    // 處理錯誤情況
    if (error) {
      console.error('認證回調錯誤:', error, errorDescription)
      
      let redirectUrl: URL
      let errorMessage = '認證失敗'
      
      switch (error) {
        case 'access_denied':
          errorMessage = '用戶拒絕了認證請求'
          redirectUrl = new URL('/auth/login', requestUrl.origin)
          break
        case 'invalid_request':
          errorMessage = '認證請求無效'
          redirectUrl = new URL('/auth/login', requestUrl.origin)
          break
        case 'unauthorized_client':
          errorMessage = '未授權的客戶端'
          redirectUrl = new URL('/auth/login', requestUrl.origin)
          break
        default:
          errorMessage = errorDescription || '認證過程中發生未知錯誤'
          redirectUrl = new URL('/auth/login', requestUrl.origin)
      }
      
      redirectUrl.searchParams.set('error', errorMessage)
      return NextResponse.redirect(redirectUrl)
    }
    
    // 如果沒有授權碼，重定向到登錄頁面
    if (!code) {
      const redirectUrl = new URL('/auth/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', '缺少授權碼')
      return NextResponse.redirect(redirectUrl)
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 交換授權碼獲取會話
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('交換授權碼錯誤:', exchangeError)
      
      const redirectUrl = new URL('/auth/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', '認證失敗，請重新登錄')
      return NextResponse.redirect(redirectUrl)
    }
    
    if (!data.user) {
      const redirectUrl = new URL('/auth/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', '未找到用戶信息')
      return NextResponse.redirect(redirectUrl)
    }
    
    // 檢查用戶資料是否存在
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    // 如果用戶資料不存在，創建基本資料
    if (profileError && profileError.code === 'PGRST116') {
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
          role: 'user',
          subscription_tier: 'free',
          email_confirmed: true,
          preferences: {
            language: 'zh-HK',
            timezone: 'Asia/Hong_Kong',
            theme: 'system'
          },
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (createError) {
        console.error('創建用戶資料錯誤:', createError)
        // 不阻止登錄流程，但記錄錯誤
      }
    } else if (!profileError && userProfile) {
      // 更新電子郵件確認狀態
      if (!userProfile.email_confirmed) {
        await supabase
          .from('users')
          .update({ 
            email_confirmed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)
      }
    }
    
    // 記錄認證活動
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: data.user.id,
          action: 'email_verified',
          details: {
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent'),
            verification_time: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        })
    } catch (activityError) {
      console.error('記錄認證活動錯誤:', activityError)
      // 不阻止流程
    }
    
    // 確定重定向目標
    let redirectUrl: URL
    
    // 檢查是否是新用戶（需要引導）
    if (!userProfile?.onboarding_completed) {
      redirectUrl = new URL('/onboarding', requestUrl.origin)
      redirectUrl.searchParams.set('welcome', 'true')
    } else {
      // 檢查是否有預設的重定向路徑
      const returnTo = requestUrl.searchParams.get('returnTo')
      if (returnTo && returnTo.startsWith('/')) {
        redirectUrl = new URL(returnTo, requestUrl.origin)
      } else {
        redirectUrl = new URL('/dashboard', requestUrl.origin)
      }
    }
    
    // 添加成功消息
    redirectUrl.searchParams.set('message', '電子郵件驗證成功，歡迎回來！')
    
    return NextResponse.redirect(redirectUrl)
    
  } catch (error) {
    console.error('認證回調處理錯誤:', error)
    
    const requestUrl = new URL(request.url)
    const redirectUrl = new URL('/auth/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', '認證過程中發生錯誤，請重新嘗試')
    
    return NextResponse.redirect(redirectUrl)
  }
}

// 處理 POST 請求（某些 OAuth 提供商可能使用 POST）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body
    
    if (!code) {
      return NextResponse.json(
        { 
          success: false, 
          error: '缺少授權碼' 
        },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 交換授權碼獲取會話
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('POST 交換授權碼錯誤:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: '認證失敗' 
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session
    })
    
  } catch (error) {
    console.error('POST 認證回調錯誤:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服務器內部錯誤' 
      },
      { status: 500 }
    )
  }
}