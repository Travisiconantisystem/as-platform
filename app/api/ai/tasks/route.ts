import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { 
  sendToN8NWebhook,
  checkTaskStatus,
  cancelTask,
  N8NWebhookRequest,
  batchSendToN8N
} from '@/lib/n8n/webhook-client'

export async function POST(request: NextRequest) {
  try {
    const { taskType, data, userId, batch } = await request.json()
    const supabase = await createServerClient()
    
    // 檢查用戶認證
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }
    
    let result
    let taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 批量處理
    if (batch && Array.isArray(data)) {
      result = await batchSendToN8N(data, userId)
      
      // 保存批量任務結果
      const { error } = await supabase
        .from('ai_tasks')
        .insert({
          task_id: taskId,
          user_id: userId,
          task_type: 'batch_processing',
          input_data: data,
          result: result,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to save batch task' }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        taskId, 
        results: result,
        type: 'batch'
      })
    }
    
    // 單個任務處理 - 使用 N8N Webhook
    try {
      // 發送任務到 N8N Webhook
      const webhookRequest: N8NWebhookRequest = {
        workflowId: `${taskType}_workflow`,
        taskType,
        data,
        userId,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n-callback`,
        priority: 'normal'
      }
      
      const webhookResponse = await sendToN8NWebhook(webhookRequest)
      
      if (!webhookResponse.success) {
        return NextResponse.json({ 
          error: webhookResponse.error || 'Failed to queue task',
          taskId: null
        }, { status: 500 })
      }
      
      // 返回執行 ID 和狀態
      return NextResponse.json({ 
        success: true, 
        taskId: webhookResponse.executionId,
        status: webhookResponse.status,
        message: 'Task queued successfully. Results will be available via webhook callback.',
        type: 'async'
      })
      
    } catch (error) {
      console.error('AI task processing error:', error)
      return NextResponse.json({ 
        error: 'Failed to process AI task',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('AI task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET 請求 - 檢查任務狀態
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }
    
    const status = await checkTaskStatus(taskId)
    
    return NextResponse.json({
      success: true,
      taskId,
      ...status
    })
  } catch (error) {
    console.error('Task status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check task status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE 請求 - 取消任務
export async function DELETE(request: NextRequest) {
  try {
    const { taskId, userId } = await request.json()
    
    if (!taskId || !userId) {
      return NextResponse.json({ error: 'Task ID and User ID required' }, { status: 400 })
    }
    
    const cancelled = await cancelTask(taskId, userId)
    
    if (cancelled) {
      return NextResponse.json({
        success: true,
        message: 'Task cancelled successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to cancel task'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Task cancellation error:', error)
    return NextResponse.json({ 
      error: 'Failed to cancel task',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}