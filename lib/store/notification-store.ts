import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'workflow' | 'integration' | 'ai_agent' | 'security' | 'billing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  actionRequired: boolean
  actionUrl?: string
  actionText?: string
  metadata?: {
    workflowId?: string
    integrationId?: string
    agentId?: string
    userId?: string
    errorCode?: string
    [key: string]: any
  }
  createdAt: string
  readAt?: string
  expiresAt?: string
}

export interface NotificationSettings {
  email: {
    enabled: boolean
    workflowUpdates: boolean
    integrationAlerts: boolean
    aiAgentNotifications: boolean
    securityAlerts: boolean
    billingUpdates: boolean
    weeklyReports: boolean
  }
  push: {
    enabled: boolean
    workflowUpdates: boolean
    integrationAlerts: boolean
    aiAgentNotifications: boolean
    securityAlerts: boolean
    urgentOnly: boolean
  }
  inApp: {
    enabled: boolean
    showBadge: boolean
    autoMarkRead: boolean
    retentionDays: number
  }
}

interface NotificationState {
  notifications: Notification[]
  settings: NotificationSettings
  isLoading: boolean
  unreadCount: number
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  clearByCategory: (category: Notification['category']) => void
  
  // Settings actions
  updateSettings: (settings: Partial<NotificationSettings>) => void
  
  // API actions
  fetchNotifications: () => Promise<void>
  fetchSettings: () => Promise<void>
  saveSettings: (settings: NotificationSettings) => Promise<boolean>
  
  // Utility actions
  getUnreadCount: () => number
  getNotificationsByCategory: (category: Notification['category']) => Notification[]
  getUrgentNotifications: () => Notification[]
}

const defaultSettings: NotificationSettings = {
  email: {
    enabled: true,
    workflowUpdates: true,
    integrationAlerts: true,
    aiAgentNotifications: true,
    securityAlerts: true,
    billingUpdates: true,
    weeklyReports: false
  },
  push: {
    enabled: true,
    workflowUpdates: true,
    integrationAlerts: true,
    aiAgentNotifications: false,
    securityAlerts: true,
    urgentOnly: false
  },
  inApp: {
    enabled: true,
    showBadge: true,
    autoMarkRead: false,
    retentionDays: 30
  }
}

export const useNotificationStore = create<NotificationState>()(n  persist(
    (set, get) => ({
      notifications: [],
      settings: defaultSettings,
      isLoading: false,
      unreadCount: 0,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length
        set({ notifications, unreadCount })
      },

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        }
        
        set((state) => {
          const newNotifications = [notification, ...state.notifications]
          const unreadCount = newNotifications.filter(n => !n.read).length
          return {
            notifications: newNotifications,
            unreadCount
          }
        })
        
        // 如果是緊急通知，可以觸發額外的處理
        if (notification.priority === 'urgent') {
          // 可以在這裡添加聲音提醒、桌面通知等
          console.log('緊急通知:', notification.title)
        }
      },

      updateNotification: (id, updates) => {
        set((state) => {
          const notifications = state.notifications.map(n => 
            n.id === id ? { ...n, ...updates } : n
          )
          const unreadCount = notifications.filter(n => !n.read).length
          return { notifications, unreadCount }
        })
      },

      markAsRead: (id) => {
        const readAt = new Date().toISOString()
        get().updateNotification(id, { read: true, readAt })
      },

      markAllAsRead: () => {
        const readAt = new Date().toISOString()
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true, readAt })),
          unreadCount: 0
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== id)
          const unreadCount = notifications.filter(n => !n.read).length
          return { notifications, unreadCount }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      clearByCategory: (category) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.category !== category)
          const unreadCount = notifications.filter(n => !n.read).length
          return { notifications, unreadCount }
        })
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      fetchNotifications: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/notifications')
          if (response.ok) {
            const notifications = await response.json()
            get().setNotifications(notifications)
          } else {
            throw new Error('獲取通知失敗')
          }
        } catch (error) {
          console.error('獲取通知錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchSettings: async () => {
        try {
          const response = await fetch('/api/notifications/settings')
          if (response.ok) {
            const settings = await response.json()
            get().updateSettings(settings)
          } else {
            throw new Error('獲取通知設置失敗')
          }
        } catch (error) {
          console.error('獲取通知設置錯誤:', error)
        }
      },

      saveSettings: async (settings) => {
        try {
          const response = await fetch('/api/notifications/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
          })

          if (response.ok) {
            get().updateSettings(settings)
            return true
          } else {
            const error = await response.json()
            throw new Error(error.message || '保存通知設置失敗')
          }
        } catch (error) {
          console.error('保存通知設置錯誤:', error)
          return false
        }
      },

      getUnreadCount: () => {
        return get().notifications.filter(n => !n.read).length
      },

      getNotificationsByCategory: (category) => {
        return get().notifications.filter(n => n.category === category)
      },

      getUrgentNotifications: () => {
        return get().notifications.filter(n => 
          n.priority === 'urgent' && !n.read
        )
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ 
        settings: state.settings,
        // 不持久化通知列表，每次重新獲取
      }),
    }
  )
)

// 通知工具函數
export const createNotification = {
  success: (title: string, message: string, metadata?: any): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type: 'success',
    category: 'system',
    priority: 'low',
    read: false,
    actionRequired: false,
    metadata
  }),
  
  error: (title: string, message: string, metadata?: any): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type: 'error',
    category: 'system',
    priority: 'high',
    read: false,
    actionRequired: true,
    metadata
  }),
  
  warning: (title: string, message: string, metadata?: any): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type: 'warning',
    category: 'system',
    priority: 'medium',
    read: false,
    actionRequired: false,
    metadata
  }),
  
  workflow: (title: string, message: string, workflowId: string, priority: Notification['priority'] = 'medium'): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type: 'info',
    category: 'workflow',
    priority,
    read: false,
    actionRequired: priority === 'high' || priority === 'urgent',
    actionUrl: `/workflows/${workflowId}`,
    actionText: '查看工作流程',
    metadata: { workflowId }
  }),
  
  integration: (title: string, message: string, integrationId: string, type: Notification['type'] = 'info'): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type,
    category: 'integration',
    priority: type === 'error' ? 'high' : 'medium',
    read: false,
    actionRequired: type === 'error',
    actionUrl: `/integrations/${integrationId}`,
    actionText: '查看整合',
    metadata: { integrationId }
  }),
  
  aiAgent: (title: string, message: string, agentId: string, type: Notification['type'] = 'info'): Omit<Notification, 'id' | 'createdAt'> => ({
    title,
    message,
    type,
    category: 'ai_agent',
    priority: type === 'error' ? 'high' : 'low',
    read: false,
    actionRequired: type === 'error',
    actionUrl: `/ai-agents/${agentId}`,
    actionText: '查看智能體',
    metadata: { agentId }
  })
}