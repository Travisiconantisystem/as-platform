import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// 工作流程節點驗證 schema
const workflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['trigger', 'action', 'condition', 'delay', 'webhook']),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  data: z.object({
    label: z.string(),
    config: z.record(z.any()).optional()
  }).passthrough()
})

// 工作流程連接驗證 schema
const workflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.record(z.any()).optional()
})

// 創建工作流程驗證 schema
const createWorkflowSchema = z.object({
  name: z.string().min(1, '工作流程名稱不能為空').max(100, '工作流程名稱不能超過100個字符'),
  description: z.string().max(500, '描述不能超過500個字符').optional(),
  category: z.enum(['automation', 'integration', 'ai_agent', 'data_processing', 'notification']).optional().default('automation'),
  config: z.object({
    nodes: z.array(workflowNodeSchema),
    edges: z.array(workflowEdgeSchema),
    settings: z.object({
      timeout: z.number().min(1).max(3600).optional().default(300),
      retries: z.number().min(0).max(5).optional().default(3),
      concurrent: z.boolean().optional().default(false),
      error_handling: z.enum(['stop', 'continue', 'retry']).optional().default('stop')
    }).optional().default({})
  }),
  tags: z.array(z.string()).optional().default([]),
  is_template: z.boolean().optional().default(false),
  is_public: z.boolean().optional().default(false)
})

// 更新工作流程驗證 schema
const updateWorkflowSchema = createWorkflowSchema.partial()

// 獲取工作流程列表
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 驗證用戶身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')?.split(',')
    const isTemplate = searchParams.get('is_template') === 'true'
    const isPublic = searchParams.get('is_public') === 'true'
    
    const offset = (page - 1) * limit
    
    // 構建查詢
    let query = supabase
      .from('workflows')
      .select(`
        *,
        executions:workflow_executions(count)
      `, { count: 'exact' })
    
    // 如果不是查看公共模板，只顯示用戶自己的工作流程
    if (!isPublic) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('is_public', true)
    }
    
    // 應用篩選條件
    if (category) {
      query = query.eq('category', category)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (isTemplate) {
      query = query.eq('is_template', true)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }
    
    // 排序和分頁
    query = query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data: workflows, error, count } = await query
    
    if (error) {
      console.error('獲取工作流程錯誤:', error)
      return NextResponse.json(
        { error: '獲取工作流程失敗' },
        { status: 500 }
      )
    }
    
    // 計算統計信息
    const stats = {
      total: count || 0,
      active: workflows?.filter(w => w.status === 'active').length || 0,
      draft: workflows?.filter(w => w.status === 'draft').length || 0,
      paused: workflows?.filter(w => w.status === 'paused').length || 0
    }
    
    return NextResponse.json({
      workflows: workflows || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      stats
    })
    
  } catch (error) {
    console.error('工作流程 API 錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}

// 創建新工作流程
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 驗證用戶身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // 驗證請求數據
    const validatedData = createWorkflowSchema.parse(body)
    
    // 檢查用戶是否達到工作流程限制
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()
    
    const { count: workflowCount } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    
    // 根據訂閱等級檢查限制
    const limits = {
      free: 5,
      basic: 25,
      pro: 100,
      enterprise: Infinity
    }
    
    const userLimit = limits[userProfile?.subscription_tier as keyof typeof limits] || limits.free
    
    if ((workflowCount || 0) >= userLimit) {
      return NextResponse.json(
        { 
          error: '已達到工作流程數量限制',
          limit: userLimit,
          current: workflowCount 
        },
        { status: 403 }
      )
    }
    
    // 創建工作流程
    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert({
        ...validatedData,
        user_id: user.id,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error('創建工作流程錯誤:', error)
      return NextResponse.json(
        { error: '創建工作流程失敗' },
        { status: 500 }
      )
    }
    
    // 記錄活動
    await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        action: 'workflow_created',
        details: {
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          category: workflow.category
        },
        created_at: new Date().toISOString()
      })
    
    return NextResponse.json({
      success: true,
      workflow
    }, { status: 201 })
    
  } catch (error) {
    console.error('創建工作流程 API 錯誤:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '請求數據格式不正確',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '服務器內部錯誤' },
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}