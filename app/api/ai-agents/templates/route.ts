import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// 預定義的智能體模板
const AGENT_TEMPLATES = [
  {
    id: 'email-assistant',
    name: '郵件助手',
    description: '專門用於生成個性化郵件和外展內容的 AI 智能體',
    category: 'marketing',
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: `你是一個專業的郵件助手，專門幫助用戶創建個性化和有效的商業郵件。你的任務包括：

1. 分析收件人的背景和需求
2. 創建引人注目的主題行
3. 撰寫個性化的郵件內容
4. 確保郵件語調專業且友好
5. 包含明確的行動呼籲

請始終保持專業、簡潔且具有說服力的寫作風格。`,
      tools: ['email_generation', 'subject_line_optimization', 'personalization']
    },
    tags: ['郵件', '營銷', '外展', '個性化'],
    useCases: [
      '冷郵件外展',
      '客戶跟進',
      '產品推廣',
      '合作邀請'
    ]
  },
  {
    id: 'content-analyzer',
    name: '內容分析師',
    description: '分析內容表現和提供優化建議的 AI 智能體',
    category: 'analytics',
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.3,
      maxTokens: 1500,
      systemPrompt: `你是一個專業的內容分析師，專門分析各種內容的表現並提供優化建議。你的職責包括：

1. 分析內容的參與度指標
2. 識別內容的優勢和弱點
3. 提供具體的優化建議
4. 預測內容的潛在表現
5. 建議最佳發布時間和平台

請提供數據驅動的洞察和可執行的建議。`,
      tools: ['content_analysis', 'performance_metrics', 'optimization_suggestions']
    },
    tags: ['分析', '內容', '優化', '指標'],
    useCases: [
      '社交媒體內容分析',
      '博客文章優化',
      '廣告文案評估',
      '內容策略制定'
    ]
  },
  {
    id: 'lead-scorer',
    name: '潛在客戶評分員',
    description: '評估和評分潛在客戶質量的 AI 智能體',
    category: 'sales',
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.2,
      maxTokens: 1000,
      systemPrompt: `你是一個專業的潛在客戶評分專家，專門評估潛在客戶的質量和轉化可能性。你的任務包括：

1. 分析潛在客戶的基本信息
2. 評估其購買意向和能力
3. 計算潛在客戶評分
4. 提供跟進建議
5. 識別高價值機會

請基於數據和行為模式提供客觀的評分和建議。`,
      tools: ['lead_scoring', 'qualification_analysis', 'follow_up_recommendations']
    },
    tags: ['銷售', '潛在客戶', '評分', '轉化'],
    useCases: [
      '潛在客戶資格認定',
      '銷售優先級排序',
      '轉化率預測',
      '銷售策略制定'
    ]
  },
  {
    id: 'automation-advisor',
    name: '自動化顧問',
    description: '建議業務流程自動化方案的 AI 智能體',
    category: 'automation',
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.5,
      maxTokens: 2500,
      systemPrompt: `你是一個專業的業務自動化顧問，專門幫助企業識別和實施自動化機會。你的專長包括：

1. 分析現有業務流程
2. 識別自動化機會
3. 推薦合適的自動化工具
4. 評估投資回報率
5. 制定實施計劃

請提供實用、可行且具有成本效益的自動化建議。`,
      tools: ['process_analysis', 'automation_recommendations', 'roi_calculation']
    },
    tags: ['自動化', '流程', '效率', '優化'],
    useCases: [
      '業務流程優化',
      '工作流程自動化',
      '效率提升方案',
      '成本節約分析'
    ]
  },
  {
    id: 'customer-service',
    name: '客戶服務助手',
    description: '提供專業客戶服務支持的 AI 智能體',
    category: 'support',
    config: {
      model: 'claude-3-sonnet',
      temperature: 0.6,
      maxTokens: 1500,
      systemPrompt: `你是一個專業的客戶服務代表，致力於為客戶提供優質的服務體驗。你的職責包括：

1. 理解客戶的問題和需求
2. 提供準確和有用的信息
3. 解決客戶的疑慮和問題
4. 保持友好和專業的態度
5. 必要時升級到人工客服

請始終以客戶為中心，提供耐心、友好且有效的服務。`,
      tools: ['issue_resolution', 'information_lookup', 'escalation_management']
    },
    tags: ['客服', '支持', '解決方案', '溝通'],
    useCases: [
      '常見問題解答',
      '技術支持',
      '訂單查詢',
      '投訴處理'
    ]
  }
]

// GET 請求 - 獲取智能體模板列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let filteredTemplates = AGENT_TEMPLATES
    
    // 按類別篩選
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        template => template.category === category
      )
    }
    
    // 按搜索關鍵詞篩選
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(
        template => 
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }
    
    // 獲取可用的類別
    const categories = [...new Set(AGENT_TEMPLATES.map(t => t.category))]
    
    return NextResponse.json({
      templates: filteredTemplates,
      categories: categories,
      total: filteredTemplates.length
    })
    
  } catch (error) {
    console.error('獲取智能體模板錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}

// POST 請求 - 基於模板創建智能體
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, userId, customizations } = body
    
    if (!templateId || !userId) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      )
    }
    
    // 查找模板
    const template = AGENT_TEMPLATES.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json(
        { error: '模板不存在' },
        { status: 404 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 創建智能體配置
    const agentConfig = {
      ...template.config,
      ...customizations?.config
    }
    
    const agentData = {
      user_id: userId,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      config: agentConfig,
      status: 'active',
      template_id: templateId,
      tags: customizations?.tags || template.tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: {
        totalConversations: 0,
        totalMessages: 0,
        averageResponseTime: 0,
        successRate: 0
      },
      training: {
        status: 'ready',
        progress: 100,
        datasetSize: 0
      }
    }
    
    // 插入新智能體
    const { data: newAgent, error } = await supabase
      .from('ai_agents')
      .insert(agentData)
      .select()
      .single()
    
    if (error) {
      console.error('創建智能體錯誤:', error)
      return NextResponse.json({ error: '創建智能體失敗' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      agent: newAgent,
      template: {
        id: template.id,
        name: template.name,
        category: template.category
      },
      message: '智能體創建成功'
    })
    
  } catch (error) {
    console.error('基於模板創建智能體錯誤:', error)
    return NextResponse.json({ error: '服務器內部錯誤' }, { status: 500 })
  }
}