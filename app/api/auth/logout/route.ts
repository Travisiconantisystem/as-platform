import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶信息（用於記錄活動）
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('獲取用戶信息錯誤:', userError)
    }
    
    // 記錄登出活動（在實際登出之前）
    if (user) {
      try {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            action: 'logout',
            details: {
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              user_agent: request.headers.get('user-agent'),
              logout_time: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          })
      } catch (activityError) {
        console.error('記錄登出活動錯誤:', activityError)
        // 不阻止登出流程
      }
    }
    
    // 執行登出
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('登出錯誤:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: '登出失敗，請稍後再試' 
        },
        { status: 500 }
      )
    }
    
    // 清除相關 cookies
    const response = NextResponse.json({
      success: true,
      message: '已成功登出'
    })
    
    // 清除認證相關的 cookies
    response.cookies.delete('supabase-auth-token')
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
    
  } catch (error) {
    console.error('登出 API 錯誤:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服務器內部錯誤，請稍後再試' 
      },
      { status: 500 }
    )
  }
}

// 處理 GET 請求（支援通過 URL 登出）
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取當前用戶信息
    const { data: { user } } = await supabase.auth.getUser()
    
    // 記錄登出活動
    if (user) {
      try {
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            action: 'logout',
            details: {
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              user_agent: request.headers.get('user-agent'),
              logout_method: 'GET',
              logout_time: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          })
      } catch (activityError) {
        console.error('記錄登出活動錯誤:', activityError)
      }
    }
    
    // 執行登出
    await supabase.auth.signOut()
    
    // 重定向到登錄頁面
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('message', '已成功登出')
    
    const response = NextResponse.redirect(redirectUrl)
    
    // 清除認證相關的 cookies
    response.cookies.delete('supabase-auth-token')
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
    
  } catch (error) {
    console.error('登出 GET API 錯誤:', error)
    
    // 即使出錯也重定向到登錄頁面
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('error', '登出時發生錯誤')
    
    return NextResponse.redirect(redirectUrl)
  }
}

// 處理 OPTIONS 請求（CORS 預檢）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}