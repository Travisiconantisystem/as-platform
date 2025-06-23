import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { ApiResponse, PaginatedResponse } from './types'

// API基礎配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'
const API_TIMEOUT = 30000

// 創建axios實例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
apiClient.interceptors.request.use(
  async (config) => {
    // 添加認證token
    const session = await getSession()
    if (session && 'accessToken' in session && session.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }

    // 添加請求ID用於追蹤
    config.headers['X-Request-ID'] = generateRequestId()

    // 添加時間戳
    config.headers['X-Timestamp'] = new Date().toISOString()

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 統一錯誤處理
    handleApiError(error)
    return Promise.reject(error)
  }
)

// 生成請求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 錯誤處理函數
function handleApiError(error: any) {
  if (error.response) {
    // 服務器響應錯誤
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        toast.error(data.message || '請求參數錯誤')
        break
      case 401:
        toast.error('未授權，請重新登入')
        // 重定向到登入頁面
        window.location.href = '/auth/signin'
        break
      case 403:
        toast.error('權限不足')
        break
      case 404:
        toast.error('資源不存在')
        break
      case 429:
        toast.error('請求過於頻繁，請稍後再試')
        break
      case 500:
        toast.error('服務器內部錯誤')
        break
      default:
        toast.error(data.message || '請求失敗')
    }
  } else if (error.request) {
    // 網絡錯誤
    toast.error('網絡連接失敗，請檢查網絡設置')
  } else {
    // 其他錯誤
    toast.error('請求配置錯誤')
  }
}

// 通用API請求函數
export class ApiService {
  // GET請求
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // POST請求
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // PUT請求
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // PATCH請求
  static async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(url, data, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // DELETE請求
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  }

  // 分頁請求
  static async getPaginated<T>(
    url: string,
    params?: {
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
      search?: string
      filters?: Record<string, any>
    }
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await apiClient.get(url, { params })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // 文件上傳
  static async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ url: string; filename: string }>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  // 批量請求
  static async batch<T>(
    requests: Array<{
      method: 'get' | 'post' | 'put' | 'patch' | 'delete'
      url: string
      data?: any
    }>
  ): Promise<ApiResponse<T[]>> {
    try {
      const promises = requests.map((request) => {
        switch (request.method) {
          case 'get':
            return this.get(request.url)
          case 'post':
            return this.post(request.url, request.data)
          case 'put':
            return this.put(request.url, request.data)
          case 'patch':
            return this.patch(request.url, request.data)
          case 'delete':
            return this.delete(request.url)
          default:
            throw new Error(`Unsupported method: ${request.method}`)
        }
      })

      const results = await Promise.allSettled(promises)
      const data = results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value.data
        } else {
          throw result.reason
        }
      })

      return {
        success: true,
        data: data as T[],
        message: 'Batch request completed',
      }
    } catch (error) {
      throw error
    }
  }
}

// 具體API服務類
export class UserService {
  static async getProfile(): Promise<ApiResponse<any>> {
    return ApiService.get('/users/profile')
  }

  static async updateProfile(data: any): Promise<ApiResponse<any>> {
    return ApiService.put('/users/profile', data)
  }

  static async getUsers(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/users', params)
  }

  static async createUser(data: any): Promise<ApiResponse<any>> {
    return ApiService.post('/users', data)
  }

  static async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return ApiService.put(`/users/${id}`, data)
  }

  static async deleteUser(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`/users/${id}`)
  }
}

export class PlatformService {
  static async getPlatforms(): Promise<ApiResponse<any[]>> {
    return ApiService.get('/platforms')
  }

  static async connectPlatform(data: any): Promise<ApiResponse<any>> {
    return ApiService.post('/platforms/connect', data)
  }

  static async disconnectPlatform(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`/platforms/${id}/disconnect`)
  }

  static async testConnection(id: string): Promise<ApiResponse<any>> {
    return ApiService.post(`/platforms/${id}/test`)
  }
}

export class WorkflowService {
  static async getWorkflows(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/workflows', params)
  }

  static async getWorkflow(id: string): Promise<ApiResponse<any>> {
    return ApiService.get(`/workflows/${id}`)
  }

  static async createWorkflow(data: any): Promise<ApiResponse<any>> {
    return ApiService.post('/workflows', data)
  }

  static async updateWorkflow(id: string, data: any): Promise<ApiResponse<any>> {
    return ApiService.put(`/workflows/${id}`, data)
  }

  static async deleteWorkflow(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`/workflows/${id}`)
  }

  static async executeWorkflow(id: string, data?: any): Promise<ApiResponse<any>> {
    return ApiService.post(`/workflows/${id}/execute`, data)
  }

  static async getWorkflowRuns(id: string, params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated(`/workflows/${id}/runs`, params)
  }
}

export class AIService {
  static async getAgents(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/ai/agents', params)
  }

  static async getAgent(id: string): Promise<ApiResponse<any>> {
    return ApiService.get(`/ai/agents/${id}`)
  }

  static async createAgent(data: any): Promise<ApiResponse<any>> {
    return ApiService.post('/ai/agents', data)
  }

  static async updateAgent(id: string, data: any): Promise<ApiResponse<any>> {
    return ApiService.put(`/ai/agents/${id}`, data)
  }

  static async deleteAgent(id: string): Promise<ApiResponse<any>> {
    return ApiService.delete(`/ai/agents/${id}`)
  }

  static async chatWithAgent(id: string, message: string): Promise<ApiResponse<any>> {
    return ApiService.post(`/ai/agents/${id}/chat`, { message })
  }

  static async getConversations(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/ai/conversations', params)
  }
}

export class SystemService {
  static async getSettings(): Promise<ApiResponse<any>> {
    return ApiService.get('/system/settings')
  }

  static async updateSettings(data: any): Promise<ApiResponse<any>> {
    return ApiService.put('/system/settings', data)
  }

  static async getHealth(): Promise<ApiResponse<any>> {
    return ApiService.get('/system/health')
  }

  static async getLogs(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/system/logs', params)
  }

  static async getNotifications(params?: any): Promise<PaginatedResponse<any>> {
    return ApiService.getPaginated('/notifications', params)
  }

  static async markNotificationRead(id: string): Promise<ApiResponse<any>> {
    return ApiService.patch(`/notifications/${id}/read`)
  }
}

// 導出默認實例
export default apiClient