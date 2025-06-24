const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('開始執行數據庫migration...');
    
    // 檢查當前表結構 - 嘗試查詢users表
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('無法訪問users表:', testError.message);
      return;
    }
    
    // 檢查字段是否存在
    let needsPasswordHash = true;
    let needsRole = true;
    
    if (testData && testData.length > 0) {
      const firstUser = testData[0];
      needsPasswordHash = !('password_hash' in firstUser);
      needsRole = !('role' in firstUser);
      console.log('現有字段檢查完成');
    } else {
      console.log('users表為空，將添加所有必要字段');
    }
    
    if (needsPasswordHash) {
      console.log('需要添加password_hash字段');
    }
    
    if (needsRole) {
      console.log('需要添加role字段');
    }
    
    if (!needsPasswordHash && !needsRole) {
      console.log('✓ 所有必要字段已存在，無需migration');
      return;
    }
    
    console.log('\n請手動在Supabase Studio中執行以下SQL:');
    console.log('URL: http://127.0.0.1:54323');
    console.log('\n--- SQL Commands ---');
    
    if (needsPasswordHash) {
      console.log('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);');
    }
    
    if (needsRole) {
      console.log("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';");
      console.log("ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('user', 'manager', 'admin', 'super_admin'));");
      console.log('CREATE INDEX idx_users_role ON users(role);');
      console.log("UPDATE users SET role = 'user' WHERE role IS NULL;");
    }
    
    console.log('--- End SQL Commands ---\n');
    
  } catch (error) {
    console.error('Migration失敗:', error);
  }
}

runMigration();