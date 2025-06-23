import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// 註冊請求驗證 schema
const registerSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(8, '密碼至少需要8個字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密碼必須包含大小寫字母和數字'),
  name: z.string().min(2, '姓名至少需要2個字符').max(50, '姓名不能超過50個字符'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, '請同意服務條款'),
  marketingEmails: z.boolean().optional().default(false)
}).refine(data => data.password === data.confirmPassword, {
  message: '密碼確認不匹配',
  path: ['confirmPassword']
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // 驗證請求數據
    const validatedData = registerSchema.parse(body)
    const { email, password, name, marketingEmails } = validatedData
    
    // 檢查電子郵件是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: '此電子郵件地址已被註冊' 
        },
        { status: 409 }
      )
    }
    
    // 使用 Supabase 創建新用戶
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          marketing_emails: marketingEmails
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      }
    })
    
    if (error) {
      console.error('註冊錯誤:', error)
      
      let errorMessage = '註冊失敗，請稍後再試'
      
      if (error.message.includes('User already registered')) {
        errorMessage = '此電子郵件地址已被註冊'
      } else if (error.message.includes('Password should be')) {
        errorMessage = '密碼不符合安全要求'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '電子郵件地址格式不正確'
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          code: error.message 
        },
        { status: 400 }
      )
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: '註冊失敗，請稍後再試' 
        },
        { status: 500 }
      )
    }
    
    // 創建用戶資料記錄
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'user',
        subscription_tier: 'free',
        preferences: {
          marketing_emails: marketingEmails,
          language: 'zh-HK',
          timezone: 'Asia/Hong_Kong',
          theme: 'system'
        },
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error('創建用戶資料錯誤:', profileError)
      // 註冊已成功，但資料創建失敗，記錄錯誤但不阻止流程
    }
    
    // 記錄註冊活動
    await supabase
      .from('user_activities')
      .insert({
        user_id: data.user.id,
        action: 'register',
        details: {
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
          marketing_emails: marketingEmails
        },
        created_at: new Date().toISOString()
      })
    
    // 創建默認工作流程模板（可選）
    try {
      await supabase
        .from('workflows')
        .insert({
          user_id: data.user.id,
          name: '歡迎工作流程',
          description: '這是您的第一個工作流程範例',
          status: 'draft',
          config: {
            nodes: [
              {
                id: 'start',
                type: 'trigger',
                position: { x: 100, y: 100 },
                data: {
                  label: '開始',
                  trigger_type: 'manual'
                }
              },
              {
                id: 'welcome',
                type: 'action',
                position: { x: 300, y: 100 },
                data: {
                  label: '歡迎消息',
                  action_type: 'notification',
                  config: {
                    message: '歡迎使用 AS 一站式平台！'
                  }
                }
              }
            ],
            edges: [
              {
                id: 'start-welcome',
                source: 'start',
                target: 'welcome'
              }
            ]
          },
          is_template: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    } catch (templateError) {
      console.error('創建默認工作流程錯誤:', templateError)
      // 不阻止註冊流程
    }
    
    // 如果需要電子郵件驗證
    if (!data.session) {
      return NextResponse.json({
        success: true,
        message: '註冊成功！請檢查您的電子郵件並點擊驗證鏈接以完成註冊。',
        requiresVerification: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
          email_confirmed: false
        }
      })
    }
    
    // 自動登錄成功
    return NextResponse.json({
      success: true,
      message: '註冊成功！歡迎使用 AS 一站式平台。',
      requiresVerification: false,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        role: 'user',
        subscription_tier: 'free',
        email_confirmed: true
      },
      session: data.session
    })
    
  } catch (error) {
    console.error('註冊 API 錯誤:', error)
    
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