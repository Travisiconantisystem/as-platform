import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { 
  sendToN8NWebhook,
  batchSendToN8N,
  checkTaskStatus,
  cancelTask,
  N8NWebhookRequest
} from '@/lib/n8n/webhook-client'

export async function POST(request: NextRequest) {
  try {
    const { taskType, data, userId, batch } = await request.json()
    const supabase = createServerClient()
    
    // 檢查用戶認證
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }
    
    let result
    let taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 批量處理
    if (batch && Array.isArray(data)) {
      result = await batchProcess(data)
      
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
    const userId = searchParams.get('userId')
    
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

// 輔助函數：更新用戶AI使用統計
async function updateUserAiUsage(supabase: any, userId: string, taskType: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // 檢查今日使用記錄是否存在
    const { data: existingUsage } = await supabase
      .from('user_ai_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (existingUsage) {
      // 更新現有記錄
      await supabase
        .from('user_ai_usage')
        .update({
          total_requests: existingUsage.total_requests + 1,
          [`${taskType.replace('-', '_')}_requests`]: (existingUsage[`${taskType.replace('-', '_')}_requests`] || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('date', today)
    } else {
      // 創建新記錄
      const newUsage = {
        user_id: userId,
        date: today,
        total_requests: 1,
        total_tokens: 0, // 這裡可以根據實際token使用量更新
        total_cost: 0, // 這裡可以根據實際成本更新
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      newUsage[`${taskType.replace('-', '_')}_requests`] = 1
      
      await supabase
        .from('user_ai_usage')
        .insert(newUsage)
    }
  } catch (error) {
    console.error('Failed to update AI usage:', error)
    // 不拋出錯誤，因為這不應該影響主要功能
  }
}