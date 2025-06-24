import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AIAgent {
  id: string
  name: string
  description: string
  type: 'customer_service' | 'sales' | 'content_creation' | 'data_analysis' | 'lead_qualification' | 'email_automation'
  status: 'active' | 'inactive' | 'training' | 'error'
  userId: string
  config: {
    model: 'claude-3' | 'gpt-4' | 'custom'
    temperature: number
    maxTokens: number
    systemPrompt: string
    knowledgeBase: string[]
    tools: string[]
    webhookUrl?: string
  }
  performance: {
    accuracy: number
    responseTime: number
    completedTasks: number
    successRate: number
    totalInteractions: number
    avgSatisfactionScore?: number
  }
  lastActivity?: {
    timestamp: string
    action: string
    result: 'success' | 'error'
    details?: string
  }
  training: {
    status: 'not_started' | 'in_progress' | 'completed' | 'failed'
    progress: number
    datasetSize: number
    lastTrainingDate?: string
    accuracy?: number
  }
  createdAt: string
  updatedAt: string
}

export interface AIConversation {
  id: string
  agentId: string
  userId?: string
  sessionId: string
  status: 'active' | 'completed' | 'escalated'
  messages: {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
    metadata?: Record<string, any>
  }[]
  context: {
    platform?: string
    customerInfo?: Record<string, any>
    intent?: string
    sentiment?: 'positive' | 'neutral' | 'negative'
  }
  metrics: {
    responseTime: number
    satisfactionScore?: number
    resolved: boolean
    escalated: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface AgentTemplate {
  type: AIAgent['type']
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  defaultConfig: Partial<AIAgent['config']>
  useCases: string[]
  requiredIntegrations?: string[]
}

export interface AIAgentState {
  agents: AIAgent[]
  conversations: AIConversation[]
  templates: AgentTemplate[]
  isLoading: boolean
  selectedAgent: AIAgent | null
  selectedConversation: AIConversation | null
  
  // Actions
  setAgents: (agents: AIAgent[]) => void
  addAgent: (agent: AIAgent) => void
  updateAgent: (id: string, updates: Partial<AIAgent>) => void
  deleteAgent: (id: string) => void
  setSelectedAgent: (agent: AIAgent | null) => void
  
  // Conversation actions
  setConversations: (conversations: AIConversation[]) => void
  addConversation: (conversation: AIConversation) => void
  updateConversation: (id: string, updates: Partial<AIConversation>) => void
  setSelectedConversation: (conversation: AIConversation | null) => void
  
  // Template actions
  setTemplates: (templates: AgentTemplate[]) => void
  
  // API actions
  fetchAgents: () => Promise<void>
  createAgent: (data: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  trainAgent: (id: string, dataset?: any[]) => Promise<boolean>
  testAgent: (id: string, message: string) => Promise<string | null>
  fetchConversations: (agentId?: string) => Promise<void>
  sendMessage: (agentId: string, message: string, context?: any) => Promise<boolean>
  fetchTemplates: () => Promise<void>
}

export const useAIAgentStore = create<AIAgentState>()(
  persist(
    (set, get) => ({
      agents: [],
      conversations: [],
      templates: [],
      isLoading: false,
      selectedAgent: null,
      selectedConversation: null,

      setAgents: (agents) => {
        set({ agents })
      },

      addAgent: (agent) => {
        set((state) => ({
          agents: [...state.agents, agent]
        }))
      },

      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map(a => 
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          )
        }))
      },

      deleteAgent: (id) => {
        set((state) => ({
          agents: state.agents.filter(a => a.id !== id),
          selectedAgent: state.selectedAgent?.id === id ? null : state.selectedAgent
        }))
      },

      setSelectedAgent: (agent) => {
        set({ selectedAgent: agent })
      },

      setConversations: (conversations) => {
        set({ conversations })
      },

      addConversation: (conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations]
        }))
      },

      updateConversation: (id, updates) => {
        set((state) => ({
          conversations: state.conversations.map(c => 
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          )
        }))
      },

      setSelectedConversation: (conversation) => {
        set({ selectedConversation: conversation })
      },

      setTemplates: (templates) => {
        set({ templates })
      },

      fetchAgents: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/ai-agents')
          if (response.ok) {
            const agents = await response.json()
            get().setAgents(agents)
          } else {
            throw new Error('獲取AI智能體失敗')
          }
        } catch (error) {
          console.error('獲取AI智能體錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createAgent: async (data) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/ai-agents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (response.ok) {
            const newAgent = await response.json()
            get().addAgent(newAgent)
            return true
          } else {
            const error = await response.json()
            throw new Error(error.message || '創建AI智能體失敗')
          }
        } catch (error) {
          console.error('創建AI智能體錯誤:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      trainAgent: async (id, dataset) => {
        try {
          // 更新訓練狀態
          get().updateAgent(id, {
            training: {
              status: 'in_progress',
              progress: 0,
              datasetSize: dataset?.length || 0
            }
          })
          
          const response = await fetch(`/api/ai-agents/${id}/train`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dataset }),
          })

          if (response.ok) {
            const result = await response.json()
            get().updateAgent(id, {
              training: {
                status: 'completed',
                progress: 100,
                datasetSize: dataset?.length || 0,
                lastTrainingDate: new Date().toISOString(),
                accuracy: result.accuracy
              }
            })
            return true
          } else {
            const error = await response.json()
            get().updateAgent(id, {
              training: {
                status: 'failed',
                progress: 0,
                datasetSize: dataset?.length || 0
              }
            })
            throw new Error(error.message || '訓練AI智能體失敗')
          }
        } catch (error) {
          console.error('訓練AI智能體錯誤:', error)
          return false
        }
      },

      testAgent: async (id, message) => {
        try {
          const response = await fetch(`/api/ai-agents/${id}/test`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          })

          if (response.ok) {
            const result = await response.json()
            return result.response
          } else {
            throw new Error('測試AI智能體失敗')
          }
        } catch (error) {
          console.error('測試AI智能體錯誤:', error)
          return null
        }
      },

      fetchConversations: async (agentId) => {
        set({ isLoading: true })
        
        try {
          const url = agentId 
            ? `/api/ai-agents/${agentId}/conversations`
            : '/api/conversations'
          
          const response = await fetch(url)
          if (response.ok) {
            const conversations = await response.json()
            get().setConversations(conversations)
          } else {
            throw new Error('獲取對話記錄失敗')
          }
        } catch (error) {
          console.error('獲取對話記錄錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      sendMessage: async (agentId, message, context) => {
        try {
          const response = await fetch(`/api/ai-agents/${agentId}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, context }),
          })

          if (response.ok) {
            const result = await response.json()
            // 更新對話記錄
            if (result.conversation) {
              get().addConversation(result.conversation)
            }
            return true
          } else {
            throw new Error('發送消息失敗')
          }
        } catch (error) {
          console.error('發送消息錯誤:', error)
          return false
        }
      },

      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/ai-agents/templates')
          if (response.ok) {
            const templates = await response.json()
            get().setTemplates(templates)
          } else {
            throw new Error('獲取智能體模板失敗')
          }
        } catch (error) {
          console.error('獲取智能體模板錯誤:', error)
        }
      },
    }),
    {
      name: 'ai-agent-storage',
      partialize: (state) => ({ 
        agents: state.agents,
        selectedAgent: state.selectedAgent 
      }),
    }
  )
)