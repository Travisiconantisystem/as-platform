'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Settings, 
  Trash2, 
  Search,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Globe,
  Database,
  Bot,
  Mail,
  MessageSquare,
  BarChart3,
  Users,
  FileText,
  Image
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store/useAppStore'

interface Integration {
  id: string
  name: string
  description: string
  category: 'social' | 'crm' | 'email' | 'analytics' | 'ai' | 'automation' | 'storage'
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  icon: React.ComponentType<{ className?: string }>
  provider: string
  connectedAt?: string
  lastSync?: string
  dataCount?: number
  webhookUrl?: string
  apiKey?: string
  isActive: boolean
  features: string[]
}

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Apollo.io',
    description: '聯絡人數據爬取和潛在客戶開發',
    category: 'crm',
    status: 'connected',
    icon: Users,
    provider: 'apollo.io',
    connectedAt: '2024-01-01T00:00:00Z',
    lastSync: '2024-01-15T10:30:00Z',
    dataCount: 15420,
    webhookUrl: 'https://as-platform.vercel.app/api/webhooks/apollo',
    isActive: true,
    features: ['聯絡人爬取', '公司資料', '郵件驗證', '潛在客戶評分']
  },
  {
    id: '2',
    name: 'Instagram Business',
    description: 'Instagram 內容分析和表現監控',
    category: 'social',
    status: 'connected',
    icon: Image,
    provider: 'instagram.com',
    connectedAt: '2024-01-05T00:00:00Z',
    lastSync: '2024-01-15T09:00:00Z',
    dataCount: 2847,
    webhookUrl: 'https://as-platform.vercel.app/api/webhooks/instagram',
    isActive: true,
    features: ['貼文分析', '互動監控', '受眾洞察', '競爭對手分析']
  },
  {
    id: '3',
    name: 'Claude AI',
    description: 'AI 智能體和內容生成服務',
    category: 'ai',
    status: 'connected',
    icon: Bot,
    provider: 'anthropic.com',
    connectedAt: '2024-01-01T00:00:00Z',
    lastSync: '2024-01-15T11:15:00Z',
    dataCount: 8934,
    isActive: true,
    features: ['文本生成', '內容分析', '郵件個性化', '數據洞察']
  },
  {
    id: '4',
    name: 'N8N Automation',
    description: '工作流程自動化和數據處理',
    category: 'automation',
    status: 'connected',
    icon: Zap,
    provider: 'n8n.io',
    connectedAt: '2024-01-01T00:00:00Z',
    lastSync: '2024-01-15T10:45:00Z',
    dataCount: 1247,
    webhookUrl: 'https://n8n.example.com/webhook/as-platform',
    isActive: true,
    features: ['工作流程執行', '數據轉換', 'API 整合', '定時任務']
  },
  {
    id: '5',
    name: 'Gmail',
    description: '郵件發送和管理服務',
    category: 'email',
    status: 'pending',
    icon: Mail,
    provider: 'gmail.com',
    isActive: false,
    features: ['郵件發送', '模板管理', '追蹤分析', '自動回覆']
  },
  {
    id: '6',
    name: 'Slack',
    description: '團隊溝通和通知服務',
    category: 'automation',
    status: 'disconnected',
    icon: MessageSquare,
    provider: 'slack.com',
    isActive: false,
    features: ['即時通知', '團隊協作', '工作流程更新', '錯誤警報']
  },
  {
    id: '7',
    name: 'Google Analytics',
    description: '網站流量和用戶行為分析',
    category: 'analytics',
    status: 'error',
    icon: BarChart3,
    provider: 'analytics.google.com',
    connectedAt: '2024-01-10T00:00:00Z',
    lastSync: '2024-01-14T15:30:00Z',
    dataCount: 5623,
    isActive: false,
    features: ['流量分析', '轉換追蹤', '用戶洞察', '自定義報告']
  },
  {
    id: '8',
    name: 'Notion',
    description: '知識管理和文檔協作',
    category: 'storage',
    status: 'disconnected',
    icon: FileText,
    provider: 'notion.so',
    isActive: false,
    features: ['文檔管理', '數據庫', '團隊協作', '模板庫']
  }
]

function getStatusIcon(status: Integration['status']) {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'disconnected':
      return <Clock className="h-4 w-4 text-gray-500" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getStatusColor(status: Integration['status']) {
  switch (status) {
    case 'connected':
      return 'bg-green-100 text-green-800'
    case 'disconnected':
      return 'bg-gray-100 text-gray-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getCategoryIcon(category: Integration['category']) {
  switch (category) {
    case 'social':
      return <Image className="h-4 w-4" />
    case 'crm':
      return <Users className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'analytics':
      return <BarChart3 className="h-4 w-4" />
    case 'ai':
      return <Bot className="h-4 w-4" />
    case 'automation':
      return <Zap className="h-4 w-4" />
    case 'storage':
      return <Database className="h-4 w-4" />
    default:
      return <Globe className="h-4 w-4" />
  }
}

function getCategoryName(category: Integration['category']) {
  switch (category) {
    case 'social':
      return '社交媒體'
    case 'crm':
      return '客戶關係'
    case 'email':
      return '郵件服務'
    case 'analytics':
      return '數據分析'
    case 'ai':
      return 'AI 服務'
    case 'automation':
      return '自動化'
    case 'storage':
      return '存儲服務'
    default:
      return '其他'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { integrations: storeIntegrations, setIntegrations: setStoreIntegrations } = useAppStore()

  useEffect(() => {
    // 從 store 載入整合數據
    if (storeIntegrations.length === 0) {
      setStoreIntegrations(mockIntegrations)
    } else {
      setIntegrations(storeIntegrations)
    }
  }, [storeIntegrations, setStoreIntegrations])

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleIntegrationToggle = (integrationId: string, isActive: boolean) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isActive, status: isActive ? 'connected' : 'disconnected' as const }
        : integration
    ))
  }

  const handleIntegrationAction = (integrationId: string, action: 'connect' | 'disconnect' | 'configure' | 'delete') => {
    switch (action) {
      case 'connect':
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'connected' as const, isActive: true, connectedAt: new Date().toISOString() }
            : integration
        ))
        break
      case 'disconnect':
        setIntegrations(prev => prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: 'disconnected' as const, isActive: false }
            : integration
        ))
        break
      case 'configure':
        console.log('配置整合:', integrationId)
        break
      case 'delete':
        setIntegrations(prev => prev.filter(integration => integration.id !== integrationId))
        break
    }
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length
  const activeCount = integrations.filter(i => i.isActive).length
  const errorCount = integrations.filter(i => i.status === 'error').length
  const totalDataCount = integrations.reduce((sum, i) => sum + (i.dataCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">整合管理</h1>
          <p className="text-muted-foreground">
            管理第三方平台連接和數據同步
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增整合
        </Button>
      </div>

      {/* 統計概覽 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已連接整合</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">
              共 {integrations.length} 個可用整合
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍整合</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              正在同步數據
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總數據量</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDataCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              本月新增 5,247 筆
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">異常整合</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              需要檢查配置
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和篩選 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索整合..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getCategoryIcon(categoryFilter as Integration['category'])}
              分類篩選
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
              全部分類
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('social')}>
              社交媒體
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('crm')}>
              客戶關係
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('email')}>
              郵件服務
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('analytics')}>
              數據分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('ai')}>
              AI 服務
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('automation')}>
              自動化
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCategoryFilter('storage')}>
              存儲服務
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getStatusIcon(statusFilter as Integration['status'])}
              狀態篩選
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              全部狀態
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('connected')}>
              已連接
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('disconnected')}>
              未連接
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              待處理
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('error')}>
              異常
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 整合列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const IconComponent = integration.icon
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(integration.category)}
                          <span className="ml-1">{getCategoryName(integration.category)}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' && '已連接'}
                      {integration.status === 'disconnected' && '未連接'}
                      {integration.status === 'error' && '異常'}
                      {integration.status === 'pending' && '待處理'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
                
                {/* 功能列表 */}
                <div>
                  <p className="text-sm font-medium mb-2">主要功能：</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{integration.features.length - 3} 更多
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* 連接信息 */}
                {integration.status === 'connected' && (
                  <div className="space-y-2 text-sm">
                    {integration.connectedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">連接時間：</span>
                        <span>{formatDate(integration.connectedAt)}</span>
                      </div>
                    )}
                    {integration.lastSync && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最後同步：</span>
                        <span>{formatDate(integration.lastSync)}</span>
                      </div>
                    )}
                    {integration.dataCount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">數據量：</span>
                        <span>{integration.dataCount.toLocaleString()} 筆</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Webhook URL */}
                {integration.webhookUrl && integration.status === 'connected' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Webhook URL：</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                        {integration.webhookUrl}
                      </code>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* 操作按鈕 */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={integration.isActive}
                      onCheckedChange={(checked) => handleIntegrationToggle(integration.id, checked)}
                      disabled={integration.status === 'error' || integration.status === 'pending'}
                    />
                    <span className="text-sm text-muted-foreground">
                      {integration.isActive ? '啟用' : '停用'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {integration.status === 'disconnected' || integration.status === 'error' ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleIntegrationAction(integration.id, 'connect')}
                      >
                        連接
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleIntegrationAction(integration.id, 'disconnect')}
                      >
                        斷開
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleIntegrationAction(integration.id, 'configure')}>
                          <Settings className="h-4 w-4 mr-2" />
                          配置
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleIntegrationAction(integration.id, 'delete')}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          刪除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {filteredIntegrations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">沒有找到整合</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? '請調整搜索條件或篩選器' 
                : '開始連接您的第一個第三方平台整合'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增整合
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}