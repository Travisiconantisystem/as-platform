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
    
    // 檢查對話是否存在
    let conversation = null
    if (conversationId) {
      const { data: existingConversation, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('agent_id', agentId)
        .eq('user_id', userId)
        .single()
      
      if (!convError && existingConversation) {
        conversation = existingConversation
      }
    }
    
    // 如果沒有對話，創建新對話
    if (!conversation) {
      const newConversationId = uuidv4()
      const now = new Date().toISOString()
      
      const { data: newConversation, error: newConvError } = await supabase
        .from('ai_conversations')
        .insert({
          id: newConversationId,
          agent_id: agentId,
          user_id: userId,
          title: `與 ${agent.name} 的對話`,
          message_count: 0,
          status: 'active',
          created_at: now,
          updated_at: now
        })
        .select()
        .single()
      
      if (newConvError) {
        console.error('創建對話錯誤:', newConvError)
        return NextResponse.json({ error: '創建對話失敗' }, { status: 500 })
      }
      
      conversation = newConversation
    }
    
    // 保存用戶消息
    const userMessageId = uuidv4()
    const now = new Date().toISOString()
    
    const { error: userMessageError } = await supabase
      .from('ai_messages')
      .insert({
        id: userMessageId,
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        created_at: now
      })
    
    if (userMessageError) {
      console.error('保存用戶消息錯誤:', userMessageError)
      return NextResponse.json({ error: '保存消息失敗' }, { status: 500 })
    }
    
    // 獲取對話歷史（最近 10 條消息）
    const { data: messageHistory } = await supabase
      .from('ai_messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(10)
    
    // 創建聊天任務 ID
    const chatTaskId = uuidv4()
    
    // 記錄聊天任務
    const { error: taskError } = await supabase
      .from('ai_tasks')
      .insert({
        task_id: chatTaskId,
        user_id: userId,
        task_type: 'agent_chat',
        input_data: {
          agentId: agentId,
          conversationId: conversation.id,
          message: message,
          context: context,
          messageHistory: messageHistory || []
        },
        status: 'queued',
        created_at: now,
        updated_at: now
      })
    
    if (taskError) {
      console.error('記錄聊天任務錯誤:', taskError)
    }
    
    // 通過 N8N Webhook 處理聊天
    try {
      const webhookResult = await sendToN8NWebhook({
        taskType: 'agent_chat',
        taskId: chatTaskId,
        agentId: agentId,
        conversationId: conversation.id,
        userMessage: message,
        messageHistory: messageHistory || [],
        agentConfig: agent.config,
        context: {
          ...context,
          agentName: agent.name,
          systemPrompt: agent.config?.systemPrompt,
          knowledgeBase: agent.config?.knowledgeBase
        }
      }, userId)
      
      // 更新對話統計
      await supabase
        .from('ai_conversations')
        .update({
          message_count: (conversation.message_count || 0) + 1,
          last_message_at: now,
          updated_at: now
        })
        .eq('id', conversation.id)
      
      return NextResponse.json({
        success: true,
        chatTaskId,
        conversationId: conversation.id,
        executionId: webhookResult.executionId,
        userMessageId,
        message: 'AI 正在處理您的消息，請等待回覆',
        estimatedTime: '5-10 秒'
      })
      
    } catch (webhookError) {
      console.error('處理聊天 Webhook 錯誤:', webhookError)
      
      // 更新任務狀態為失敗
      await supabase
        .from('ai_tasks')
        .update({
          status: 'failed',
          error_message: webhookError.message,
          updated_at: new Date().toISOString()
        })
        .eq('task_id', chatTaskId)
      
      return NextResponse.json(
        { error: '處理消息失敗', details: webhookError.message },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('聊天錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// GET 請求 - 獲取對話消息
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
    
    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 檢查對話是否存在且屬於該用戶和智能體
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (convError || !conversation) {
      return NextResponse.json({ error: '對話不存在' }, { status: 404 })
    }
    
    // 獲取消息列表
    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('獲取消息錯誤:', error)
      return NextResponse.json({ error: '獲取消息失敗' }, { status: 500 })
    }
    
    // 獲取總消息數
    const { count } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
    
    return NextResponse.json({
      messages: messages || [],
      conversation,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
    
  } catch (error) {
    console.error('獲取對話消息錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}