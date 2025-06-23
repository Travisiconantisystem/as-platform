import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error' | 'running' | 'paused'
  n8nWorkflowId: string
  userId: string
  tags: string[]
  lastRun?: {
    timestamp: string
    status: 'success' | 'error' | 'running'
    duration?: number
    errorMessage?: string
  }
  nextRun?: string
  executionCount: number
  successRate: number
  createdAt: string
  updatedAt: string
  config: {
    triggers: any[]
    nodes: any[]
    connections: any
  }
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  startTime: string
  endTime?: string
  duration?: number
  inputData?: any
  outputData?: any
  errorMessage?: string
  logs: {
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
    nodeId?: string
  }[]
}

interface WorkflowState {
  workflows: Workflow[]
  executions: WorkflowExecution[]
  isLoading: boolean
  selectedWorkflow: Workflow | null
  
  // Actions
  setWorkflows: (workflows: Workflow[]) => void
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  setSelectedWorkflow: (workflow: Workflow | null) => void
  
  // Execution actions
  setExecutions: (executions: WorkflowExecution[]) => void
  addExecution: (execution: WorkflowExecution) => void
  updateExecution: (id: string, updates: Partial<WorkflowExecution>) => void
  
  // API actions
  fetchWorkflows: () => Promise<void>
  createWorkflow: (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  executeWorkflow: (id: string, inputData?: any) => Promise<boolean>
  pauseWorkflow: (id: string) => Promise<boolean>
  resumeWorkflow: (id: string) => Promise<boolean>
  fetchExecutions: (workflowId?: string) => Promise<void>
}

export const useWorkflowStore = create<WorkflowState>()(n  persist(
    (set, get) => ({
      workflows: [],
      executions: [],
      isLoading: false,
      selectedWorkflow: null,

      setWorkflows: (workflows) => {
        set({ workflows })
      },

      addWorkflow: (workflow) => {
        set((state) => ({
          workflows: [...state.workflows, workflow]
        }))
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map(w => 
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          )
        }))
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter(w => w.id !== id),
          selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow
        }))
      },

      setSelectedWorkflow: (workflow) => {
        set({ selectedWorkflow: workflow })
      },

      setExecutions: (executions) => {
        set({ executions })
      },

      addExecution: (execution) => {
        set((state) => ({
          executions: [execution, ...state.executions]
        }))
      },

      updateExecution: (id, updates) => {
        set((state) => ({
          executions: state.executions.map(e => 
            e.id === id ? { ...e, ...updates } : e
          )
        }))
      },

      fetchWorkflows: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/workflows')
          if (response.ok) {
            const workflows = await response.json()
            get().setWorkflows(workflows)
          } else {
            throw new Error('獲取工作流程失敗')
          }
        } catch (error) {
          console.error('獲取工作流程錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createWorkflow: async (data) => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/workflows', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (response.ok) {
            const newWorkflow = await response.json()
            get().addWorkflow(newWorkflow)
            return true
          } else {
            throw new Error('創建工作流程失敗')
          }
        } catch (error) {
          console.error('創建工作流程錯誤:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      executeWorkflow: async (id, inputData) => {
        try {
          const response = await fetch(`/api/workflows/${id}/execute`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputData }),
          })

          if (response.ok) {
            const execution = await response.json()
            get().addExecution(execution)
            return true
          } else {
            throw new Error('執行工作流程失敗')
          }
        } catch (error) {
          console.error('執行工作流程錯誤:', error)
          return false
        }
      },

      pauseWorkflow: async (id) => {
        try {
          const response = await fetch(`/api/workflows/${id}/pause`, {
            method: 'POST',
          })

          if (response.ok) {
            get().updateWorkflow(id, { status: 'paused' })
            return true
          } else {
            throw new Error('暫停工作流程失敗')
          }
        } catch (error) {
          console.error('暫停工作流程錯誤:', error)
          return false
        }
      },

      resumeWorkflow: async (id) => {
        try {
          const response = await fetch(`/api/workflows/${id}/resume`, {
            method: 'POST',
          })

          if (response.ok) {
            get().updateWorkflow(id, { status: 'active' })
            return true
          } else {
            throw new Error('恢復工作流程失敗')
          }
        } catch (error) {
          console.error('恢復工作流程錯誤:', error)
          return false
        }
      },

      fetchExecutions: async (workflowId) => {
        set({ isLoading: true })
        
        try {
          const url = workflowId 
            ? `/api/workflows/${workflowId}/executions`
            : '/api/executions'
          
          const response = await fetch(url)
          if (response.ok) {
            const executions = await response.json()
            get().setExecutions(executions)
          } else {
            throw new Error('獲取執行記錄失敗')
          }
        } catch (error) {
          console.error('獲取執行記錄錯誤:', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'workflow-storage',
      partialize: (state) => ({ 
        workflows: state.workflows,
        selectedWorkflow: state.selectedWorkflow 
      }),
    }
  )
)