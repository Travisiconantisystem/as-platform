-- AS Platform Database Schema
-- 創建時間：2025-01-16
-- 版本：v1.0

-- 用戶表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  ai_usage_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apollo聯繫人表
CREATE TABLE apollo_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  linkedin_url TEXT,
  data_quality_score INTEGER DEFAULT 0,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instagram分析表
CREATE TABLE instagram_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR(255) UNIQUE NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  engagement_rate DECIMAL(5,2) NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  trend_direction VARCHAR(10) DEFAULT 'stable',
  post_type VARCHAR(20),
  insights JSONB DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI任務表
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  trigger_type VARCHAR(50) NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  input_data JSONB NOT NULL,
  ai_response JSONB,
  token_usage JSONB,
  processing_time_ms INTEGER,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook請求記錄表
CREATE TABLE webhook_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(255) UNIQUE NOT NULL,
  idempotency_key VARCHAR(255),
  status VARCHAR(20) NOT NULL,
  input_data JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用戶AI使用統計表
CREATE TABLE user_ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tokens_used INTEGER DEFAULT 0,
  monthly_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, DATE_TRUNC('month', created_at))
);

-- 創建索引以提升查詢性能
CREATE INDEX idx_apollo_contacts_email ON apollo_contacts(email);
CREATE INDEX idx_apollo_contacts_company ON apollo_contacts(company);
CREATE INDEX idx_apollo_contacts_quality_score ON apollo_contacts(data_quality_score);
CREATE INDEX idx_instagram_analytics_account ON instagram_analytics(account_id);
CREATE INDEX idx_instagram_analytics_performance ON instagram_analytics(performance_score);
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at);
CREATE INDEX idx_webhook_requests_idempotency ON webhook_requests(idempotency_key);
CREATE INDEX idx_user_ai_usage_user_month ON user_ai_usage(user_id, DATE_TRUNC('month', created_at));

-- 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apollo_contacts_updated_at BEFORE UPDATE ON apollo_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 啟用行級安全性（RLS）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE apollo_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;

-- 創建RLS策略
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view all contacts" ON apollo_contacts
    FOR SELECT USING (true);

CREATE POLICY "Users can view all analytics" ON instagram_analytics
    FOR SELECT USING (true);

CREATE POLICY "Users can view own AI tasks" ON ai_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON user_ai_usage
    FOR SELECT USING (auth.uid() = user_id);

-- 創建工作流程相關表
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  n8n_workflow_id VARCHAR(255),
  workflow_data JSONB DEFAULT '{}',
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工作流程執行記錄表
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  execution_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- 第三方平台整合表
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建額外索引
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_platform ON integrations(platform);

-- 創建更新觸發器
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 啟用RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- 創建RLS策略
CREATE POLICY "Users can manage own workflows" ON workflows
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workflow executions" ON workflow_executions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM workflows WHERE id = workflow_id));

CREATE POLICY "Users can manage own integrations" ON integrations
    FOR ALL USING (auth.uid() = user_id);