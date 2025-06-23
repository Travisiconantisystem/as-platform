// Supabase客戶端配置
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// 環境變數檢查
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 客戶端Supabase實例（用於客戶端組件）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'as-platform'
    }
  }
});

// 客戶端組件專用（React組件中使用）
export const createClientSupabase = () => {
  return createClientComponentClient<Database>();
};

// 服務端組件專用（Server Components中使用）
export const createServerSupabase = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// 管理員客戶端（需要service role key）
export const createAdminSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// 數據庫表名常數
export const TABLES = {
  USERS: 'users',
  PLATFORMS: 'platforms',
  WORKFLOWS: 'workflows',
  WORKFLOW_RUNS: 'workflow_runs',
  AI_AGENTS: 'ai_agents',
  AI_CONVERSATIONS: 'ai_conversations',
  AI_MESSAGES: 'ai_messages',
  SYSTEM_SETTINGS: 'system_settings',
  USER_PREFERENCES: 'user_preferences',
  PLATFORM_CONNECTIONS: 'platform_connections',
  WORKFLOW_LOGS: 'workflow_logs',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs'
} as const;

// RLS策略輔助函數
export const withRLS = async <T>(
  operation: () => Promise<T>,
  userId?: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error;
  }
};

// 實時訂閱輔助函數
export const createRealtimeSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

// 批量操作輔助函數
export const batchOperation = async <T>(
  operations: Array<() => Promise<T>>,
  batchSize = 10
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }
  
  return results;
};

// 分頁查詢輔助函數
export const paginatedQuery = async <T>(
  query: any,
  page = 1,
  limit = 20
) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await query
    .range(from, to)
    .select('*', { count: 'exact' });
    
  if (error) throw error;
  
  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
};

// 搜索輔助函數
export const searchQuery = <T>(
  table: string,
  searchTerm: string,
  searchColumns: string[]
) => {
  let query = supabase.from(table).select('*');
  
  if (searchTerm && searchColumns.length > 0) {
    const searchConditions = searchColumns
      .map(column => `${column}.ilike.%${searchTerm}%`)
      .join(',');
    query = query.or(searchConditions);
  }
  
  return query;
};

// 文件上傳輔助函數
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false
    });
    
  if (error) throw error;
  
  // 獲取公開URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return {
    ...data,
    publicUrl: urlData.publicUrl
  };
};

// 文件刪除輔助函數
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
    
  if (error) throw error;
};

// 健康檢查函數
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
      
    return { healthy: !error, error };
  } catch (error) {
    return { healthy: false, error };
  }
};

// 數據庫連接狀態
export const getConnectionStatus = () => {
  return {
    url: supabaseUrl,
    connected: !!supabaseUrl && !!supabaseAnonKey,
    timestamp: new Date().toISOString()
  };
};

// 錯誤處理輔助函數
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  // 根據錯誤類型返回用戶友好的訊息
  if (error?.code === 'PGRST116') {
    return '請求的資源不存在';
  }
  
  if (error?.code === '23505') {
    return '數據已存在，請檢查重複項';
  }
  
  if (error?.code === '42501') {
    return '權限不足，無法執行此操作';
  }
  
  return error?.message || '發生未知錯誤';
};

// 導出默認客戶端
export default supabase;