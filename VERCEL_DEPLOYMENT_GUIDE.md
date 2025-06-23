# AS Platform Vercel 部署指南

## 📋 部署前準備清單

### 1. 環境要求
- [x] Node.js 18+ 已安裝
- [x] npm 或 pnpm 包管理器
- [x] Git 版本控制
- [x] Vercel 帳戶
- [x] Supabase 項目已設置

### 2. 必要配置文件
- [x] `vercel.json` - Vercel 部署配置
- [x] `next.config.js` - Next.js 配置
- [x] `.env.example` - 環境變量模板
- [x] `package.json` - 項目依賴

## 🚀 部署步驟

### 步驟 1: 準備 Supabase 數據庫

1. **執行數據庫 Schema**
   ```bash
   # 在 Supabase SQL Editor 中執行
   # 1. 先執行 cleanup_schema.sql (如果需要清理)
   # 2. 再執行 schema.sql
   ```

2. **獲取 Supabase 配置**
   - 項目 URL: `https://your-project.supabase.co`
   - Anon Key: 從 Settings > API 獲取
   - Service Role Key: 從 Settings > API 獲取

### 步驟 2: 配置環境變量

1. **創建本地環境文件**
   ```bash
   cp .env.example .env.local
   ```

2. **填入必要的環境變量**
   ```env
   # 基礎配置
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # NextAuth 配置
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   
   # AI 服務配置
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

### 步驟 3: 本地測試

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **本地運行**
   ```bash
   npm run dev
   ```

3. **測試功能**
   - 訪問 http://localhost:3000
   - 測試登入功能
   - 測試 API 端點
   - 檢查數據庫連接

### 步驟 4: 部署到 Vercel

#### 方法 1: 使用 Vercel CLI (推薦)

1. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登入 Vercel**
   ```bash
   vercel login
   ```

3. **初始化項目**
   ```bash
   vercel
   ```
   - 選擇 "Link to existing project" 或 "Create new project"
   - 確認項目設置

4. **設置環境變量**
   ```bash
   # 生產環境變量
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   vercel env add SUPABASE_SERVICE_ROLE_KEY production
   vercel env add NEXTAUTH_SECRET production
   vercel env add OPENAI_API_KEY production
   ```

5. **部署**
   ```bash
   vercel --prod
   ```

#### 方法 2: 使用 Vercel Dashboard

1. **連接 Git 倉庫**
   - 登入 [Vercel Dashboard](https://vercel.com/dashboard)
   - 點擊 "New Project"
   - 選擇 Git 倉庫

2. **配置項目設置**
   - Framework Preset: Next.js
   - Root Directory: `./` (如果項目在根目錄)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **設置環境變量**
   在 Project Settings > Environment Variables 中添加:
   ```
   NEXT_PUBLIC_APP_URL
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   OPENAI_API_KEY
   ANTHROPIC_API_KEY
   ```

4. **部署**
   - 點擊 "Deploy"
   - 等待構建完成

## ⚙️ 部署後配置

### 1. 域名設置

1. **自定義域名** (可選)
   ```bash
   vercel domains add your-domain.com
   ```

2. **更新環境變量**
   ```bash
   # 更新 APP_URL 和 NEXTAUTH_URL
   vercel env rm NEXT_PUBLIC_APP_URL production
   vercel env add NEXT_PUBLIC_APP_URL production
   # 輸入: https://your-domain.com
   ```

### 2. Supabase 配置更新

1. **更新 Auth 設置**
   - 在 Supabase Dashboard > Authentication > URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/api/auth/callback/*`

2. **更新 CORS 設置**
   - 在 Supabase Dashboard > Settings > API
   - 添加你的 Vercel 域名到 CORS origins

### 3. OAuth 提供商配置

1. **Google OAuth**
   - 在 Google Cloud Console 更新 Authorized redirect URIs
   - 添加: `https://your-app.vercel.app/api/auth/callback/google`

2. **GitHub OAuth**
   - 在 GitHub Developer Settings 更新 Authorization callback URL
   - 添加: `https://your-app.vercel.app/api/auth/callback/github`

## 🔍 部署驗證

### 1. 功能測試清單
- [ ] 網站可正常訪問
- [ ] 用戶註冊/登入功能
- [ ] 數據庫連接正常
- [ ] API 端點響應正常
- [ ] OAuth 登入功能
- [ ] AI 功能正常運作
- [ ] Webhook 接收正常

### 2. 性能檢查
```bash
# 使用 Lighthouse 檢查性能
npx lighthouse https://your-app.vercel.app --view
```

### 3. 錯誤監控
- 檢查 Vercel Functions 日誌
- 監控 Supabase 數據庫性能
- 設置 Sentry 錯誤追蹤 (可選)

## 🛠️ 常見問題解決

### 1. 構建失敗
```bash
# 檢查構建日誌
vercel logs your-deployment-url

# 本地測試構建
npm run build
```

### 2. 環境變量問題
```bash
# 檢查環境變量
vercel env ls

# 更新環境變量
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### 3. 數據庫連接問題
- 檢查 Supabase URL 和 API Keys
- 確認 RLS 策略設置正確
- 檢查網絡連接和防火牆設置

### 4. OAuth 登入問題
- 確認 redirect URLs 設置正確
- 檢查 OAuth 應用的域名配置
- 驗證 client ID 和 secret

## 📊 監控和維護

### 1. 性能監控
- Vercel Analytics
- Supabase Dashboard
- 自定義監控指標

### 2. 定期維護
- 更新依賴包
- 監控安全漏洞
- 備份數據庫
- 檢查日誌文件

### 3. 擴展配置
- 設置 CDN 緩存
- 配置負載均衡
- 優化圖片處理
- 實施緩存策略

## 🔗 有用連結

- [Vercel 官方文檔](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 文檔](https://supabase.com/docs)
- [NextAuth.js 配置](https://next-auth.js.org/configuration)

---

**注意**: 請確保所有敏感信息（API Keys、Secrets）都通過環境變量安全管理，切勿在代碼中硬編碼。