import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: 'admin' | 'user'
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(n  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        })
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // 這裡將整合NextAuth.js和Supabase認證
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          if (response.ok) {
            const userData = await response.json()
            get().setUser(userData.user)
            return true
          } else {
            throw new Error('登入失敗')
          }
        } catch (error) {
          console.error('登入錯誤:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
        // 清除NextAuth session
        // signOut({ redirect: false })
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return false

        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/user/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (response.ok) {
            const updatedUser = await response.json()
            get().setUser(updatedUser)
            return true
          } else {
            throw new Error('更新個人資料失敗')
          }
        } catch (error) {
          console.error('更新個人資料錯誤:', error)
          return false
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)