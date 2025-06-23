import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendToN8NWebhook } from '@/lib/n8n/webhook-client'
import { v4 as uuidv4 } from 'uuid'

// POST 請求 - 發送消息給 AI 智能體
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const body = await request.json()
    const { userId, conversationId, message, context } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    if (!message) {
      return NextResponse.json(
        { error: '缺少消息內容' },
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
    
    if (agent.status !== 'active') {
      return NextResponse.json(
        { error: '智能體當前不可用' },
        { status: 400 }
      )
    }
    
    // 獲取或創建對話
    let conversation
    if (conversationId) {
      const { data: existingConversation, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('agent_id', agentId)
        .single()
      
      if (convError || !existingConversation) {
        return NextResponse.json(
          { error: '對話不存在' },
          { status: 404 }
        )
      }
      conversation = existingConversation
    } else {
      // 創建新對話
      const { data: newConversation, error: createError } = await supabase
        .from('ai_conversations')
        .insert({
          agent_id: agentId,
          user_id: userId,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          status: 'active'
        })
        .select()
        .single()
      
      if (createError || !newConversation) {
        console.error('創建對話錯誤:', createError)
        return NextResponse.json(
          { error: '創建對話失敗' },
          { status: 500 }
        )
      }
      conversation = newConversation
    }
    
    // 保存用戶消息
    const { data: userMessage, error: userMsgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        metadata: context ? { context } : null
      })
      .select()
      .single()
    
    if (userMsgError) {
      console.error('保存用戶消息錯誤:', userMsgError)
      return NextResponse.json(
        { error: '保存消息失敗' },
        { status: 500 }
      )
    }
    
    // 準備發送到 N8N 的數據
    const webhookData = {
      workflowId: 'agent_chat',
      taskType: 'ai_chat',
      userId,
      data: {
        agentId: agentId,
        conversationId: conversation.id,
        messageId: userMessage.id,
        message,
        context,
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          config: agent.config
        }
      }
    }
    
    try {
      // 發送到 N8N webhook
      const n8nResponse = await sendToN8NWebhook(webhookData)
      
      // 記錄 AI 任務
      const { data: aiTask, error: taskError } = await supabase
        .from('ai_tasks')
        .insert({
          task_id: uuidv4(),
          user_id: userId,
          trigger_type: 'api',
          status: 'processing',
          input_data: {
            agentId: agentId,
            conversationId: conversation.id,
            message,
            context
          },
          ai_response: n8nResponse
        })
        .select()
        .single()
      
      if (taskError) {
        console.error('記錄 AI 任務錯誤:', taskError)
      }
      
      return NextResponse.json({
        success: true,
        conversationId: conversation.id,
        messageId: userMessage.id,
        taskId: aiTask?.id
      })
      
    } catch (n8nError) {
      console.error('N8N webhook 錯誤:', n8nError)
      
      // 記錄失敗的 AI 任務
      await supabase
        .from('ai_tasks')
        .insert({
          task_id: uuidv4(),
          user_id: userId,
          trigger_type: 'api',
          status: 'failed',
          input_data: {
            agentId: agentId,
            conversationId: conversation.id,
            message,
            context
          },
          error_message: n8nError instanceof Error ? n8nError.message : 'N8N webhook 調用失敗'
        })
      
      return NextResponse.json(
        { error: 'AI 處理失敗，請稍後重試' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('聊天 API 錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}

// GET 請求 - 獲取對話歷史
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')
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
    
    let query = supabase
      .from('ai_messages')
      .select(`
        *,
        conversation:ai_conversations!inner(
          id,
          title,
          status,
          created_at
        )
      `)
      .eq('conversation.agent_id', agentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }
    
    const { data: messages, error: messagesError } = await query
    
    if (messagesError) {
      console.error('獲取消息錯誤:', messagesError)
      return NextResponse.json(
        { error: '獲取消息失敗' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      messages: messages || [],
      hasMore: messages?.length === limit
    })
    
  } catch (error) {
    console.error('獲取聊天歷史錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}