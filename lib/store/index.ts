// 統一導出所有 Zustand stores
export { useAuthStore } from './auth-store'
export type { User, AuthState } from './auth-store'

export { useWorkflowStore } from './workflow-store'
export type { 
  Workflow, 
  WorkflowExecution, 
  WorkflowNode, 
  WorkflowConnection,
  WorkflowState 
} from './workflow-store'

export { useIntegrationStore } from './integration-store'
export type { 
  Integration, 
  IntegrationTemplate, 
  PlatformConfig,
  IntegrationState 
} from './integration-store'

export { useAIAgentStore } from './ai-agent-store'
export type { 
  AIAgent, 
  AIConversation, 
  AgentTemplate,
  AIAgentState 
} from './ai-agent-store'

export { useNotificationStore, createNotification } from './notification-store'
export type { 
  Notification,
  NotificationSettings,
  NotificationState 
} from './notification-store'

// Store 組合 Hook - 用於需要多個 store 的組件
export const useStores = () => {
  const { useAuthStore } = require('./auth-store')
  const { useWorkflowStore } = require('./workflow-store')
  const { useIntegrationStore } = require('./integration-store')
  const { useAIAgentStore } = require('./ai-agent-store')
  const { useNotificationStore } = require('./notification-store')
  
  const auth = useAuthStore()
  const workflow = useWorkflowStore()
  const integration = useIntegrationStore()
  const aiAgent = useAIAgentStore()
  const notification = useNotificationStore()
  
  return {
    auth,
    workflow,
    integration,
    aiAgent,
    notification
  }
}

// 初始化所有 stores 的 Hook
export const useInitializeStores = () => {
  const { auth, workflow, integration, aiAgent, notification } = useStores()
  
  const initializeAll = async () => {
    try {
      // 如果用戶已登錄，初始化所有數據
      if (auth.user) {
        await Promise.all([
          workflow.fetchWorkflows(),
          integration.fetchIntegrations(),
          aiAgent.fetchAgents(),
          notification.fetchNotifications(),
          notification.fetchSettings()
        ])
      }
    } catch (error) {
      console.error('初始化 stores 失敗:', error)
      notification.addNotification({
        title: '初始化失敗',
        message: '無法載入應用程式數據，請重新整理頁面',
        type: 'error',
        category: 'system',
        priority: 'high',
        read: false,
        actionRequired: true
      })
    }
  }
  
  return { initializeAll }
}

// 清理所有 stores 的 Hook
export const useClearStores = () => {
  const { workflow, integration, aiAgent, notification } = useStores()
  
  const clearAll = () => {
    workflow.setWorkflows([])
    workflow.setExecutions([])
    workflow.setSelectedWorkflow(null)
    
    integration.setIntegrations([])
    integration.setSelectedIntegration(null)
    
    aiAgent.setAgents([])
    aiAgent.setConversations([])
    aiAgent.setSelectedAgent(null)
    
    notification.clearAll()
  }
  
  return { clearAll }
}

// 全局錯誤處理 Hook
export const useGlobalErrorHandler = () => {
  const { useNotificationStore } = require('./notification-store')
  const notification = useNotificationStore()
  
  const handleError = (error: Error, context?: string) => {
    console.error(`錯誤 ${context ? `(${context})` : ''}:`, error)
    
    notification.addNotification({
      title: context ? `${context} 錯誤` : '系統錯誤',
      message: error.message || '發生未知錯誤',
      type: 'error',
      category: 'system',
      priority: 'high',
      read: false,
      actionRequired: true
    })
  }
  
  return { handleError }
}

// 成功操作通知 Hook
export const useSuccessHandler = () => {
  const { useNotificationStore } = require('./notification-store')
  const notification = useNotificationStore()
  
  const handleSuccess = (title: string, message: string, category: 'system' | 'workflow' | 'integration' | 'ai' = 'system') => {
    notification.addNotification({
      title,
      message,
      type: 'success',
      category,
      priority: 'low',
      read: false,
      actionRequired: false
    })
  }
  
  return { handleSuccess }
}