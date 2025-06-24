// AS平台全局狀態管理
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Platform, Workflow, AIAgent, SystemSettings } from './types';
import { STORAGE_KEYS } from './constants';


// 主應用狀態
interface AppState {
  // 用戶狀態
  user: User | null;
  isAuthenticated: boolean;
  
  // UI狀態
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  loading: boolean;
  
  // 數據狀態
  platforms: Platform[];
  workflows: Workflow[];
  aiAgents: AIAgent[];
  
  // 系統設置
  settings: SystemSettings | null;
  
  // 操作方法
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setPlatforms: (platforms: Platform[]) => void;
  setWorkflows: (workflows: Workflow[]) => void;
  setAIAgents: (agents: AIAgent[]) => void;
  setSettings: (settings: SystemSettings) => void;
  
  // 平台操作
  addPlatform: (platform: Platform) => void;
  updatePlatform: (id: string, updates: Partial<Platform>) => void;
  removePlatform: (id: string) => void;
  
  // 工作流程操作
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  
  // AI智能體操作
  addAIAgent: (agent: AIAgent) => void;
  updateAIAgent: (id: string, updates: Partial<AIAgent>) => void;
  removeAIAgent: (id: string) => void;
  
  // 重置狀態
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      // 初始狀態
      user: null,
      isAuthenticated: false,
      theme: 'system',
      sidebarOpen: true,
      loading: false,
      platforms: [],
      workflows: [],
      aiAgents: [],
      settings: null,
      
      // 基本設置方法
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setLoading: (loading) => set({ loading }),
      setPlatforms: (platforms) => set({ platforms }),
      setWorkflows: (workflows) => set({ workflows }),
      setAIAgents: (aiAgents) => set({ aiAgents }),
      setSettings: (settings) => set({ settings }),
      
      // 平台操作
      addPlatform: (platform) => set((state) => ({
        platforms: [...state.platforms, platform]
      })),
      
      updatePlatform: (id, updates) => set((state) => ({
        platforms: state.platforms.map(platform => 
          platform.id === id ? { ...platform, ...updates } : platform
        )
      })),
      
      removePlatform: (id) => set((state) => ({
        platforms: state.platforms.filter(platform => platform.id !== id)
      })),
      
      // 工作流程操作
      addWorkflow: (workflow) => set((state) => ({
        workflows: [...state.workflows, workflow]
      })),
      
      updateWorkflow: (id, updates) => set((state) => ({
        workflows: state.workflows.map(workflow => 
          workflow.id === id ? { ...workflow, ...updates } : workflow
        )
      })),
      
      removeWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter(workflow => workflow.id !== id)
      })),
      
      // AI智能體操作
      addAIAgent: (agent) => set((state) => ({
        aiAgents: [...state.aiAgents, agent]
      })),
      
      updateAIAgent: (id, updates) => set((state) => ({
        aiAgents: state.aiAgents.map(agent => 
          agent.id === id ? { ...agent, ...updates } : agent
        )
      })),
      
      removeAIAgent: (id) => set((state) => ({
        aiAgents: state.aiAgents.filter(agent => agent.id !== id)
      })),
      
      // 重置狀態
      reset: () => set({
        user: null,
        isAuthenticated: false,
        platforms: [],
        workflows: [],
        aiAgents: [],
        settings: null
      })
    }),
    {
      name: STORAGE_KEYS.USER_PREFERENCES,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);

// 通知狀態管理已移至 ./store/notification-store

// 模態框狀態管理
interface ModalState {
  modals: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modals: {},
  
  openModal: (id) => set((state) => ({
    modals: { ...state.modals, [id]: true }
  })),
  
  closeModal: (id) => set((state) => ({
    modals: { ...state.modals, [id]: false }
  })),
  
  toggleModal: (id) => set((state) => ({
    modals: { ...state.modals, [id]: !state.modals[id] }
  })),
  
  isModalOpen: (id) => get().modals[id] || false
}));

// 搜索狀態管理
interface SearchState {
  query: string;
  filters: Record<string, any>;
  results: any[];
  loading: boolean;
  
  setQuery: (query: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  filters: {},
  results: [],
  loading: false,
  
  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
  
  clearSearch: () => set({
    query: '',
    filters: {},
    results: [],
    loading: false
  })
}));

// 表單狀態管理
interface FormState {
  forms: Record<string, {
    data: Record<string, any>;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
  }>;
  
  initForm: (formId: string, initialData?: Record<string, any>) => void;
  updateField: (formId: string, field: string, value: any) => void;
  setFieldError: (formId: string, field: string, error: string) => void;
  setFieldTouched: (formId: string, field: string, touched: boolean) => void;
  setSubmitting: (formId: string, submitting: boolean) => void;
  resetForm: (formId: string) => void;
  getForm: (formId: string) => any;
}

export const useFormStore = create<FormState>((set, get) => ({
  forms: {},
  
  initForm: (formId, initialData = {}) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        data: initialData,
        errors: {},
        touched: {},
        isSubmitting: false
      }
    }
  })),
  
  updateField: (formId, field, value) => set((state) => {
    const existingForm = state.forms[formId] || {
      data: {},
      errors: {},
      touched: {},
      isSubmitting: false
    };
    return {
      forms: {
        ...state.forms,
        [formId]: {
          ...existingForm,
          data: {
            ...existingForm.data,
            [field]: value
          }
        }
      }
    };
  }),

  setFieldError: (formId, field, error) => set((state) => {
    const existingForm = state.forms[formId] || {
      data: {},
      errors: {},
      touched: {},
      isSubmitting: false
    };
    return {
      forms: {
        ...state.forms,
        [formId]: {
          ...existingForm,
          errors: {
            ...existingForm.errors,
            [field]: error
          }
        }
      }
    };
  }),

  setFieldTouched: (formId, field, touched) => set((state) => {
    const existingForm = state.forms[formId] || {
      data: {},
      errors: {},
      touched: {},
      isSubmitting: false
    };
    return {
      forms: {
        ...state.forms,
        [formId]: {
          ...existingForm,
          touched: {
            ...existingForm.touched,
            [field]: touched
          }
        }
      }
    };
  }),

  setSubmitting: (formId, isSubmitting) => set((state) => {
    const existingForm = state.forms[formId] || {
      data: {},
      errors: {},
      touched: {},
      isSubmitting: false
    };
    return {
      forms: {
        ...state.forms,
        [formId]: {
          ...existingForm,
          isSubmitting
        }
      }
    };
  }),
  
  resetForm: (formId) => set((state) => ({
    forms: {
      ...state.forms,
      [formId]: {
        data: {},
        errors: {},
        touched: {},
        isSubmitting: false
      }
    }
  })),
  
  getForm: (formId) => get().forms[formId] || {
    data: {},
    errors: {},
    touched: {},
    isSubmitting: false
  }
}));