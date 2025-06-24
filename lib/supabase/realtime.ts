import { useState, useEffect } from 'react'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from './client'

// 實時數據Hook
export function useRealtimeData<T>(table: string, filter?: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // 使用導入的 supabase 實例
    let channel: RealtimeChannel
    
    async function setupRealtime() {
      try {
        // 初始數據加載
        let query = supabase.from(table).select('*')
        if (filter) {
          const filterParts = filter.split('=')
          if (filterParts.length >= 2 && filterParts[0] && filterParts[1]) {
            query = query.filter(filterParts[0], 'eq', filterParts[1])
          }
        }
        
        const { data: initialData, error: initialError } = await query
        if (initialError) throw initialError
        
        setData(initialData || [])
        setLoading(false)
        
        // 設置實時監聽
        channel = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes' as any,
            {
              event: '*',
              schema: 'public',
              table: table,
              filter: filter
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              console.log('Realtime update:', payload)
              
              switch (payload.eventType) {
                case 'INSERT':
                  setData(prev => [...prev, payload.new as T])
                  break
                case 'UPDATE':
                  setData(prev => prev.map(item => 
                    (item as any).id === payload.new.id ? payload.new as T : item
                  ))
                  break
                case 'DELETE':
                  setData(prev => prev.filter(item => 
                    (item as any).id !== payload.old.id
                  ))
                  break
              }
            }
          )
          .subscribe()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }
    
    setupRealtime()
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter])
  
  return { data, loading, error }
}

// 實時通知Hook
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: '*' }, (payload) => {
        const notification = {
          id: Date.now(),
          timestamp: new Date(),
          ...payload
        }
        setNotifications(prev => [notification, ...prev.slice(0, 49)]) // 保持最新50條
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  const clearNotifications = () => setNotifications([])
  const removeNotification = (id: number) => 
    setNotifications(prev => prev.filter(n => n.id !== id))
  
  return { notifications, clearNotifications, removeNotification }
}

// 實時狀態同步Hook
export function useRealtimeSync(channelName: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  
  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
        setLastUpdate(new Date())
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: 'current-user',
            online_at: new Date().toISOString()
          })
        }
      })
    
    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [channelName])
  
  return { isConnected, lastUpdate }
}

// 工作流程實時監控Hook
export function useWorkflowRealtime(workflowId?: string) {
  const [executions, setExecutions] = useState<any[]>([])
  const [status, setStatus] = useState<string>('idle')
  
  useEffect(() => {
    if (!workflowId) return
    
    const channel = supabase
      .channel(`workflow-${workflowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions',
          filter: `workflow_id=eq.${workflowId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExecutions(prev => [payload.new, ...prev])
            setStatus(payload.new.status)
          } else if (payload.eventType === 'UPDATE') {
            setExecutions(prev => prev.map(exec => 
              exec.id === payload.new.id ? payload.new : exec
            ))
            setStatus(payload.new.status)
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [workflowId])
  
  return { executions, status }
}

// AI任務實時監控Hook
export function useAiTaskRealtime(userId?: string) {
  const [tasks, setTasks] = useState<any[]>([])
  const [activeTasksCount, setActiveTasksCount] = useState(0)
  
  useEffect(() => {
    if (!userId) return
    
    const channel = supabase
      .channel(`ai-tasks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_tasks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new, ...prev.slice(0, 99)]) // 保持最新100條
            if (payload.new.status === 'processing') {
              setActiveTasksCount(prev => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new : task
            ))
            
            // 更新活躍任務計數
            if (payload.old.status === 'processing' && payload.new.status !== 'processing') {
              setActiveTasksCount(prev => Math.max(0, prev - 1))
            } else if (payload.old.status !== 'processing' && payload.new.status === 'processing') {
              setActiveTasksCount(prev => prev + 1)
            }
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
  
  return { tasks, activeTasksCount }
}

// 系統健康監控Hook
export function useSystemHealth() {
  const [health, setHealth] = useState({
    database: 'unknown',
    api: 'unknown',
    n8n: 'unknown',
    lastCheck: null as Date | null
  })
  
  useEffect(() => {
    const channel = supabase
      .channel('system-health')
      .on('broadcast', { event: 'health-update' }, (payload) => {
        setHealth({
          ...payload.payload,
          lastCheck: new Date()
        })
      })
      .subscribe()
    
    // 定期檢查系統健康狀態
    const checkHealth = async () => {
      try {
        const { error } = await supabase.from('users').select('count').limit(1)
        const dbStatus = error ? 'error' : 'healthy'
        
        setHealth(prev => ({
          ...prev,
          database: dbStatus,
          lastCheck: new Date()
        }))
      } catch (err) {
        setHealth(prev => ({
          ...prev,
          database: 'error',
          lastCheck: new Date()
        }))
      }
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // 每30秒檢查一次
    
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])
  
  return health
}

// 實時數據廣播工具
export const broadcastUpdate = async (channel: string, event: string, payload: any) => {
  await supabase.channel(channel).send({
    type: 'broadcast',
    event: event,
    payload: payload
  })
}

// 實時通知發送工具
export const sendNotification = async (type: string, message: string, data?: any) => {
  await broadcastUpdate('notifications', 'notification', {
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  })
}