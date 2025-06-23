import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// 登錄請求驗證 schema
const loginSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼至少需要6個字符'),
  remember: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // 驗證請求數據
    const validatedData = loginSchema.parse(body)
    const { email, password, remember } = validatedData
    
    // 使用 Supabase 進行身份驗證
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('登錄錯誤:', error)
      
      // 根據錯誤類型返回不同的錯誤信息
      let errorMessage = '登錄失敗，請檢查您的憑據'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '電子郵件或密碼不正確'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '請先驗證您的電子郵件地址'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = '登錄嘗試次數過多，請稍後再試'
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          code: error.message 
        },
        { status: 401 }
      )
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '登錄失敗，未找到用戶信息' 
        },
        { status: 401 }
      )
    }
    
    // 獲取用戶詳細信息
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.error('獲取用戶資料錯誤:', profileError)
      // 如果用戶資料不存在，創建基本資料
      if (profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            avatar_url: data.user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (createError) {
          console.error('創建用戶資料錯誤:', createError)
          return NextResponse.json(
            { 
              success: false, 
              error: '創建用戶資料失敗' 
            },
            { status: 500 }
          )
        }
        
        // 記錄登錄活動
        await supabase
          .from('user_activities')
          .insert({
            user_id: data.user.id,
            action: 'login',
            details: {
              ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
              user_agent: request.headers.get('user-agent'),
              remember
            },
            created_at: new Date().toISOString()
          })
        
        return NextResponse.json({
          success: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: newProfile?.name,
            avatar_url: newProfile?.avatar_url,
            role: newProfile?.role || 'user',
            subscription_tier: newProfile?.subscription_tier || 'free',
            created_at: newProfile?.created_at,
            updated_at: newProfile?.updated_at
          },
          session: data.session
        })
      }
    }
    
    // 記錄登錄活動
    await supabase
      .from('user_activities')
      .insert({
        user_id: data.user.id,
        action: 'login',
        details: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
          remember
        },
        created_at: new Date().toISOString()
      })
    
    // 返回成功響應
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: userProfile?.name,
        avatar_url: userProfile?.avatar_url,
        role: userProfile?.role || 'user',
        subscription_tier: userProfile?.subscription_tier || 'free',
        created_at: userProfile?.created_at,
        updated_at: userProfile?.updated_at
      },
      session: data.session
    })
    
  } catch (error) {
    console.error('登錄 API 錯誤:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: '請求數據格式不正確',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服務器內部錯誤，請稍後再試' 
      },
      { status: 500 }
    )
  }
}

// 處理 OPTIONS 請求（CORS 預檢）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}