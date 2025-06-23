import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  // 用戶狀態
  user: any | null
  setUser: (user: any) => void
  
  // 工作流程狀態
  workflows: any[]
  setWorkflows: (workflows: any[]) => void
  addWorkflow: (workflow: any) => void
  updateWorkflow: (id: string, updates: any) => void
  removeWorkflow: (id: string) => void
  
  // 整合狀態
  integrations: any[]
  setIntegrations: (integrations: any[]) => void
  updateIntegrationStatus: (platform: string, status: string) => void
  
  // AI任務狀態
  aiTasks: any[]
  setAiTasks: (tasks: any[]) => void
  addAiTask: (task: any) => void
  updateAiTask: (id: string, updates: any) => void
  
  // 實時數據狀態
  realtimeData: {
    apolloContacts: any[]
    instagramAnalytics: any[]
    notifications: any[]
  }
  setRealtimeData: (key: string, data: any[]) => void
  addRealtimeItem: (key: string, item: any) => void
  
  // UI狀態
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentView: string
  setCurrentView: (view: string) => void
  
  // 載入狀態
  loading: {
    workflows: boolean
    integrations: boolean
    aiTasks: boolean
  }
  setLoading: (key: string, loading: boolean) => void
  
  // 系統狀態
  systemHealth: {
    database: string
    api: string
    n8n: string
    lastCheck: Date | null
  }
  setSystemHealth: (health: any) => void
  
  // 統計數據
  stats: {
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    successRate: number
    aiUsage: {
      totalTokens: number
      totalCost: number
      monthlyUsage: number
    }
  }
  setStats: (stats: any) => void
  updateStats: (key: string, value: any) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始狀態
        user: null,
        workflows: [],
        integrations: [],
        aiTasks: [],
        realtimeData: {
          apolloContacts: [],
          instagramAnalytics: [],
          notifications: []
        },
        sidebarOpen: true,
        currentView: 'dashboard',
        loading: {
          workflows: false,
          integrations: false,
          aiTasks: false
        },
        systemHealth: {
          database: 'unknown',
          api: 'unknown',
          n8n: 'unknown',
          lastCheck: null
        },
        stats: {
          totalWorkflows: 0,
          activeWorkflows: 0,
          totalExecutions: 0,
          successRate: 0,
          aiUsage: {
            totalTokens: 0,
            totalCost: 0,
            monthlyUsage: 0
          }
        },
        
        // 用戶操作
        setUser: (user) => set({ user }),
        
        // 工作流程操作
        setWorkflows: (workflows) => set({ workflows }),
        addWorkflow: (workflow) => set((state) => ({
          workflows: [...state.workflows, workflow]
        })),
        updateWorkflow: (id, updates) => set((state) => ({
          workflows: state.workflows.map(w => 
            w.id === id ? { ...w, ...updates } : w
          )
        })),
        removeWorkflow: (id) => set((state) => ({
          workflows: state.workflows.filter(w => w.id !== id)
        })),
        
        // 整合操作
        setIntegrations: (integrations) => set({ integrations }),
        updateIntegrationStatus: (platform, status) => set((state) => ({
          integrations: state.integrations.map(i => 
            i.platform === platform ? { ...i, status } : i
          )
        })),
        
        // AI任務操作
        setAiTasks: (aiTasks) => set({ aiTasks }),
        addAiTask: (task) => set((state) => ({
          aiTasks: [...state.aiTasks, task]
        })),
        updateAiTask: (id, updates) => set((state) => ({
          aiTasks: state.aiTasks.map(t => 
            t.id === id ? { ...t, ...updates } : t
          )
        })),
        
        // 實時數據操作
        setRealtimeData: (key, data) => set((state) => ({
          realtimeData: {
            ...state.realtimeData,
            [key]: data
          }
        })),
        addRealtimeItem: (key, item) => set((state) => ({
          realtimeData: {
            ...state.realtimeData,
            [key]: [...(state.realtimeData[key as keyof typeof state.realtimeData] || []), item]
          }
        })),
        
        // UI操作
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setCurrentView: (currentView) => set({ currentView }),
        
        // 載入狀態操作
        setLoading: (key, loading) => set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading
          }
        })),
        
        // 系統狀態操作
        setSystemHealth: (health) => set({ systemHealth: health }),
        
        // 統計數據操作
        setStats: (stats) => set({ stats }),
        updateStats: (key, value) => set((state) => ({
          stats: {
            ...state.stats,
            [key]: value
          }
        }))
      }),
      {
        name: 'as-automation-store',
        partialize: (state) => ({
          user: state.user,
          sidebarOpen: state.sidebarOpen,
          currentView: state.currentView,
          integrations: state.integrations
        })
      }
    ),
    {
      name: 'AS Automation Store'
    }
  )
)

// 選擇器函數
export const useUser = () => useAppStore((state) => state.user)
export const useWorkflows = () => useAppStore((state) => state.workflows)
export const useIntegrations = () => useAppStore((state) => state.integrations)
export const useAiTasks = () => useAppStore((state) => state.aiTasks)
export const useRealtimeData = () => useAppStore((state) => state.realtimeData)
export const useSystemHealth = () => useAppStore((state) => state.systemHealth)
export const useStats = () => useAppStore((state) => state.stats)
export const useLoading = () => useAppStore((state) => state.loading)
export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  currentView: state.currentView,
  setSidebarOpen: state.setSidebarOpen,
  setCurrentView: state.setCurrentView
}))

// 複合選擇器
export const useWorkflowStats = () => useAppStore((state) => {
  const activeWorkflows = state.workflows.filter(w => w.status === 'active').length
  const totalWorkflows = state.workflows.length
  
  return {
    total: totalWorkflows,
    active: activeWorkflows,
    inactive: totalWorkflows - activeWorkflows
  }
})

export const useAiTaskStats = () => useAppStore((state) => {
  const processingTasks = state.aiTasks.filter(t => t.status === 'processing').length
  const completedTasks = state.aiTasks.filter(t => t.status === 'completed').length
  const failedTasks = state.aiTasks.filter(t => t.status === 'failed').length
  
  return {
    processing: processingTasks,
    completed: completedTasks,
    failed: failedTasks,
    total: state.aiTasks.length
  }
})

export const useIntegrationStats = () => useAppStore((state) => {
  const connectedIntegrations = state.integrations.filter(i => i.status === 'connected').length
  const totalIntegrations = state.integrations.length
  
  return {
    connected: connectedIntegrations,
    disconnected: totalIntegrations - connectedIntegrations,
    total: totalIntegrations
  }
})

// 動作創建器
export const createWorkflow = (workflow: any) => {
  const { addWorkflow } = useAppStore.getState()
  const newWorkflow = {
    ...workflow,
    id: `workflow_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft'
  }
  addWorkflow(newWorkflow)
  return newWorkflow
}

export const createAiTask = (task: any) => {
  const { addAiTask } = useAppStore.getState()
  const newTask = {
    ...task,
    id: `task_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  }
  addAiTask(newTask)
  return newTask
}

export const updateWorkflowStatus = (id: string, status: string) => {
  const { updateWorkflow } = useAppStore.getState()
  updateWorkflow(id, {
    status,
    updatedAt: new Date().toISOString()
  })
}

export const updateAiTaskStatus = (id: string, status: string, result?: any) => {
  const { updateAiTask } = useAppStore.getState()
  updateAiTask(id, {
    status,
    result,
    updatedAt: new Date().toISOString()
  })
}