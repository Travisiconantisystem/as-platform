// N8N Webhook 客戶端 - 替代直接 Claude API 調用
import { createServerClient } from '@/lib/supabase/client'

export interface N8NWebhookRequest {
  workflowId: string
  taskType: string
  data: any
  userId: string
  callbackUrl?: string
  priority?: 'low' | 'normal' | 'high'
  timeout?: number
}

export interface N8NWebhookResponse {
  success: boolean
  executionId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  message?: string
  error?: string
}

// N8N 工作流程端點配置
const N8N_WORKFLOWS = {
  email_generation: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/email-generation`,
    method: 'POST'
  },
  content_analysis: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/content-analysis`,
    method: 'POST'
  },
  lead_scoring: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/lead-scoring`,
    method: 'POST'
  },
  automation_suggestion: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/automation-suggestion`,
    method: 'POST'
  },
  agent_training: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/agent-training`,
    method: 'POST'
  },
  agent_test: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/agent-test`,
    method: 'POST'
  },
  agent_chat: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/agent-chat`,
    method: 'POST'
  },
  agent_config_update: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/agent-config-update`,
    method: 'POST'
  },
  agent_cleanup: {
    url: `${process.env.N8N_WEBHOOK_URL}/webhook/agent-cleanup`,
    method: 'POST'
  }
}

/**
 * 發送任務到 N8N Webhook
 */
export async function sendToN8NWebhook(request: N8NWebhookRequest): Promise<N8NWebhookResponse> {
  try {
    const workflow = N8N_WORKFLOWS[request.taskType as keyof typeof N8N_WORKFLOWS]
    
    if (!workflow) {
      throw new Error(`不支援的任務類型: ${request.taskType}`)
    }

    // 生成執行 ID
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 準備 webhook 負載
    const webhookPayload = {
      executionId,
      workflowId: request.workflowId || (workflow as any).workflowId,
      taskType: request.taskType,
      userId: request.userId,
      data: request.data,
      callbackUrl: request.callbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n-callback`,
      priority: request.priority || 'normal',
      timeout: request.timeout || 300000, // 5分鐘默認超時
      timestamp: new Date().toISOString(),
      source: 'as-platform'
    }

    // 發送到 N8N webhook
    const response = await fetch(workflow.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
        'X-Webhook-Source': 'as-platform',
        'X-Execution-Id': executionId
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!response.ok) {
      throw new Error(`N8N Webhook 請求失敗: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // 記錄到數據庫
    await logWebhookExecution({
      executionId,
      workflowId: workflow.workflowId,
      taskType: request.taskType,
      userId: request.userId,
      status: 'queued',
      inputData: request.data,
      webhookUrl: workflow.webhookUrl
    })

    return {
      success: true,
      executionId,
      status: 'queued',
      message: 'Task queued successfully'
    }

  } catch (error) {
    console.error('N8N Webhook 發送錯誤:', error)
    return {
      success: false,
      executionId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 批量發送任務到 N8N
 */
export async function batchSendToN8N(tasks: Array<{ taskType: string; data: any }>, userId: string): Promise<N8NWebhookResponse[]> {
  const results: N8NWebhookResponse[] = []
  
  // 並行處理批量任務
  const promises = tasks.map(task => 
    sendToN8NWebhook({
      workflowId: N8N_WORKFLOWS[task.taskType as keyof typeof N8N_WORKFLOWS]?.workflowId || '',
      taskType: task.taskType,
      data: task.data,
      userId,
      priority: 'normal'
    })
  )
  
  const responses = await Promise.allSettled(promises)
  
  responses.forEach((response, index) => {
    if (response.status === 'fulfilled') {
      results.push(response.value)
    } else {
      results.push({
        success: false,
        executionId: '',
        status: 'failed',
        error: `批量任務 ${index + 1} 失敗: ${response.reason}`
      })
    }
  })
  
  return results
}

/**
 * 記錄 Webhook 執行到數據庫
 */
async function logWebhookExecution(data: {
  executionId: string
  workflowId: string
  taskType: string
  userId: string
  status: string
  inputData: any
  webhookUrl: string
}) {
  try {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('ai_tasks')
      .insert({
        task_id: data.executionId,
        user_id: data.userId,
        task_type: data.taskType,
        input_data: data.inputData,
        status: data.status,
        workflow_id: data.workflowId,
        webhook_url: data.webhookUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('記錄 Webhook 執行錯誤:', error)
    }
  } catch (error) {
    console.error('數據庫記錄錯誤:', error)
  }
}

/**
 * 檢查任務狀態
 */
export async function checkTaskStatus(executionId: string): Promise<{
  status: string
  result?: any
  error?: string
  progress?: number
}> {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('ai_tasks')
      .select('*')
      .eq('task_id', executionId)
      .single()
    
    if (error || !data) {
      return {
        status: 'not_found',
        error: '找不到任務記錄'
      }
    }
    
    return {
      status: data.status,
      result: data.result,
      error: data.error_message,
      progress: data.progress
    }
  } catch (error) {
    console.error('檢查任務狀態錯誤:', error)
    return {
      status: 'error',
      error: '檢查狀態時發生錯誤'
    }
  }
}

/**
 * 取消任務
 */
export async function cancelTask(executionId: string, userId: string): Promise<boolean> {
  try {
    // 發送取消請求到 N8N
    const cancelUrl = `${process.env.N8N_BASE_URL}/api/v1/executions/${executionId}/stop`
    
    const response = await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      // 更新數據庫狀態
      const supabase = await createServerClient()
      await supabase
        .from('ai_tasks')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('task_id', executionId)
        .eq('user_id', userId)
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('取消任務錯誤:', error)
    return false
  }
}

// 向後兼容的函數包裝器
export async function generatePersonalizedEmail(contactData: any, userId: string): Promise<string> {
  const response = await sendToN8NWebhook({
    workflowId: 'email_gen_workflow',
    taskType: 'email-generation',
    data: contactData,
    userId
  })
  
  if (!response.success) {
    throw new Error(response.error || '郵件生成失敗')
  }
  
  // 返回執行 ID，實際結果將通過 webhook 回調
  return response.executionId
}

export async function analyzeContentPerformance(contentData: any, userId: string): Promise<string> {
  const response = await sendToN8NWebhook({
    workflowId: 'content_analysis_workflow',
    taskType: 'content-analysis',
    data: contentData,
    userId
  })
  
  if (!response.success) {
    throw new Error(response.error || '內容分析失敗')
  }
  
  return response.executionId
}

export async function scoreLeadQuality(leadData: any, userId: string): Promise<{ score: number; reasoning: string; executionId: string }> {
  const result = await sendToN8NWebhook({
    taskType: 'lead_scoring',
    leadData
  }, userId)
  
  return {
    score: result.data?.score || 0,
    reasoning: result.data?.reasoning || 'No reasoning provided',
    executionId: result.executionId
  }
}

// 自動化建議函數
export async function suggestAutomation(businessData: any, userId: string): Promise<string> {
  const result = await sendToN8NWebhook({
    taskType: 'automation_suggestion',
    businessData
  }, userId)
  
  return result.data?.suggestions || 'No automation suggestions available'
}

// 批量處理函數
export async function processBatchTasks(tasks: Array<{ type: string; data: any }>, userId: string): Promise<any[]> {
  return await batchSendToN8N(tasks.map(task => ({
    taskType: task.type,
    ...task.data
  })), userId)
}