// AS平台類型定義

// 基礎類型
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用戶相關類型
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  preferences: UserPreferences;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  workflow: boolean;
  system: boolean;
}

// 第三方平台相關類型
export interface Platform extends BaseEntity {
  name: string;
  type: string;
  description: string;
  icon: string;
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  credentials?: PlatformCredentials;
  settings: PlatformSettings;
  lastSyncAt?: Date;
}

export interface PlatformCredentials {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  [key: string]: any;
}

export interface PlatformSettings {
  syncInterval: number;
  autoSync: boolean;
  dataMapping: Record<string, string>;
  filters: Record<string, any>;
  [key: string]: any;
}

// N8N工作流程相關類型
export interface Workflow extends BaseEntity {
  name: string;
  description: string;
  type: 'data_sync' | 'automation' | 'notification' | 'integration' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'draft';
  n8nWorkflowId?: string;
  configuration: WorkflowConfiguration;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  schedule?: WorkflowSchedule;
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;
  successCount: number;
  errorCount: number;
}

export interface WorkflowConfiguration {
  timeout: number;
  retryCount: number;
  errorHandling: 'stop' | 'continue' | 'retry';
  logging: boolean;
  [key: string]: any;
}

export interface WorkflowTrigger {
  id: string;
  type: 'webhook' | 'schedule' | 'manual' | 'platform_event';
  configuration: Record<string, any>;
  isEnabled: boolean;
}

export interface WorkflowAction {
  id: string;
  type: string;
  name: string;
  configuration: Record<string, any>;
  order: number;
  isEnabled: boolean;
}

export interface WorkflowSchedule {
  type: 'interval' | 'cron';
  value: string;
  timezone: string;
  isEnabled: boolean;
}

export interface WorkflowRun extends BaseEntity {
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  logs: WorkflowLog[];
  error?: string;
  result?: Record<string, any>;
}

export interface WorkflowLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: Record<string, any>;
}

// AI智能體相關類型
export interface AIAgent extends BaseEntity {
  name: string;
  description: string;
  type: 'chatbot' | 'assistant' | 'analyzer' | 'generator' | 'classifier';
  status: 'active' | 'inactive' | 'training' | 'error';
  model: string;
  configuration: AIAgentConfiguration;
  capabilities: string[];
  integrations: string[];
  metrics: AIAgentMetrics;
}

export interface AIAgentConfiguration {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  contextWindow: number;
  responseFormat: 'text' | 'json' | 'structured';
  tools: AITool[];
  [key: string]: any;
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  isEnabled: boolean;
}

export interface AIAgentMetrics {
  totalInteractions: number;
  successRate: number;
  averageResponseTime: number;
  lastInteractionAt?: Date;
  popularQueries: string[];
}

export interface AIConversation extends BaseEntity {
  agentId: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  status: 'active' | 'archived';
  metadata: Record<string, any>;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 系統設置相關類型
export interface SystemSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
  ai: AISettings;
}

export interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  ipWhitelist: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export interface IntegrationSettings {
  n8nUrl: string;
  n8nApiKey: string;
  webhookSecret: string;
  rateLimits: Record<string, number>;
}

export interface AISettings {
  defaultModel: string;
  apiKeys: Record<string, string>;
  rateLimits: Record<string, number>;
  contentFiltering: boolean;
}

// API響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  error?: string;
  message?: string;
}

// 表單相關類型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

// 導航相關類型
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  badge?: string | number;
}

// 儀表板相關類型
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  configuration: Record<string, any>;
  data?: any;
}

export interface DashboardMetric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  format?: 'number' | 'percentage' | 'currency';
}

// 事件相關類型
export interface SystemEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  userId?: string;
}

// 搜索相關類型
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
  facets?: SearchFacet[];
}

export interface SearchFacet {
  name: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

// 文件上傳相關類型
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

// 主題相關類型
export interface ThemeConfig {
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}