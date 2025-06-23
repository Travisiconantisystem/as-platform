import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Integration {
  id: string
  platform: 'apollo' | 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'email' | 'slack' | 'discord'
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  userId: string
  config: {
    apiKey?: string
    accessToken?: string
    refreshToken?: string
    webhookUrl?: string
    settings: Record<string, any>
  }
  lastSync?: {
    timestamp: string
    status: 'success' | 'error'
    recordsProcessed?: number
    errorMessage?: string
  }
  syncProgress?: {
    current: number
    total: number
    percentage: number
  }
  dataCount: {
    contacts?: number
    messages?: number
    posts?: number
    campaigns?: number
  }
  createdAt: string
  updatedAt: string
}

export interface PlatformTemplate {
  platform: Integration['platform']
  name: string
  description: string
  icon: string
  color: string
  features: string[]
  requiredFields: {
    name: string
    type: 'text' | 'password' | 'url' | 'select'
    label: string
    placeholder?: string
    required: boolean
    options?: { label: string; value: string }[]
  }[]
  webhookSupport: boolean
  apiDocUrl?: string
}

interface IntegrationState {
  integrations: Integration[]
  templates: PlatformTemplate[]
  isLoading: boolean
  selectedIntegration: Integration | null
  
  // Actions
  setIntegrations: (integrations: Integration[]) => void
  addIntegration: (integration: Integration) => void
  updateIntegration: (id: string, updates: Partial<Integration>) => void
  deleteIntegration: (id: string) => void
  setSelectedIntegration: (integration: Integration | null) => void
  setTemplates: (templates: PlatformTemplate[]) => void
  
  // API actions
  fetchIntegrations: () => Promise<void>
  connectPlatform: (platform: Integration['platform'], config: any) => Promise<boolean>
  disconnectPlatform: (id: string) => Promise<boolean>
  syncPlatform: (id: string) => Promise<boolean>
  testConnection: (id: string) => Promise<boolean>
  fetchTemplates: () => Promise<void>
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set, get) => ({
      integrations: [],
      templates: [],
      isLoading: false,
      selectedIntegration: null,

      setIntegrations: (integrations) => {
        set({ integrations })
      },

      addIntegration: (integration) => {
        set((state) => ({
          integrations: [...state.integrations, integration]
        }))
      },

      updateIntegration: (id, updates) => {
        set((state) => ({
          integrations: state.integrations.map(i => 
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          )
        }))
      },

      deleteIntegration: (id) => {
        set((state) => ({
          integrations: state.integrations.filter(i => i.id !== id),
          selectedIntegration: state.selectedIntegration?.id === id ? null : state.selectedIntegration
        }))
      },

      setSelectedIntegration: (integration) => {
        set({ selectedIntegration: integration })
      },

      setTemplates: (templates) => {
        set({ templates })
      },

      fetchIntegrations: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/integrations')
          if (response.ok) {
            const integrations = await response.json()
            get().setIntegrations(integrations)
          } else {
            throw new Error('獲取平台整合失敗')
          }
        } catch (error) {
          console.error('獲取平台整合錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      connectPlatform: async (platform, config) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/integrations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ platform, config }),
          })

          if (response.ok) {
            const newIntegration = await response.json()
            get().addIntegration(newIntegration)
            return true
          } else {
            const error = await response.json()
            throw new Error(error.message || '連接平台失敗')
          }
        } catch (error) {
          console.error('連接平台錯誤:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      disconnectPlatform: async (id) => {
        try {
          const response = await fetch(`/api/integrations/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            get().deleteIntegration(id)
            return true
          } else {
            throw new Error('斷開平台連接失敗')
          }
        } catch (error) {
          console.error('斷開平台連接錯誤:', error)
          return false
        }
      },

      syncPlatform: async (id) => {
        try {
          // 更新狀態為同步中
          get().updateIntegration(id, { status: 'syncing' })
          
          const response = await fetch(`/api/integrations/${id}/sync`, {
            method: 'POST',
          })

          if (response.ok) {
            const result = await response.json()
            get().updateIntegration(id, {
              status: 'connected',
              lastSync: {
                timestamp: new Date().toISOString(),
                status: 'success',
                recordsProcessed: result.recordsProcessed
              }
            })
            return true
          } else {
            const error = await response.json()
            get().updateIntegration(id, {
              status: 'error',
              lastSync: {
                timestamp: new Date().toISOString(),
                status: 'error',
                errorMessage: error.message
              }
            })
            throw new Error(error.message || '同步平台數據失敗')
          }
        } catch (error) {
          console.error('同步平台數據錯誤:', error)
          return false
        }
      },

      testConnection: async (id) => {
        try {
          const response = await fetch(`/api/integrations/${id}/test`, {
            method: 'POST',
          })

          if (response.ok) {
            get().updateIntegration(id, { status: 'connected' })
            return true
          } else {
            get().updateIntegration(id, { status: 'error' })
            return false
          }
        } catch (error) {
          console.error('測試連接錯誤:', error)
          get().updateIntegration(id, { status: 'error' })
          return false
        }
      },

      fetchTemplates: async () => {
        try {
          const response = await fetch('/api/integrations/templates')
          if (response.ok) {
            const templates = await response.json()
            get().setTemplates(templates)
          } else {
            throw new Error('獲取平台模板失敗')
          }
        } catch (error) {
          console.error('獲取平台模板錯誤:', error)
        }
      },
    }),
    {
      name: 'integration-storage',
      partialize: (state) => ({ 
        integrations: state.integrations,
        selectedIntegration: state.selectedIntegration 
      }),
    }
  )
)