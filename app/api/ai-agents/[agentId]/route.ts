import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendToN8NWebhook } from '@/lib/n8n/webhook-client'


// GET 請求 - 獲取特定 AI 智能體詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const supabase = createRouteHandlerClient({ cookies })
    
    let query = supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: agent, error } = await query.single()
    
    if (error) {
      console.error('獲取 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    return NextResponse.json(agent)
    
  } catch (error) {
    console.error('獲取 AI 智能體詳情錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// PUT 請求 - 更新特定 AI 智能體
export async function PUT(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const body = await request.json()
    const { userId, ...updates } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: updatedAgent, error } = await supabase
      .from('ai_agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('更新 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '更新智能體失敗' }, { status: 500 })
    }
    
    // 如果更新了配置，通知 N8N
    if (updates.config) {
      try {
        await sendToN8NWebhook({
          workflowId: '',
          taskType: 'agent_config_update',
          data: {
            agentId: agentId,
            config: updates.config
          },
          userId: userId
        })
      } catch (webhookError) {
        console.error('更新智能體配置 Webhook 錯誤:', webhookError)
      }
    }
    
    return NextResponse.json(updatedAgent)
    
  } catch (error) {
    console.error('更新 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// DELETE 請求 - 刪除特定 AI 智能體
export async function DELETE(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', agentId)
      .eq('user_id', userId)
    
    if (error) {
      console.error('刪除 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '刪除智能體失敗' }, { status: 500 })
    }
    
    // 通知 N8N 清理智能體資源
    try {
      await sendToN8NWebhook({
        workflowId: '',
        taskType: 'agent_cleanup',
        data: {
          agentId: agentId
        },
        userId: userId
      })
    } catch (webhookError) {
      console.error('清理智能體 Webhook 錯誤:', webhookError)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('刪除 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}