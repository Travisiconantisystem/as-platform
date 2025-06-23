import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendToN8NWebhook } from '@/lib/n8n/webhook-client'
import { v4 as uuidv4 } from 'uuid'

// POST 請求 - 測試 AI 智能體
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const body = await request.json()
    const { userId, testInput, testConfig } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    if (!testInput) {
      return NextResponse.json(
        { error: '缺少測試輸入' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 檢查智能體是否存在且可用
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    if (agent.status === 'training') {
      return NextResponse.json(
        { error: '智能體正在訓練中，無法進行測試' },
        { status: 400 }
      )
    }
    
    // 創建測試任務 ID
    const testTaskId = uuidv4()
    
    // 記錄測試任務
    const { error: taskError } = await supabase
      .from('ai_tasks')
      .insert({
        task_id: testTaskId,
        user_id: userId,
        task_type: 'agent_test',
        input_data: {
          agentId: agentId,
          testInput: testInput,
          config: testConfig
        },
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (taskError) {
      console.error('記錄測試任務錯誤:', taskError)
    }
    
    // 通過 N8N Webhook 執行測試
    try {
      const webhookResult = await sendToN8NWebhook({
        workflowId: '',
        taskType: 'agent_test',
        data: {
          taskId: testTaskId,
          agentId: agentId,
          testInput: testInput,
          agentConfig: agent.config,
          testConfig: {
            temperature: testConfig?.temperature || agent.config?.temperature || 0.7,
            maxTokens: testConfig?.maxTokens || agent.config?.maxTokens || 1000,
            includeMetrics: testConfig?.includeMetrics || true,
            timeout: testConfig?.timeout || 30000
          }
        },
        userId: userId
      })
      
      return NextResponse.json({
        success: true,
        testTaskId,
        executionId: webhookResult.executionId,
        message: '測試任務已開始，請等待結果',
        estimatedTime: '30 秒'
      })
      
    } catch (webhookError) {
      console.error('執行測試 Webhook 錯誤:', webhookError)
      
      // 更新任務狀態為失敗
      await supabase
        .from('ai_tasks')
        .update({
          status: 'failed',
          error_message: webhookError instanceof Error ? webhookError.message : String(webhookError),
          updated_at: new Date().toISOString()
        })
        .eq('task_id', testTaskId)
      
      return NextResponse.json(
        { error: '執行測試失敗', details: webhookError instanceof Error ? webhookError.message : String(webhookError) },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('測試 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// GET 請求 - 獲取測試歷史
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 檢查智能體是否存在
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    // 獲取測試歷史
    const { data: testHistory, error } = await supabase
      .from('ai_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_type', 'agent_test')
      .contains('input_data', { agentId: agentId })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('獲取測試歷史錯誤:', error)
      return NextResponse.json({ error: '獲取測試歷史失敗' }, { status: 500 })
    }
    
    // 獲取總數
    const { count } = await supabase
      .from('ai_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('task_type', 'agent_test')
      .contains('input_data', { agentId: agentId })
    
    return NextResponse.json({
      testHistory: testHistory || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
    
  } catch (error) {
    console.error('獲取測試歷史錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}