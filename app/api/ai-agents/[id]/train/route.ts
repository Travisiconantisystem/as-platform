import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendToN8NWebhook } from '@/lib/n8n/webhook-client'
import { v4 as uuidv4 } from 'uuid'

// POST 請求 - 訓練 AI 智能體
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { userId, dataset, trainingConfig } = body
    
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
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (agentError || !agent) {
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    // 更新智能體訓練狀態為進行中
    const { error: updateError } = await supabase
      .from('ai_agents')
      .update({
        training: {
          status: 'in_progress',
          progress: 0,
          datasetSize: dataset?.length || 0,
          lastTrainingDate: new Date().toISOString()
        },
        status: 'training',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (updateError) {
      console.error('更新訓練狀態錯誤:', updateError)
      return NextResponse.json({ error: '更新訓練狀態失敗' }, { status: 500 })
    }
    
    // 創建訓練任務 ID
    const trainingTaskId = uuidv4()
    
    // 記錄訓練任務
    const { error: taskError } = await supabase
      .from('ai_tasks')
      .insert({
        task_id: trainingTaskId,
        user_id: userId,
        task_type: 'agent_training',
        input_data: {
          agentId: id,
          dataset: dataset,
          config: trainingConfig
        },
        status: 'queued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (taskError) {
      console.error('記錄訓練任務錯誤:', taskError)
    }
    
    // 通過 N8N Webhook 開始訓練
    try {
      const webhookResult = await sendToN8NWebhook({
        taskType: 'agent_training',
        taskId: trainingTaskId,
        agentId: id,
        dataset: dataset,
        config: {
          ...agent.config,
          ...trainingConfig
        },
        trainingParams: {
          epochs: trainingConfig?.epochs || 10,
          batchSize: trainingConfig?.batchSize || 32,
          learningRate: trainingConfig?.learningRate || 0.001,
          validationSplit: trainingConfig?.validationSplit || 0.2
        }
      }, userId)
      
      return NextResponse.json({
        success: true,
        trainingTaskId,
        executionId: webhookResult.executionId,
        message: '訓練任務已開始，請等待完成通知',
        estimatedTime: Math.ceil((dataset?.length || 100) / 10) + ' 分鐘'
      })
      
    } catch (webhookError) {
      console.error('啟動訓練 Webhook 錯誤:', webhookError)
      
      // 回滾訓練狀態
      await supabase
        .from('ai_agents')
        .update({
          training: {
            status: 'failed',
            progress: 0,
            datasetSize: dataset?.length || 0
          },
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      return NextResponse.json(
        { error: '啟動訓練失敗', details: webhookError.message },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('訓練 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// GET 請求 - 獲取訓練狀態
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 獲取智能體訓練狀態
    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('training, status')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    
    if (error || !agent) {
      return NextResponse.json({ error: '智能體不存在' }, { status: 404 })
    }
    
    // 獲取最近的訓練任務
    const { data: recentTasks } = await supabase
      .from('ai_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_type', 'agent_training')
      .contains('input_data', { agentId: id })
      .order('created_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      training: agent.training,
      status: agent.status,
      recentTasks: recentTasks || []
    })
    
  } catch (error) {
    console.error('獲取訓練狀態錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}