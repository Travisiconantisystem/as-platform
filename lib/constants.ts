// AS平台常數定義

// API端點
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PLATFORMS: '/api/platforms',
  WORKFLOWS: '/api/workflows',
  AI_AGENTS: '/api/ai-agents',
  USERS: '/api/users',
  SETTINGS: '/api/settings'
} as const;

// 第三方平台配置
export const SUPPORTED_PLATFORMS = {
  GOOGLE_WORKSPACE: 'google_workspace',
  MICROSOFT_365: 'microsoft_365',
  SLACK: 'slack',
  NOTION: 'notion',
  AIRTABLE: 'airtable',
  HUBSPOT: 'hubspot',
  SALESFORCE: 'salesforce',
  ZAPIER: 'zapier'
} as const;

// N8N工作流程類型
export const WORKFLOW_TYPES = {
  DATA_SYNC: 'data_sync',
  AUTOMATION: 'automation',
  NOTIFICATION: 'notification',
  INTEGRATION: 'integration',
  CUSTOM: 'custom'
} as const;

// AI智能體類型
export const AI_AGENT_TYPES = {
  CHATBOT: 'chatbot',
  ASSISTANT: 'assistant',
  ANALYZER: 'analyzer',
  GENERATOR: 'generator',
  CLASSIFIER: 'classifier'
} as const;

// 用戶角色
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
} as const;

// 主題配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// Apple風格顏色
export const APPLE_COLORS = {
  BLUE: '#007AFF',
  GREEN: '#34C759',
  ORANGE: '#FF9500',
  RED: '#FF3B30',
  PURPLE: '#AF52DE',
  PINK: '#FF2D92',
  TEAL: '#5AC8FA',
  INDIGO: '#5856D6'
} as const;

// 響應式斷點
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
} as const;

// 動畫持續時間
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

// 本地存儲鍵
export const STORAGE_KEYS = {
  THEME: 'as_theme',
  USER_PREFERENCES: 'as_user_preferences',
  SIDEBAR_STATE: 'as_sidebar_state',
  RECENT_WORKFLOWS: 'as_recent_workflows'
} as const;

// 錯誤訊息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網絡連接錯誤，請檢查您的網絡設置',
  UNAUTHORIZED: '您沒有權限執行此操作',
  NOT_FOUND: '請求的資源不存在',
  SERVER_ERROR: '服務器內部錯誤，請稍後再試',
  VALIDATION_ERROR: '輸入數據驗證失敗'
} as const;

// 成功訊息
export const SUCCESS_MESSAGES = {
  SAVED: '保存成功',
  UPDATED: '更新成功',
  DELETED: '刪除成功',
  CREATED: '創建成功',
  CONNECTED: '連接成功'
} as const;