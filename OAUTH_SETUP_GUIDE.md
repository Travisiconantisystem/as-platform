# OAuth 設置指南

## 問題診斷
當前遇到 `OAuthCallback` 錯誤，這通常是因為 OAuth 應用的回調 URL 配置不正確。

## 需要檢查的回調 URL

### Google OAuth 應用
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的項目
3. 前往「APIs & Services」>「Credentials」
4. 找到你的 OAuth 2.0 Client ID
5. 在「Authorized redirect URIs」中確保包含：
   ```
   http://localhost:3001/api/auth/callback/google
   ```

### GitHub OAuth 應用
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 選擇你的 OAuth App
3. 在「Authorization callback URL」中確保設置為：
   ```
   http://localhost:3001/api/auth/callback/github
   ```

## 當前環境變量
```
NEXTAUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=919678002643-0de9prn94spqo3cq2fl5hpaohii3pjkj.apps.googleusercontent.com
GITHUB_CLIENT_ID_LOCAL=Ov23liENOCju4s2k2rv4
```

## 測試步驟
1. 確保 OAuth 應用的回調 URL 正確設置
2. 訪問 http://localhost:3001/test-auth 進行測試
3. 嘗試 Google 和 GitHub 登入

## 常見問題
- 確保使用 `http://` 而不是 `https://` 對於 localhost
- 確保端口號正確（3001）
- 確保路徑完整（包含 `/api/auth/callback/provider`）