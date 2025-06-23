// Supabase數據庫類型定義
// 此文件由Supabase CLI自動生成，請勿手動修改

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar: string | null
          role: 'admin' | 'user' | 'viewer'
          is_active: boolean
          password_hash: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar?: string | null
          role?: 'admin' | 'user' | 'viewer'
          is_active?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string | null
          role?: 'admin' | 'user' | 'viewer'
          is_active?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          language: string
          timezone: string
          notifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          notifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          notifications?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      platforms: {
        Row: {
          id: string
          name: string
          type: string
          description: string
          icon: string
          is_connected: boolean
          connection_status: 'connected' | 'disconnected' | 'error' | 'pending'
          settings: Json
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          description: string
          icon: string
          is_connected?: boolean
          connection_status?: 'connected' | 'disconnected' | 'error' | 'pending'
          settings?: Json
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string
          icon?: string
          is_connected?: boolean
          connection_status?: 'connected' | 'disconnected' | 'error' | 'pending'
          settings?: Json
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          id: string
          user_id: string
          platform_id: string
          credentials: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_id: string
          credentials: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_id?: string
          credentials?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_connections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_connections_platform_id_fkey"
            columns: ["platform_id"]
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          type: 'data_sync' | 'automation' | 'notification' | 'integration' | 'custom'
          status: 'active' | 'inactive' | 'error' | 'draft'
          n8n_workflow_id: string | null
          configuration: Json
          triggers: Json
          actions: Json
          schedule: Json | null
          last_run_at: string | null
          next_run_at: string | null
          run_count: number
          success_count: number
          error_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          type: 'data_sync' | 'automation' | 'notification' | 'integration' | 'custom'
          status?: 'active' | 'inactive' | 'error' | 'draft'
          n8n_workflow_id?: string | null
          configuration?: Json
          triggers?: Json
          actions?: Json
          schedule?: Json | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number
          success_count?: number
          error_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          type?: 'data_sync' | 'automation' | 'notification' | 'integration' | 'custom'
          status?: 'active' | 'inactive' | 'error' | 'draft'
          n8n_workflow_id?: string | null
          configuration?: Json
          triggers?: Json
          actions?: Json
          schedule?: Json | null
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number
          success_count?: number
          error_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_runs: {
        Row: {
          id: string
          workflow_id: string
          status: 'running' | 'completed' | 'failed' | 'cancelled'
          started_at: string
          completed_at: string | null
          duration: number | null
          error: string | null
          result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workflow_id: string
          status: 'running' | 'completed' | 'failed' | 'cancelled'
          started_at: string
          completed_at?: string | null
          duration?: number | null
          error?: string | null
          result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          workflow_id?: string
          status?: 'running' | 'completed' | 'failed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          duration?: number | null
          error?: string | null
          result?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_logs: {
        Row: {
          id: string
          workflow_run_id: string
          timestamp: string
          level: 'info' | 'warn' | 'error' | 'debug'
          message: string
          data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workflow_run_id: string
          timestamp: string
          level: 'info' | 'warn' | 'error' | 'debug'
          message: string
          data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          workflow_run_id?: string
          timestamp?: string
          level?: 'info' | 'warn' | 'error' | 'debug'
          message?: string
          data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_agents: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          type: 'chatbot' | 'assistant' | 'analyzer' | 'generator' | 'classifier'
          status: 'active' | 'inactive' | 'training' | 'error'
          model: string
          configuration: Json
          capabilities: string[]
          integrations: string[]
          metrics: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          type: 'chatbot' | 'assistant' | 'analyzer' | 'generator' | 'classifier'
          status?: 'active' | 'inactive' | 'training' | 'error'
          model: string
          configuration?: Json
          capabilities?: string[]
          integrations?: string[]
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          type?: 'chatbot' | 'assistant' | 'analyzer' | 'generator' | 'classifier'
          status?: 'active' | 'inactive' | 'training' | 'error'
          model?: string
          configuration?: Json
          capabilities?: string[]
          integrations?: string[]
          metrics?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          agent_id: string
          user_id: string
          title: string
          status: 'active' | 'archived'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id: string
          title: string
          status?: 'active' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string
          title?: string
          status?: 'active' | 'archived'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_agent_id_fkey"
            columns: ["agent_id"]
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error'
          title: string
          message: string | null
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'info' | 'success' | 'warning' | 'error'
          title: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          title?: string
          message?: string | null
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      health_check: {
        Row: {
          id: string
          status: string
          timestamp: string
        }
        Insert: {
          id?: string
          status: string
          timestamp?: string
        }
        Update: {
          id?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'user' | 'viewer'
      theme_type: 'light' | 'dark' | 'system'
      connection_status: 'connected' | 'disconnected' | 'error' | 'pending'
      workflow_type: 'data_sync' | 'automation' | 'notification' | 'integration' | 'custom'
      workflow_status: 'active' | 'inactive' | 'error' | 'draft'
      run_status: 'running' | 'completed' | 'failed' | 'cancelled'
      log_level: 'info' | 'warn' | 'error' | 'debug'
      agent_type: 'chatbot' | 'assistant' | 'analyzer' | 'generator' | 'classifier'
      agent_status: 'active' | 'inactive' | 'training' | 'error'
      message_role: 'user' | 'assistant' | 'system'
      notification_type: 'info' | 'success' | 'warning' | 'error'
      conversation_status: 'active' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}