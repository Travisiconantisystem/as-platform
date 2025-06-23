# Vercel 環境變量配置指南

## 概述

本指南將幫助你在 Vercel 中正確配置 AS Platform 所需的所有環境變量。這些變量對於應用的正常運行至關重要。

## 配置方法

### 方法一：使用 Vercel Dashboard（推薦）

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的 AS Platform 項目
3. 進入 **Settings** → **Environment Variables**
4. 按照下面的清單逐一添加環境變量

### 方法二：使用 Vercel CLI

```bash
# 安裝 Vercel CLI（如果尚未安裝）
npm install -g vercel

# 登入 Vercel
vercel login

# 添加環境變量
vercel env add VARIABLE_NAME
```

## 必需環境變量清單

### 🔧 Next.js 基礎配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `NEXTAUTH_URL` | Production, Preview | NextAuth.js 回調 URL | `https://your-domain.vercel.app` |
| `NEXTAUTH_SECRET` | All | NextAuth.js 加密密鑰 | `your-super-secret-key-here` |
| `NODE_ENV` | All | Node.js 環境 | `production` |

### 🗄️ Supabase 數據庫配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase 項目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase 匿名密鑰 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Supabase 服務角色密鑰 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DATABASE_URL` | All | 數據庫連接字符串 | `postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres` |

### 🔐 OAuth 提供商配置

#### Google OAuth
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `GOOGLE_CLIENT_ID` | All | Google OAuth 客戶端 ID | `123456789-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | All | Google OAuth 客戶端密鑰 | `GOCSPX-xxx` |

#### GitHub OAuth
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `GITHUB_CLIENT_ID` | All | GitHub OAuth 應用 ID | `Iv1.xxx` |
| `GITHUB_CLIENT_SECRET` | All | GitHub OAuth 應用密鑰 | `xxx` |

### 🤖 AI 服務配置

#### OpenAI
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `OPENAI_API_KEY` | All | OpenAI API 密鑰 | `sk-xxx` |
| `OPENAI_ORGANIZATION_ID` | All | OpenAI 組織 ID | `org-xxx` |

#### Anthropic
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `ANTHROPIC_API_KEY` | All | Anthropic API 密鑰 | `sk-ant-xxx` |

#### Google AI
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `GOOGLE_AI_API_KEY` | All | Google AI API 密鑰 | `AIzaSyxxx` |

### 🔗 第三方平台 API

#### Slack
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `SLACK_BOT_TOKEN` | All | Slack Bot Token | `xoxb-xxx` |
| `SLACK_SIGNING_SECRET` | All | Slack 簽名密鑰 | `xxx` |
| `SLACK_CLIENT_ID` | All | Slack 應用客戶端 ID | `xxx.xxx` |
| `SLACK_CLIENT_SECRET` | All | Slack 應用客戶端密鑰 | `xxx` |

#### Notion
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `NOTION_API_KEY` | All | Notion 集成密鑰 | `secret_xxx` |
| `NOTION_DATABASE_ID` | All | Notion 數據庫 ID | `xxx-xxx-xxx-xxx-xxx` |

#### Airtable
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `AIRTABLE_API_KEY` | All | Airtable API 密鑰 | `keyxxx` |
| `AIRTABLE_BASE_ID` | All | Airtable Base ID | `appxxx` |

#### HubSpot
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `HUBSPOT_API_KEY` | All | HubSpot API 密鑰 | `xxx-xxx-xxx-xxx-xxx` |
| `HUBSPOT_PORTAL_ID` | All | HubSpot Portal ID | `12345678` |

### 📧 郵件服務配置

#### Resend
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `RESEND_API_KEY` | All | Resend API 密鑰 | `re_xxx` |
| `RESEND_FROM_EMAIL` | All | 發送郵件地址 | `noreply@yourdomain.com` |

#### SendGrid
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `SENDGRID_API_KEY` | All | SendGrid API 密鑰 | `SG.xxx` |
| `SENDGRID_FROM_EMAIL` | All | 發送郵件地址 | `noreply@yourdomain.com` |

### 🗄️ Redis 配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `REDIS_URL` | All | Redis 連接 URL | `redis://default:xxx@xxx.upstash.io:6379` |
| `REDIS_TOKEN` | All | Redis 認證令牌 | `xxx` |

### 📁 文件存儲配置

#### AWS S3
| 變數名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `AWS_ACCESS_KEY_ID` | All | AWS 訪問密鑰 ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | All | AWS 秘密訪問密鑰 | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | All | AWS 區域 | `us-east-1` |
| `AWS_S3_BUCKET` | All | S3 存儲桶名稱 | `as-platform-uploads` |

### ⚙️ 應用配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `APP_NAME` | All | 應用名稱 | `AS Platform` |
| `APP_URL` | All | 應用 URL | `https://your-domain.vercel.app` |
| `API_BASE_URL` | All | API 基礎 URL | `https://your-domain.vercel.app/api` |

### 🔒 安全配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `ENCRYPTION_KEY` | All | 數據加密密鑰 | `your-32-character-encryption-key` |
| `JWT_SECRET` | All | JWT 簽名密鑰 | `your-jwt-secret-key` |
| `WEBHOOK_SECRET` | All | Webhook 驗證密鑰 | `your-webhook-secret` |

### 📊 監控配置

#### Sentry
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `SENTRY_DSN` | All | Sentry DSN | `https://xxx@xxx.ingest.sentry.io/xxx` |
| `SENTRY_ORG` | All | Sentry 組織 | `your-org` |
| `SENTRY_PROJECT` | All | Sentry 項目 | `as-platform` |

#### Vercel Analytics
| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `VERCEL_ANALYTICS_ID` | All | Vercel Analytics ID | `xxx` |

### 🚦 速率限制配置

| 變量名 | 環境 | 描述 | 範例值 |
|--------|------|------|--------|
| `RATE_LIMIT_MAX` | All | 速率限制最大請求數 | `100` |
| `RATE_LIMIT_WINDOW` | All | 速率限制時間窗口（秒） | `3600` |

## 環境特定配置

### Development 環境
- 使用測試 API 密鑰
- 啟用詳細日誌
- 禁用某些安全檢查

### Preview 環境
- 使用生產類似配置
- 啟用測試功能
- 使用預覽域名

### Production 環境
- 使用生產 API 密鑰
- 啟用所有安全功能
- 使用自定義域名

## 配置驗證

### 使用 Vercel CLI 驗證

```bash
# 列出所有環境變量
vercel env ls

# 拉取環境變量到本地
vercel env pull .env.local
```

### 使用健康檢查端點

部署後訪問 `/api/health` 端點檢查配置是否正確：

```bash
curl https://your-domain.vercel.app/api/health
```

## 安全最佳實踐

### 🔐 密鑰管理
1. **永不在代碼中硬編碼密鑰**
2. **使用強密碼生成器**創建密鑰
3. **定期輪換**敏感密鑰
4. **限制訪問權限**，只給必要的服務

### 🛡️ 環境隔離
1. **不同環境使用不同密鑰**
2. **生產環境密鑰絕不用於開發**
3. **使用環境特定的資源**

### 📝 文檔記錄
1. **記錄每個變量的用途**
2. **記錄密鑰的來源和有效期**
3. **建立密鑰輪換計劃**

## 常見問題

### Q: 如何生成安全的密鑰？

```bash
# 生成 32 字符隨機密鑰
openssl rand -hex 32

# 生成 NextAuth.js 密鑰
openssl rand -base64 32
```

### Q: 環境變量沒有生效怎麼辦？

1. 檢查變量名是否正確
2. 確認環境設置正確（Development/Preview/Production）
3. 重新部署應用
4. 檢查 Vercel 函數日誌

### Q: 如何批量導入環境變量？

```bash
# 從 .env 文件批量導入
vercel env add < .env.production
```

### Q: 如何在本地測試環境變量？

```bash
# 從 Vercel 拉取環境變量
vercel env pull .env.local

# 本地運行
npm run dev
```

## 相關資源

- [Vercel 環境變量文檔](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js 配置指南](https://next-auth.js.org/configuration/options)
- [Supabase 環境變量](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Next.js 環境變量](https://nextjs.org/docs/basic-features/environment-variables)

---

**注意**：請確保所有敏感信息都通過環境變量配置，永不將密鑰提交到代碼庫中。