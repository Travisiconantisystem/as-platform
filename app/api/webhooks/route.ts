import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import crypto from 'crypto'

// Webhook 事件驗證 schema
const webhookEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'workflow.started',
    'workflow.completed',
    'workflow.failed',
    'workflow.paused',
    'integration.connected',
    'integration.disconnected',
    'integration.error',
    'ai_agent.message',
    'ai_agent.training_completed',
    'ai_task.completed',
    'ai_task.failed',
    'platform.webhook',
    'n8n.execution'
  ]),
  source: z.enum(['n8n', 'supabase', 'claude', 'openai', 'zapier', 'make', 'internal']),
  timestamp: z.string(),
  data: z.record(z.any()),
  user_id: z.string().optional(),
  workflow_id: z.string().optional(),
  integration_id: z.string().optional(),
  agent_id: z.string().optional()
})

// 驗證 Webhook 簽名
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const providedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )
  } catch (error) {
    console.error('簽名驗證錯誤:', error)
    return false
  }
}

// 處理 AI 任務回調
async function handleAITaskCallback(
  event: any,
  supabase: any
) {
  try {
    const { taskId, taskType, status, result, error, userId, executionTime } = event
    
    // 更新 AI 任務狀態
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'completed' && result) {
      updateData.result = result
      updateData.completed_at = new Date().toISOString()
    }
    
    if (status === 'failed' && error) {
      updateData.error_message = error
      updateData.failed_at = new Date().toISOString()
    }
    
    if (executionTime) {
      updateData.execution_time = executionTime
    }
    
    const { error: updateError } = await supabase
      .from('ai_tasks')
      .update(updateData)
      .eq('task_id', taskId)
    
    if (updateError) {
      console.error('更新 AI 任務狀態錯誤:', updateError)
      return { success: false, error: updateError.message }
    }
    
    // 更新用戶 AI 使用統計
    if (status === 'completed' && userId) {
      const { data: userStats } = await supabase
        .from('user_ai_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()
      
      if (userStats) {
        await supabase
          .from('user_ai_usage')
          .update({
            total_tasks: userStats.total_tasks + 1,
            [`${taskType}_count`]: (userStats[`${taskType}_count`] || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', userStats.id)
      } else {
        await supabase
          .from('user_ai_usage')
          .insert({
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            total_tasks: 1,
            [`${taskType}_count`]: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
    }
    
    // 發送通知
    if (userId) {
      const notificationData = {
        user_id: userId,
        title: status === 'completed' ? 'AI 任務完成' : 'AI 任務失敗',
        message: status === 'completed' 
          ? `${taskType} 任務已成功完成` 
          : `${taskType} 任務執行失敗: ${error}`,
        type: status === 'completed' ? 'success' : 'error',
        category: 'ai_task',
        priority: status === 'failed' ? 'high' : 'medium',
        read: false,
        action_required: status === 'failed',
        action_url: `/ai-agents?taskId=${taskId}`,
        action_text: '查看詳情',
        metadata: {
          task_id: taskId,
          task_type: taskType,
          execution_time: executionTime
        },
        created_at: new Date().toISOString()
      }
      
      await supabase
        .from('notifications')
        .insert(notificationData)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('處理 AI 任務回調錯誤:', error)
    return { success: false, error: error.message }
  }
}

// 處理 N8N Webhook 事件
async function handleN8NWebhook(
  event: any,
  supabase: any
) {
  try {
    // 檢查是否為 AI 任務回調
    if (event.type === 'ai_task.completed' || event.type === 'ai_task.failed') {
      return await handleAITaskCallback(event, supabase)
    }
    
    const { workflowId, executionId, status, data, userId } = event
    
    // 記錄執行結果
    const executionData = {
      id: executionId,
      workflow_id: workflowId,
      user_id: userId,
      status: status === 'success' ? 'completed' : status === 'error' ? 'failed' : 'running',
      started_at: data.startedAt || new Date().toISOString(),
      completed_at: status !== 'running' ? new Date().toISOString() : null,
      execution_time: data.executionTime || null,
      input_data: data.inputData || {},
      output_data: data.outputData || {},
      error_message: data.error || null,
      node_executions: data.nodeExecutions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // 插入或更新執行記錄
    const { error: executionError } = await supabase
      .from('workflow_executions')
      .upsert(executionData)
    
    if (executionError) {
      console.error('記錄工作流程執行錯誤:', executionError)
    }
    
    // 更新工作流程統計
    if (status === 'success' || status === 'error') {
      const { data: workflow } = await supabase
        .from('workflows')
        .select('stats')
        .eq('id', workflowId)
        .single()
      
      if (workflow) {
        const currentStats = workflow.stats || {
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          avg_execution_time: 0
        }
        
        const newStats = {
          ...currentStats,
          total_executions: currentStats.total_executions + 1,
          successful_executions: status === 'success' 
            ? currentStats.successful_executions + 1 
            : currentStats.successful_executions,
          failed_executions: status === 'error' 
            ? currentStats.failed_executions + 1 
            : currentStats.failed_executions
        }
        
        // 計算平均執行時間
        if (data.executionTime) {
          newStats.avg_execution_time = (
            (currentStats.avg_execution_time * (currentStats.total_executions - 1) + data.executionTime) /
            currentStats.total_executions
          )
        }
        
        await supabase
          .from('workflows')
          .update({ 
            stats: newStats,
            last_executed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', workflowId)
      }
    }
    
    // 發送通知
    if (userId) {
      const notificationData = {
        user_id: userId,
        title: status === 'success' ? '工作流程執行成功' : 
               status === 'error' ? '工作流程執行失敗' : '工作流程開始執行',
        message: status === 'success' ? `工作流程 "${data.workflowName || workflowId}" 已成功完成` :
                 status === 'error' ? `工作流程 "${data.workflowName || workflowId}" 執行失敗: ${data.error}` :
                 `工作流程 "${data.workflowName || workflowId}" 開始執行`,
        type: status === 'success' ? 'success' : status === 'error' ? 'error' : 'info',
        category: 'workflow',
        priority: status === 'error' ? 'high' : 'medium',
        read: false,
        action_required: status === 'error',
        action_url: `/workflows/${workflowId}`,
        action_text: '查看詳情',
        metadata: {
          workflow_id: workflowId,
          execution_id: executionId,
          execution_time: data.executionTime
        },
        created_at: new Date().toISOString()
      }
      
      await supabase
        .from('notifications')
        .insert(notificationData)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('處理 N8N Webhook 錯誤:', error)
    return { success: false, error: error.message }
  }
}

// 處理第三方平台 Webhook
async function handlePlatformWebhook(
  event: any,
  platform: string,
  supabase: any
) {
  try {
    // 根據平台類型處理不同的 Webhook 事件
    switch (platform) {
      case 'stripe':
        return await handleStripeWebhook(event, supabase)
      case 'shopify':
        return await handleShopifyWebhook(event, supabase)
      case 'mailchimp':
        return await handleMailchimpWebhook(event, supabase)
      case 'slack':
        return await handleSlackWebhook(event, supabase)
      default:
        console.log(`未知平台 Webhook: ${platform}`, event)
        return { success: true, message: '已接收但未處理' }
    }
  } catch (error) {
    console.error(`處理 ${platform} Webhook 錯誤:`, error)
    return { success: false, error: error.message }
  }
}

// Stripe Webhook 處理
async function handleStripeWebhook(event: any, supabase: any) {
  // 處理 Stripe 訂閱、付款等事件
  console.log('Stripe Webhook:', event.type, event.data)
  return { success: true }
}

// Shopify Webhook 處理
async function handleShopifyWebhook(event: any, supabase: any) {
  // 處理 Shopify 訂單、產品等事件
  console.log('Shopify Webhook:', event)
  return { success: true }
}

// Mailchimp Webhook 處理
async function handleMailchimpWebhook(event: any, supabase: any) {
  // 處理 Mailchimp 訂閱、退訂等事件
  console.log('Mailchimp Webhook:', event)
  return { success: true }
}

// Slack Webhook 處理
async function handleSlackWebhook(event: any, supabase: any) {
  // 處理 Slack 消息、事件等
  console.log('Slack Webhook:', event)
  return { success: true }
}

// 主要 Webhook 處理函數
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') || 'unknown'
    const platform = searchParams.get('platform')
    
    // 獲取請求體
    const body = await request.text()
    const signature = request.headers.get('x-signature') || 
                     request.headers.get('x-hub-signature-256') ||
                     request.headers.get('stripe-signature')
    
    // 驗證簽名（如果提供）
    if (signature && process.env.WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        body,
        signature,
        process.env.WEBHOOK_SECRET
      )
      
      if (!isValid) {
        console.error('Webhook 簽名驗證失敗')
        return NextResponse.json(
          { error: '簽名驗證失敗' },
          { status: 401 }
        )
      }
    }
    
    let event
    try {
      event = JSON.parse(body)
    } catch (parseError) {
      console.error('Webhook 數據解析錯誤:', parseError)
      return NextResponse.json(
        { error: '無效的 JSON 數據' },
        { status: 400 }
      )
    }
    
    // 記錄 Webhook 事件
    const webhookLog = {
      source,
      platform,
      event_type: event.type || event.event || 'unknown',
      payload: event,
      headers: Object.fromEntries(request.headers.entries()),
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      processed: false,
      created_at: new Date().toISOString()
    }
    
    const { data: logEntry } = await supabase
      .from('webhook_logs')
      .insert(webhookLog)
      .select()
      .single()
    
    let result
    
    // 根據來源處理 Webhook
    switch (source) {
      case 'n8n':
        result = await handleN8NWebhook(event, supabase)
        break
      case 'platform':
        if (platform) {
          result = await handlePlatformWebhook(event, platform, supabase)
        } else {
          result = { success: false, error: '缺少平台參數' }
        }
        break
      default:
        console.log(`未知來源 Webhook: ${source}`, event)
        result = { success: true, message: '已接收但未處理' }
    }
    
    // 更新處理狀態
    if (logEntry) {
      await supabase
        .from('webhook_logs')
        .update({
          processed: true,
          processing_result: result,
          processed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id)
    }
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message || 'Webhook 處理成功'
      })
    } else {
      return NextResponse.json(
        { 
          error: result.error || 'Webhook 處理失敗' 
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Webhook API 錯誤:', error)
    return NextResponse.json(
      { error: '服務器內部錯誤' },
      { status: 500 }
    )
  }
}

// 處理 GET 請求（用於驗證 Webhook 端點）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('hub.challenge')
  const verify_token = searchParams.get('hub.verify_token')
  
  // Facebook/Meta Webhook 驗證
  if (challenge && verify_token) {
    if (verify_token === process.env.WEBHOOK_VERIFY_TOKEN) {
      return new NextResponse(challenge)
    } else {
      return NextResponse.json(
        { error: '驗證令牌不匹配' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.json({
    status: 'Webhook 端點運行正常',
    timestamp: new Date().toISOString()
  })
}

// 處理 OPTIONS 請求（CORS 預檢）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Signature, X-Hub-Signature-256, Stripe-Signature',
    },
  })
}