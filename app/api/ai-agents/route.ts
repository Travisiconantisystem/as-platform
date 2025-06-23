import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendToN8NWebhook } from '@/lib/n8n/webhook-client'
import { v4 as uuidv4 } from 'uuid'

// AI 智能體模板
const AGENT_TEMPLATES = [
  {
    type: 'customer_service',
    name: '客戶服務助手',
    description: '處理客戶查詢、投訴和支援請求',
    icon: '🎧',
    color: 'blue',
    features: ['24/7 支援', '多語言支援', '情感分析', '自動升級'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: '你是一個專業的客戶服務代表，友善、耐心且樂於助人。',
      tools: ['knowledge_base', 'ticket_system', 'escalation']
    },
    useCases: ['客戶查詢', '技術支援', '投訴處理', '產品諮詢'],
    requiredIntegrations: ['zendesk', 'intercom']
  },
  {
    type: 'sales',
    name: '銷售助手',
    description: '協助潛在客戶開發和銷售流程',
    icon: '💼',
    color: 'green',
    features: ['潛在客戶評分', '個性化推薦', '跟進提醒', '銷售預測'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.8,
      maxTokens: 1200,
      systemPrompt: '你是一個專業的銷售顧問，了解客戶需求並提供合適的解決方案。',
      tools: ['crm_integration', 'lead_scoring', 'email_templates']
    },
    useCases: ['潛在客戶開發', '產品演示', '報價生成', '跟進管理'],
    requiredIntegrations: ['salesforce', 'hubspot']
  },
  {
    type: 'content_creation',
    name: '內容創作助手',
    description: '生成營銷內容、文章和社交媒體貼文',
    icon: '✍️',
    color: 'purple',
    features: ['多格式內容', 'SEO 優化', '品牌一致性', '內容排程'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.9,
      maxTokens: 2000,
      systemPrompt: '你是一個創意內容創作者，能夠生成吸引人且符合品牌調性的內容。',
      tools: ['seo_analysis', 'brand_guidelines', 'content_calendar']
    },
    useCases: ['部落格文章', '社交媒體', '電子郵件營銷', '廣告文案'],
    requiredIntegrations: ['wordpress', 'hootsuite']
  },
  {
    type: 'data_analysis',
    name: '數據分析助手',
    description: '分析業務數據並提供洞察和建議',
    icon: '📊',
    color: 'orange',
    features: ['自動報告', '趨勢分析', '預測模型', '視覺化圖表'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.3,
      maxTokens: 1500,
      systemPrompt: '你是一個數據分析專家，能夠解釋複雜的數據並提供可行的商業洞察。',
      tools: ['data_visualization', 'statistical_analysis', 'reporting']
    },
    useCases: ['銷售分析', '客戶行為', '市場趨勢', '性能監控'],
    requiredIntegrations: ['google_analytics', 'tableau']
  },
  {
    type: 'lead_qualification',
    name: '潛在客戶評估助手',
    description: '評估和分類潛在客戶的質量和意向',
    icon: '🎯',
    color: 'red',
    features: ['自動評分', '意向分析', '優先級排序', '跟進建議'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.5,
      maxTokens: 800,
      systemPrompt: '你是一個潛在客戶評估專家，能夠準確評估客戶的購買意向和價值。',
      tools: ['lead_scoring', 'intent_analysis', 'qualification_framework']
    },
    useCases: ['潛在客戶評分', '意向分析', '銷售優先級', '轉換預測'],
    requiredIntegrations: ['marketo', 'pardot']
  },
  {
    type: 'email_automation',
    name: '郵件自動化助手',
    description: '創建和管理個性化郵件營銷活動',
    icon: '📧',
    color: 'teal',
    features: ['個性化內容', 'A/B 測試', '自動跟進', '性能追蹤'],
    defaultConfig: {
      model: 'claude-3',
      temperature: 0.8,
      maxTokens: 1000,
      systemPrompt: '你是一個郵件營銷專家，能夠創建吸引人且有效的郵件內容。',
      tools: ['email_templates', 'personalization', 'ab_testing']
    },
    useCases: ['歡迎郵件', '產品推廣', '客戶挽回', '活動邀請'],
    requiredIntegrations: ['mailchimp', 'sendgrid']
  }
]

// GET 請求 - 獲取 AI 智能體列表或模板
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 如果請求模板
    if (type === 'templates') {
      return NextResponse.json(AGENT_TEMPLATES)
    }
    
    // 獲取用戶的 AI 智能體
    let query = supabase
      .from('ai_agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data: agents, error } = await query
    
    if (error) {
      console.error('獲取 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '獲取 AI 智能體失敗' }, { status: 500 })
    }
    
    return NextResponse.json(agents || [])
    
  } catch (error) {
    console.error('AI 智能體 API 錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// POST 請求 - 創建新的 AI 智能體
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      type,
      userId,
      config,
      knowledgeBase
    } = body
    
    if (!name || !type || !userId) {
      return NextResponse.json(
        { error: '缺少必要參數：name, type, userId' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    const agentId = uuidv4()
    
    // 創建 AI 智能體記錄
    const agentData = {
      id: agentId,
      name,
      description,
      type,
      user_id: userId,
      status: 'inactive',
      config: {
        model: 'claude-3',
        temperature: 0.7,
        maxTokens: 1000,
        systemPrompt: '',
        knowledgeBase: knowledgeBase || [],
        tools: [],
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks`,
        ...config
      },
      performance: {
        accuracy: 0,
        responseTime: 0,
        completedTasks: 0,
        successRate: 0,
        totalInteractions: 0
      },
      training: {
        status: 'not_started',
        progress: 0,
        datasetSize: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: newAgent, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single()
    
    if (error) {
      console.error('創建 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '創建 AI 智能體失敗' }, { status: 500 })
    }
    
    // 通過 N8N Webhook 初始化智能體
    try {
      await sendToN8NWebhook({
        taskType: 'agent_initialization',
        agentId: agentId,
        config: agentData.config,
        knowledgeBase: knowledgeBase
      }, userId)
    } catch (webhookError) {
      console.error('初始化智能體 Webhook 錯誤:', webhookError)
      // 不阻止智能體創建，但記錄錯誤
    }
    
    return NextResponse.json(newAgent)
    
  } catch (error) {
    console.error('創建 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// PUT 請求 - 更新 AI 智能體
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, ...updates } = body
    
    if (!id || !userId) {
      return NextResponse.json(
        { error: '缺少必要參數：id, userId' },
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
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('更新 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '更新 AI 智能體失敗' }, { status: 500 })
    }
    
    // 如果更新了配置，通知 N8N
    if (updates.config) {
      try {
        await sendToN8NWebhook({
          taskType: 'agent_config_update',
          agentId: id,
          config: updates.config
        }, userId)
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

// DELETE 請求 - 刪除 AI 智能體
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (!id || !userId) {
      return NextResponse.json(
        { error: '缺少必要參數：id, userId' },
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    
    if (error) {
      console.error('刪除 AI 智能體錯誤:', error)
      return NextResponse.json({ error: '刪除 AI 智能體失敗' }, { status: 500 })
    }
    
    // 通知 N8N 清理智能體資源
    try {
      await sendToN8NWebhook({
        taskType: 'agent_cleanup',
        agentId: id
      }, userId)
    } catch (webhookError) {
      console.error('清理智能體 Webhook 錯誤:', webhookError)
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('刪除 AI 智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}