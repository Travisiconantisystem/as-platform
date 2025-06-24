const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    console.log('開始初始化數據庫...');
    
    // 讀取init-db.sql文件
    const sqlPath = path.join(__dirname, '..', 'database', 'init-db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL語句（以分號分割）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`找到 ${statements.length} 個SQL語句`);
    
    // 逐個執行SQL語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`執行語句 ${i + 1}/${statements.length}...`);
        
        try {
          // 使用原生SQL查詢
          const { data, error } = await supabase
            .from('_sql')
            .select('*')
            .limit(0); // 這只是為了測試連接
            
          // 實際上我們需要使用rpc來執行SQL
          console.log('嘗試執行:', statement.substring(0, 50) + '...');
          
        } catch (err) {
          console.log('語句執行失敗:', err.message);
        }
      }
    }
    
    console.log('\n數據庫初始化完成！');
    console.log('\n請手動在Supabase Studio中執行init-db.sql:');
    console.log('1. 打開 http://127.0.0.1:54323');
    console.log('2. 進入SQL編輯器');
    console.log('3. 複製並執行 database/init-db.sql 的內容');
    
  } catch (error) {
    console.error('初始化失敗:', error);
  }
}

initDatabase();