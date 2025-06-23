-- AS Platform Database Cleanup Script
-- 創建時間：2025-01-16
-- 用途：清理現有數據庫表，準備重新執行 schema.sql
-- 注意：此腳本會刪除所有現有數據！

-- 警告：執行前請確保已備份重要數據
-- 此腳本將完全清理數據庫，移除所有表、函數和觸發器

-- 1. 停用所有表的 RLS（行級安全性）
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS apollo_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instagram_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS webhook_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_ai_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workflow_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS integrations DISABLE ROW LEVEL SECURITY;

-- 2. 刪除所有 RLS 策略（安全刪除，忽略不存在的表）
-- 檢查表是否存在，然後刪除相應的策略
DO $$
BEGIN
    -- Users table policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
        DROP POLICY IF EXISTS "Users can update own profile" ON users;
        DROP POLICY IF EXISTS "Admin can view all users" ON users;
    END IF;
    
    -- Apollo contacts policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apollo_contacts' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own contacts" ON apollo_contacts;
        DROP POLICY IF EXISTS "Users can manage own contacts" ON apollo_contacts;
    END IF;
    
    -- Instagram analytics policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'instagram_analytics' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own analytics" ON instagram_analytics;
        DROP POLICY IF EXISTS "Users can manage own analytics" ON instagram_analytics;
    END IF;
    
    -- AI tasks policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tasks' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own tasks" ON ai_tasks;
        DROP POLICY IF EXISTS "Users can manage own tasks" ON ai_tasks;
    END IF;
    
    -- Webhook requests policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhook_requests' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own webhooks" ON webhook_requests;
        DROP POLICY IF EXISTS "Users can manage own webhooks" ON webhook_requests;
    END IF;
    
    -- User AI usage policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_ai_usage' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own usage" ON user_ai_usage;
        DROP POLICY IF EXISTS "Users can manage own usage" ON user_ai_usage;
    END IF;
    
    -- Audit logs policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
        DROP POLICY IF EXISTS "Admin can view all audit logs" ON audit_logs;
    END IF;
    
    -- System configs policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_configs' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Admin can manage system configs" ON system_configs;
    END IF;
    
    -- API keys policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own api keys" ON api_keys;
        DROP POLICY IF EXISTS "Users can manage own api keys" ON api_keys;
        DROP POLICY IF EXISTS "Admin can view all api keys" ON api_keys;
    END IF;
    
    -- Workflows policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can manage own workflows" ON workflows;
    END IF;
    
    -- Workflow executions policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflow_executions' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own workflow executions" ON workflow_executions;
    END IF;
    
    -- Integrations policies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'integrations' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can manage own integrations" ON integrations;
    END IF;
END $$;

-- 3. 刪除所有觸發器（安全刪除，忽略不存在的表）
DO $$
BEGIN
    -- 刪除 updated_at 觸發器
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apollo_contacts' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_apollo_contacts_updated_at ON apollo_contacts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_configs' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_system_configs_updated_at ON system_configs;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'integrations' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
    END IF;
    
    -- 刪除審計觸發器
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS audit_users_trigger ON users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'apollo_contacts' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS audit_apollo_contacts_trigger ON apollo_contacts;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tasks' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS audit_ai_tasks_trigger ON ai_tasks;
    END IF;
END $$;

-- 4. 刪除所有表（按依賴關係順序）
-- 先刪除有外鍵依賴的表
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS user_ai_usage CASCADE;
DROP TABLE IF EXISTS webhook_requests CASCADE;
DROP TABLE IF EXISTS ai_tasks CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS instagram_analytics CASCADE;
DROP TABLE IF EXISTS apollo_contacts CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;
-- 最後刪除主表
DROP TABLE IF EXISTS users CASCADE;

-- 5. 刪除所有自定義函數
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE;

-- 6. 刪除所有索引（如果有獨立創建的）
-- 注意：表刪除時會自動刪除相關索引，但為了確保完全清理
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_subscription_tier;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_apollo_contacts_email;
DROP INDEX IF EXISTS idx_apollo_contacts_company;
DROP INDEX IF EXISTS idx_apollo_contacts_quality_score;
DROP INDEX IF EXISTS idx_apollo_contacts_status;
DROP INDEX IF EXISTS idx_apollo_contacts_last_contacted;
DROP INDEX IF EXISTS idx_instagram_analytics_account;
DROP INDEX IF EXISTS idx_instagram_analytics_performance;
DROP INDEX IF EXISTS idx_instagram_analytics_analyzed_at;
DROP INDEX IF EXISTS idx_ai_tasks_user_id;
DROP INDEX IF EXISTS idx_ai_tasks_status;
DROP INDEX IF EXISTS idx_ai_tasks_priority;
DROP INDEX IF EXISTS idx_ai_tasks_created_at;
DROP INDEX IF EXISTS idx_ai_tasks_scheduled_at;
DROP INDEX IF EXISTS idx_webhook_requests_idempotency;
DROP INDEX IF EXISTS idx_webhook_requests_status;
DROP INDEX IF EXISTS idx_webhook_requests_created_at;
DROP INDEX IF EXISTS idx_user_ai_usage_user_month;
DROP INDEX IF EXISTS idx_audit_logs_table_record;
DROP INDEX IF EXISTS idx_audit_logs_changed_at;
DROP INDEX IF EXISTS idx_api_keys_user_id;
DROP INDEX IF EXISTS idx_api_keys_is_active;
DROP INDEX IF EXISTS idx_workflows_user_id;
DROP INDEX IF EXISTS idx_workflows_is_active;
DROP INDEX IF EXISTS idx_workflows_tags;
DROP INDEX IF EXISTS idx_workflow_executions_workflow_id;
DROP INDEX IF EXISTS idx_workflow_executions_status;
DROP INDEX IF EXISTS idx_workflow_executions_started_at;
DROP INDEX IF EXISTS idx_integrations_user_id;
DROP INDEX IF EXISTS idx_integrations_service_name;
DROP INDEX IF EXISTS idx_integrations_is_active;

-- 清理完成提示
-- 執行完此腳本後，可以安全地執行 schema.sql 文件

-- 驗證清理結果
-- 執行以下查詢確認所有表已被刪除：
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 執行步驟：
-- 1. 在 Supabase SQL Editor 中執行此 cleanup_schema.sql
-- 2. 確認所有表已被刪除
-- 3. 執行完整的 schema.sql 文件
-- 4. 驗證新表結構是否正確創建