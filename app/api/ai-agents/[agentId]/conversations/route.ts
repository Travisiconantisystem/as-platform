import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'


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
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('獲取對話列表錯誤:', error)
      return NextResponse.json(
        { error: '獲取對話列表失敗' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      conversations: conversations || [],
      agent: {
        id: agent.id,
        name: agent.name
      },
      hasMore: conversations?.length === limit
    })
    
  } catch (error) {
    console.error('獲取對話列表錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
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
    
    // 創建新對話
    const conversationData = {
      agent_id: agentId,
      user_id: userId,
      title: title || (initialMessage ? initialMessage.substring(0, 50) + (initialMessage.length > 50 ? '...' : '') : '新對話'),
      status: 'active',
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: conversation, error: createError } = await supabase
      .from('ai_conversations')
      .insert(conversationData)
      .select()
      .single()
    
    if (createError) {
      console.error('創建對話錯誤:', createError)
      return NextResponse.json(
        { error: '創建對話失敗' },
        { status: 500 }
      )
    }
    
    // 如果有初始消息，保存它
    if (initialMessage) {
      const { error: messageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'user',
          content: initialMessage,
          created_at: new Date().toISOString()
        })
      
      if (messageError) {
        console.error('保存初始消息錯誤:', messageError)
        // 不返回錯誤，因為對話已經創建成功
      } else {
        // 更新對話的消息計數
        await supabase
          .from('ai_conversations')
          .update({
            message_count: 1,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id)
      }
    }
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        status: conversation.status,
        created_at: conversation.created_at
      }
    })
    
  } catch (error) {
    console.error('創建對話錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}

// DELETE 請求 - 刪除對話
export async function DELETE(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    
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
      .select('id')
      .eq('id', conversationId)
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .single()
    
    if (convError || !conversation) {
      return NextResponse.json({ error: '對話不存在' }, { status: 404 })
    }
    
    // 刪除對話（級聯刪除相關消息）
    const { error: deleteError } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId)
    
    if (deleteError) {
      console.error('刪除對話錯誤:', deleteError)
      return NextResponse.json(
        { error: '刪除對話失敗' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('刪除對話錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}