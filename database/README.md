# AS平台數據庫設置指南

## 快速設置步驟

### 方法一：使用Supabase Dashboard（推薦）

1. **登錄Supabase Dashboard**
   - 訪問：https://supabase.com/dashboard
   - 使用你的GitHub帳號登錄

2. **創建新項目**
   - 點擊「New Project」
   - 項目名稱：`as-platform`
   - 數據庫密碼：設置一個強密碼
   - 區域：選擇最近的區域（建議：Singapore）

3. **執行數據庫Schema**
   - 在Dashboard中，點擊左側「SQL Editor」
   - 複製 `init-db.sql` 文件的內容
   - 粘貼到SQL編輯器中
   - 點擊「Run」執行

4. **獲取連接信息**
   - 點擊左側「Settings」→「API」
   - 複製以下信息到 `.env.local`：
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://dlqinzerpbxuvejznans.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWluemVycGJ4dXZlanpuYW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDkzOTIsImV4cCI6MjA2NjIyNTM5Mn0.4AoeQAIff9U9poqrlIbfA9dYP3QaxSb0Ifw83eT3Vgg
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRscWluemVycGJ4dXZlanpuYW5zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY0OTM5MiwiZXhwIjoyMDY2MjI1MzkyfQ.INEJcs2GIqx6Z8cGtuXx7m_x1aW8wQ3BKEcIAVA4qAY
     ```

### 方法二：本地開發環境

如果你想使用本地Supabase環境：

1. **確保Docker正在運行**
   ```bash
   docker --version
   ```

2. **重新啟動Supabase**
   ```bash
   cd "/Users/travis/trae ai/ArmStrong Database/AS/as"
   supabase stop
   supabase start
   ```

3. **執行Schema**
   ```bash
   supabase db reset
   ```

## 驗證設置

執行以下命令驗證數據庫連接：

```bash
cd "/Users/travis/trae ai/ArmStrong Database/AS/as"
npm run dev
```

然後訪問：http://localhost:3000

## 故障排除

### 常見問題

1. **Supabase啟動失敗**
   - 檢查Docker是否運行：`docker ps`
   - 重啟Docker Desktop
   - 清理Docker容器：`docker system prune`

2. **端口衝突**
   - 檢查端口使用：`lsof -i :54322`
   - 停止衝突的服務

3. **權限問題**
   - 確保有Docker執行權限
   - 重新安裝Supabase CLI：`brew reinstall supabase/tap/supabase`

## 下一步

數據庫設置完成後，你可以：

1. 測試API端點
2. 配置身份驗證
3. 設置實時訂閱
4. 部署到生產環境

## 聯繫支援

如果遇到問題，請檢查：
- Supabase官方文檔：https://supabase.com/docs
- 項目GitHub Issues
- Discord社區支援