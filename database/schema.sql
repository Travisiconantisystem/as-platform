-- AS Platform Database Schema
-- 創建時間：2025-01-16
-- 版本：v1.1 - 優化版本
-- 更新內容：增強數據完整性、性能優化、審計功能

-- 用戶表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  ai_usage_limit INTEGER DEFAULT 1000 CHECK (ai_usage_limit >= 0),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apollo聯繫人表
CREATE TABLE apollo_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://.*linkedin\.com/.*'),
  data_quality_score INTEGER DEFAULT 0 CHECK (data_quality_score BETWEEN 0 AND 100),
  is_verified BOOLEAN DEFAULT false,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  contact_status VARCHAR(20) DEFAULT 'new' CHECK (contact_status IN ('new', 'contacted', 'responded', 'converted', 'unsubscribed')),
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instagram分析表
CREATE TABLE instagram_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id VARCHAR(255) NOT NULL,
  engagement_rate DECIMAL(5,2) NOT NULL CHECK (engagement_rate >= 0 AND engagement_rate <= 100),
  likes INTEGER DEFAULT 0 CHECK (likes >= 0),
  comments INTEGER DEFAULT 0 CHECK (comments >= 0),
  shares INTEGER DEFAULT 0 CHECK (shares >= 0),
  reach INTEGER DEFAULT 0 CHECK (reach >= 0),
  impressions INTEGER DEFAULT 0 CHECK (impressions >= 0),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score BETWEEN 0 AND 100),
  trend_direction VARCHAR(10) DEFAULT 'stable' CHECK (trend_direction IN ('up', 'down', 'stable')),
  post_type VARCHAR(20) CHECK (post_type IN ('photo', 'video', 'carousel', 'reel', 'story')),
  hashtags TEXT[],
  post_url TEXT,
  insights JSONB DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI任務表
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('manual', 'webhook', 'scheduled', 'api')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  input_data JSONB NOT NULL,
  ai_response JSONB,
  token_usage JSONB,
  processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
  max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook請求記錄表
CREATE TABLE webhook_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('received', 'processing', 'completed', 'failed', 'timeout')),
  source_ip INET,
  user_agent TEXT,
  webhook_type VARCHAR(50),
  input_data JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  response_time_ms INTEGER CHECK (response_time_ms >= 0),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用戶AI使用統計表
CREATE TABLE user_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
  monthly_limit INTEGER DEFAULT 1000 CHECK (monthly_limit >= 0),
  usage_month DATE DEFAULT DATE_TRUNC('month', NOW()),
  api_calls_count INTEGER DEFAULT 0 CHECK (api_calls_count >= 0),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, usage_month)
);

-- 審計日誌表
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 系統配置表
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API密鑰管理表
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提升查詢性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_apollo_contacts_user_id ON apollo_contacts(user_id);
CREATE INDEX idx_apollo_contacts_email ON apollo_contacts(email);
CREATE INDEX idx_apollo_contacts_company ON apollo_contacts(company);
CREATE INDEX idx_apollo_contacts_quality_score ON apollo_contacts(data_quality_score);
CREATE INDEX idx_apollo_contacts_status ON apollo_contacts(contact_status);
CREATE INDEX idx_apollo_contacts_last_contacted ON apollo_contacts(last_contacted_at);
CREATE INDEX idx_instagram_analytics_user_id ON instagram_analytics(user_id);
CREATE INDEX idx_instagram_analytics_account ON instagram_analytics(account_id);
CREATE INDEX idx_instagram_analytics_performance ON instagram_analytics(performance_score);
CREATE INDEX idx_instagram_analytics_analyzed_at ON instagram_analytics(analyzed_at);
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_priority ON ai_tasks(priority);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at);
CREATE INDEX idx_ai_tasks_scheduled_at ON ai_tasks(scheduled_at);
CREATE INDEX idx_webhook_requests_user_id ON webhook_requests(user_id);
CREATE INDEX idx_webhook_requests_idempotency ON webhook_requests(idempotency_key);
CREATE INDEX idx_webhook_requests_status ON webhook_requests(status);
CREATE INDEX idx_webhook_requests_created_at ON webhook_requests(created_at);
CREATE INDEX idx_user_ai_usage_user_month ON user_ai_usage(user_id, usage_month);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有相關表創建更新時間觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apollo_contacts_updated_at BEFORE UPDATE ON apollo_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 創建審計觸發器函數
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 為重要表創建審計觸發器
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_apollo_contacts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON apollo_contacts
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_ai_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON ai_tasks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 啟用行級安全性（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE apollo_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 創建RLS策略
-- Users表策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Apollo Contacts表策略
CREATE POLICY "Users can view own contacts" ON apollo_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contacts" ON apollo_contacts
    FOR ALL USING (auth.uid() = user_id);

-- Instagram Analytics表策略
CREATE POLICY "Users can view own analytics" ON instagram_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own analytics" ON instagram_analytics
    FOR ALL USING (auth.uid() = user_id);

-- AI Tasks表策略
CREATE POLICY "Users can view own tasks" ON ai_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON ai_tasks
    FOR ALL USING (auth.uid() = user_id);

-- Webhook Requests表策略
CREATE POLICY "Users can view own webhooks" ON webhook_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own webhooks" ON webhook_requests
    FOR ALL USING (auth.uid() = user_id);

-- User AI Usage表策略
CREATE POLICY "Users can view own usage" ON user_ai_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own usage" ON user_ai_usage
    FOR ALL USING (auth.uid() = user_id);

-- Audit Logs表策略（只允許查看，不允許修改）
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = changed_by);

CREATE POLICY "Admin can view all audit logs" ON audit_logs
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- System Configs表策略（只有管理員可以訪問）
CREATE POLICY "Admin can manage system configs" ON system_configs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- API Keys表策略
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own api keys" ON api_keys
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all api keys" ON api_keys
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- 創建工作流程相關表
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1 CHECK (version > 0),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_workflow_name_per_user UNIQUE (user_id, name)
);

CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0),
  max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER CHECK (execution_time_ms >= 0),
  triggered_by VARCHAR(50) DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'scheduled', 'webhook', 'api'))
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL CHECK (service_name IN ('apollo', 'instagram', 'linkedin', 'email', 'slack', 'zapier', 'webhook')),
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency_hours INTEGER DEFAULT 24 CHECK (sync_frequency_hours > 0),
  error_count INTEGER DEFAULT 0 CHECK (error_count >= 0),
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_service_per_user UNIQUE (user_id, service_name)
);

-- 創建工作流程相關索引
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_is_active ON workflows(is_active);
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_service_name ON integrations(service_name);
CREATE INDEX idx_integrations_is_active ON integrations(is_active);

-- 為工作流程表添加更新時間觸發器
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 為工作流程表啟用RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- 工作流程表RLS策略
CREATE POLICY "Users can manage own workflows" ON workflows
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workflow executions" ON workflow_executions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM workflows WHERE id = workflow_id));

CREATE POLICY "Users can manage own integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);

-- 插入初始系統配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('max_ai_requests_per_month', '1000', '每月最大AI請求次數'),
('default_subscription_tier', '"free"', '預設訂閱等級'),
('api_rate_limit_per_minute', '60', '每分鐘API請求限制'),
('max_workflow_executions_per_day', '100', '每日最大工作流程執行次數'),
('system_maintenance_mode', 'false', '系統維護模式開關');

-- 版本信息註釋
-- Schema Version: v1.1 - 優化版本
-- 最後更新: 2024年
-- 主要改進:
-- 1. 增強數據完整性約束
-- 2. 優化索引策略
-- 3. 完善審計功能
-- 4. 強化安全策略
-- 5. 改進工作流程管理