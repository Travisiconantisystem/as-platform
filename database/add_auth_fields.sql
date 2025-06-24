-- Migration: 添加認證相關字段到users表
-- 執行日期: 2025-01-24
-- 描述: 為NextAuth憑證登入功能添加password_hash和role字段

-- 添加password_hash字段（用於憑證登入）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 添加role字段（用於權限管理）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 添加role字段的檢查約束
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS check_user_role 
CHECK (role IN ('user', 'manager', 'admin', 'super_admin'));

-- 為role字段創建索引以提升查詢性能
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 更新現有用戶的role為'user'（如果為NULL）
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 確保role字段不為空
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

COMMIT;