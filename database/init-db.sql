-- AS平台數據庫初始化腳本
-- 執行方式：可以直接在Supabase Dashboard的SQL編輯器中執行
-- 或者使用 psql 命令：psql -h localhost -p 54322 -U postgres -d postgres -f init-db.sql

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用戶表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'super_admin')),
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  ai_usage_limit INTEGER DEFAULT 1000 CHECK (ai_usage_limit >= 0),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apollo聯繫人表
CREATE TABLE IF NOT EXISTS apollo_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  linkedin_url TEXT,
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
CREATE TABLE IF NOT EXISTS instagram_analytics (
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
CREATE TABLE IF NOT EXISTS ai_tasks (
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

-- 工作流程表
CREATE TABLE IF NOT EXISTS workflows (
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

-- 集成表
CREATE TABLE IF NOT EXISTS integrations (
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

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_apollo_contacts_user_id ON apollo_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_analytics_user_id ON instagram_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);

-- 創建更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為相關表創建更新時間觸發器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_apollo_contacts_updated_at ON apollo_contacts;
CREATE TRIGGER update_apollo_contacts_updated_at BEFORE UPDATE ON apollo_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入測試數據（可選）
INSERT INTO users (email, name, subscription_tier) VALUES 
('test@example.com', 'Test User', 'free')
ON CONFLICT (email) DO NOTHING;

-- 完成提示
SELECT 'AS平台數據庫初始化完成！' as status;
SELECT 'Tables created: ' || count(*) || ' tables' as summary 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'apollo_contacts', 'instagram_analytics', 'ai_tasks', 'workflows', 'integrations');