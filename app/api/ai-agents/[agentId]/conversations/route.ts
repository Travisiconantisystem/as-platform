import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

// GET 請求 - 獲取智能體的對話列表
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
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
      .select('id, name')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    // 獲取對話列表
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        message_count,
        last_message_at,
        status
      `)
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('獲取對話列表錯誤:', error)
      return NextResponse.json({ error: '獲取對話列表失敗' }, { status: 500 })
    }
    
    // 獲取總數
    const { count } = await supabase
      .from('ai_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('user_id', userId)
    
    return NextResponse.json({
      conversations: conversations || [],
      agent: {
        id: agent.id,
        name: agent.name
      },
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })
    
  } catch (error) {
    console.error('獲取對話列表錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// POST 請求 - 創建新對話
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const body = await request.json()
    const { userId, title, initialMessage } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 檢查智能體是否存在且可用
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('id, name, status')
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
    
    // 創建新對話
    const conversationId = uuidv4()
    const now = new Date().toISOString()
    
    const { data: conversation, error: conversationError } = await supabase
      .from('ai_conversations')
      .insert({
        id: conversationId,
        agent_id: agentId,
        user_id: userId,
        title: title || `與 ${agent.name} 的對話`,
        message_count: initialMessage ? 1 : 0,
        last_message_at: initialMessage ? now : null,
        status: 'active',
        created_at: now,
        updated_at: now
      })
      .select()
      .single()
    
    if (conversationError) {
      console.error('創建對話錯誤:', conversationError)
      return NextResponse.json({ error: '創建對話失敗' }, { status: 500 })
    }
    
    // 如果有初始消息，添加到對話中
    if (initialMessage) {
      const { error: messageError } = await supabase
        .from('ai_messages')
        .insert({
          id: uuidv4(),
          conversation_id: conversationId,
          role: 'user',
          content: initialMessage,
          created_at: now
        })
      
      if (messageError) {
        console.error('添加初始消息錯誤:', messageError)
      }
    }
    
    return NextResponse.json({
      success: true,
      conversation: conversation,
      message: '對話創建成功'
    })
    
  } catch (error) {
    console.error('創建對話錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}