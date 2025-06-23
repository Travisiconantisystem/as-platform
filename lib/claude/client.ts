import Anthropic from '@anthropic-ai/sdk'

// ⚠️ DEPRECATED: This file is deprecated and should not be used directly.
// All AI tasks should now go through N8N Webhook client instead.
// See: /lib/n8n/webhook-client.ts

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
  baseURL: process.env.CLAUDE_API_BASE_URL
})

export interface ClaudeRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  model?: string
}

export interface ClaudeResponse {
  content: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
  model: string
}

// ⚠️ DEPRECATED: Direct Claude API calls should be avoided. Use N8N Webhook client instead.
export async function callClaudeAPI(request: ClaudeRequest): Promise<ClaudeResponse> {
  console.warn('⚠️ DEPRECATED: callClaudeAPI is deprecated. Use N8N Webhook client instead.')
  
  try {
    const response = await anthropic.messages.create({
      model: request.model || 'claude-3-sonnet-20240229',
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
      system: request.systemPrompt || 'You are a helpful AI assistant for automation tasks.',
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    })

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      },
      model: response.model
    }
  } catch (error) {
    console.error('Claude API error:', error)
    throw new Error(`Claude API call failed: ${error}`)
  }
}

// 專用AI任務函數
// ⚠️ DEPRECATED: Use sendToN8NWebhook with taskType 'email_generation' instead
export async function generatePersonalizedEmail(contactData: any): Promise<string> {
  console.warn('⚠️ DEPRECATED: generatePersonalizedEmail is deprecated. Use N8N Webhook client instead.')
  
  const prompt = `
    Generate a personalized cold email for the following contact:
    
    Name: ${contactData.name}
    Company: ${contactData.company}
    Title: ${contactData.title}
    LinkedIn: ${contactData.linkedinUrl}
    
    Requirements:
    - Professional and engaging tone
    - Mention specific details about their company/role
    - Clear value proposition
    - Call to action
    - Keep under 150 words
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 500,
    systemPrompt: 'You are an expert email copywriter specializing in B2B outreach.'
  })
  
  return response.content
}

// ⚠️ DEPRECATED: Use sendToN8NWebhook with taskType 'content_analysis' instead
export async function analyzeContentPerformance(contentData: any): Promise<string> {
  console.warn('⚠️ DEPRECATED: analyzeContentPerformance is deprecated. Use N8N Webhook client instead.')
  
  const prompt = `
    Analyze the performance of this social media content:
    
    Platform: ${contentData.platform}
    Content Type: ${contentData.type}
    Engagement Rate: ${contentData.engagementRate}%
    Likes: ${contentData.likes}
    Comments: ${contentData.comments}
    Shares: ${contentData.shares}
    Reach: ${contentData.reach}
    
    Provide:
    - Performance assessment (excellent/good/average/poor)
    - Key insights and patterns
    - Specific recommendations for improvement
    - Suggested content optimizations
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 800,
    systemPrompt: 'You are a social media analytics expert with deep knowledge of content optimization.'
  })
  
  return response.content
}

// ⚠️ DEPRECATED: Use sendToN8NWebhook with taskType 'lead_scoring' instead
export async function scoreLeadQuality(leadData: any): Promise<{ score: number; reasoning: string }> {
  console.warn('⚠️ DEPRECATED: scoreLeadQuality is deprecated. Use N8N Webhook client instead.')
  
  const prompt = `
    Score this lead's quality on a scale of 1-100:
    
    Company: ${leadData.company}
    Industry: ${leadData.industry}
    Company Size: ${leadData.companySize}
    Title: ${leadData.title}
    Seniority: ${leadData.seniority}
    Location: ${leadData.location}
    Recent Activity: ${leadData.recentActivity}
    
    Provide:
    - Numerical score (1-100)
    - Detailed reasoning for the score
    - Key factors that influenced the rating
    - Recommended next actions
    
    Format your response as JSON:
    {
      "score": number,
      "reasoning": "detailed explanation",
      "keyFactors": ["factor1", "factor2"],
      "nextActions": ["action1", "action2"]
    }
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 600,
    systemPrompt: 'You are a lead qualification expert with extensive B2B sales experience.'
  })
  
  try {
    const parsed = JSON.parse(response.content)
    return {
      score: parsed.score,
      reasoning: parsed.reasoning
    }
  } catch {
    return {
      score: 50,
      reasoning: response.content
    }
  }
}

// 工作流程優化建議
export async function optimizeWorkflow(workflowData: any): Promise<string> {
  const prompt = `
    Analyze this automation workflow and provide optimization suggestions:
    
    Workflow Name: ${workflowData.name}
    Steps: ${JSON.stringify(workflowData.steps, null, 2)}
    Current Performance: ${workflowData.performance}
    Execution Time: ${workflowData.executionTime}ms
    Success Rate: ${workflowData.successRate}%
    
    Provide:
    - Performance analysis
    - Bottleneck identification
    - Optimization recommendations
    - Estimated improvement potential
    - Implementation priority
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 1000,
    systemPrompt: 'You are a workflow optimization expert with deep knowledge of automation best practices.'
  })
  
  return response.content
}

// 數據洞察生成
export async function generateDataInsights(analyticsData: any): Promise<string> {
  const prompt = `
    Generate actionable insights from this analytics data:
    
    Platform: ${analyticsData.platform}
    Time Period: ${analyticsData.timePeriod}
    Metrics: ${JSON.stringify(analyticsData.metrics, null, 2)}
    Trends: ${JSON.stringify(analyticsData.trends, null, 2)}
    
    Provide:
    - Key performance indicators analysis
    - Trend identification and implications
    - Actionable recommendations
    - Growth opportunities
    - Risk factors to monitor
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 1200,
    systemPrompt: 'You are a data analyst expert specializing in digital marketing and automation analytics.'
  })
  
  return response.content
}

// 內容策略建議
export async function generateContentStrategy(brandData: any): Promise<string> {
  const prompt = `
    Create a content strategy based on this brand information:
    
    Brand: ${brandData.name}
    Industry: ${brandData.industry}
    Target Audience: ${brandData.targetAudience}
    Current Performance: ${JSON.stringify(brandData.currentPerformance, null, 2)}
    Goals: ${brandData.goals}
    
    Provide:
    - Content themes and topics
    - Posting frequency recommendations
    - Platform-specific strategies
    - Content format suggestions
    - Engagement optimization tactics
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 1000,
    systemPrompt: 'You are a content strategy expert with extensive experience in social media marketing and brand building.'
  })
  
  return response.content
}

// 競爭對手分析
export async function analyzeCompetitors(competitorData: any): Promise<string> {
  const prompt = `
    Analyze these competitors and provide strategic insights:
    
    Industry: ${competitorData.industry}
    Competitors: ${JSON.stringify(competitorData.competitors, null, 2)}
    Our Brand: ${competitorData.ourBrand}
    
    Provide:
    - Competitive landscape overview
    - Strengths and weaknesses analysis
    - Market positioning opportunities
    - Differentiation strategies
    - Actionable recommendations
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 1200,
    systemPrompt: 'You are a competitive intelligence expert with deep knowledge of market analysis and strategic positioning.'
  })
  
  return response.content
}

// ⚠️ DEPRECATED: Use sendToN8NWebhook with taskType 'automation_suggestion' instead
export async function suggestAutomation(businessData: any): Promise<string> {
  console.warn('⚠️ DEPRECATED: suggestAutomation is deprecated. Use N8N Webhook client instead.')
  
  const prompt = `
    Suggest automation opportunities for this business:
    
    Business Type: ${businessData.type}
    Current Processes: ${JSON.stringify(businessData.processes, null, 2)}
    Pain Points: ${businessData.painPoints}
    Goals: ${businessData.goals}
    Resources: ${businessData.resources}
    
    Provide:
    - Automation opportunity identification
    - Implementation priority ranking
    - Expected ROI and time savings
    - Required tools and integrations
    - Step-by-step implementation plan
  `
  
  const response = await callClaudeAPI({
    prompt,
    maxTokens: 1200,
    systemPrompt: 'You are an automation consultant expert with extensive experience in business process optimization and digital transformation.'
  })
  
  return response.content
}

// 使用量追蹤
export async function trackUsage(userId: string, taskType: string, tokens: number, cost: number) {
  // 這裡可以添加使用量追蹤邏輯
  console.log(`User ${userId} used ${tokens} tokens for ${taskType}, cost: $${cost}`)
}

// ⚠️ DEPRECATED: Use batchSendToN8N from N8N Webhook client instead
export async function batchProcess(tasks: Array<{ type: string; data: any }>) {
  console.warn('⚠️ DEPRECATED: batchProcess is deprecated. Use batchSendToN8N from N8N Webhook client instead.')
  
  const results = []
  
  for (const task of tasks) {
    try {
      let result
      switch (task.type) {
        case 'email-generation':
          result = await generatePersonalizedEmail(task.data)
          break
        case 'content-analysis':
          result = await analyzeContentPerformance(task.data)
          break
        case 'lead-scoring':
          result = await scoreLeadQuality(task.data)
          break
        default:
          result = 'Unknown task type'
      }
      
      results.push({
        success: true,
        result,
        taskType: task.type
      })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        taskType: task.type
      })
    }
  }
  
  return results
}