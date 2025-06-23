'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Search,
  Activity,
  Clock,
  Zap,
  Brain,
  MessageSquare,
  Mail,
  BarChart3,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Edit,
  Copy,
  Eye,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store/useAppStore'

interface AIAgent {
  id: string
  name: string
  description: string
  type: 'email' | 'analysis' | 'lead_scoring' | 'content' | 'automation' | 'monitoring'
  status: 'active' | 'paused' | 'error' | 'training'
  isActive: boolean
  createdAt: string
  lastRun: string
  nextRun?: string
  totalRuns: number
  successRate: number
  avgProcessingTime: number
  model: string
  prompt: string
  parameters: {
    temperature: number
    maxTokens: number
    topP: number
  }
  triggers: string[]
  outputs: string[]
  performance: {
    accuracy: number
    efficiency: number
    cost: number
    usage: number
  }
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly'
    time?: string
    days?: string[]
  }
}

const mockAIAgents: AIAgent[] = [
  {
    id: '1',
    name: '個性化郵件生成器',
    description: '根據潛在客戶資料生成個性化的外展郵件',
    type: 'email',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastRun: '2024-01-15T10:30:00Z',
    nextRun: '2024-01-15T11:00:00Z',
    totalRuns: 2847,
    successRate: 94.2,
    avgProcessingTime: 1.8,
    model: 'Claude 3.5 Sonnet',
    prompt: '你是一個專業的銷售郵件撰寫專家。根據提供的潛在客戶資料，撰寫一封個性化的外展郵件...',
    parameters: {
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9
    },
    triggers: ['新潛在客戶', 'Apollo 數據更新'],
    outputs: ['個性化郵件', '主題行建議'],
    performance: {
      accuracy: 92.5,
      efficiency: 88.3,
      cost: 156.78,
      usage: 2847
    },
    schedule: {
      frequency: 'hourly'
    }
  },
  {
    id: '2',
    name: '內容表現分析師',
    description: '分析 Instagram 內容表現並提供優化建議',
    type: 'analysis',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
    lastRun: '2024-01-15T09:15:00Z',
    nextRun: '2024-01-15T12:00:00Z',
    totalRuns: 1456,
    successRate: 96.8,
    avgProcessingTime: 3.2,
    model: 'Claude 3.5 Sonnet',
    prompt: '分析提供的 Instagram 內容數據，包括互動率、觸及率等指標，並提供具體的優化建議...',
    parameters: {
      temperature: 0.3,
      maxTokens: 800,
      topP: 0.8
    },
    triggers: ['Instagram 數據同步', '每日分析'],
    outputs: ['表現報告', '優化建議', '趨勢分析'],
    performance: {
      accuracy: 94.7,
      efficiency: 91.2,
      cost: 234.56,
      usage: 1456
    },
    schedule: {
      frequency: 'daily',
      time: '09:00'
    }
  },
  {
    id: '3',
    name: '潛在客戶評分器',
    description: '評估潛在客戶質量並分配優先級分數',
    type: 'lead_scoring',
    status: 'active',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    lastRun: '2024-01-15T11:45:00Z',
    totalRuns: 3421,
    successRate: 89.7,
    avgProcessingTime: 0.9,
    model: 'Claude 3.5 Sonnet',
    prompt: '根據潛在客戶的公司規模、行業、職位等信息，評估其成為客戶的可能性...',
    parameters: {
      temperature: 0.2,
      maxTokens: 300,
      topP: 0.7
    },
    triggers: ['新潛在客戶', 'Apollo 爬取完成'],
    outputs: ['質量分數', '優先級標籤', '跟進建議'],
    performance: {
      accuracy: 87.3,
      efficiency: 95.1,
      cost: 89.34,
      usage: 3421
    },
    schedule: {
      frequency: 'manual'
    }
  },
  {
    id: '4',
    name: '競爭對手監控器',
    description: '監控競爭對手的社交媒體活動和內容策略',
    type: 'monitoring',
    status: 'paused',
    isActive: false,
    createdAt: '2024-01-10T00:00:00Z',
    lastRun: '2024-01-14T15:30:00Z',
    totalRuns: 234,
    successRate: 92.3,
    avgProcessingTime: 5.7,
    model: 'Claude 3.5 Sonnet',
    prompt: '分析競爭對手的社交媒體內容，識別其內容策略、發布頻率和互動模式...',
    parameters: {
      temperature: 0.4,
      maxTokens: 1000,
      topP: 0.85
    },
    triggers: ['每週監控', '競爭對手更新'],
    outputs: ['競爭分析報告', '策略洞察', '機會識別'],
    performance: {
      accuracy: 89.6,
      efficiency: 76.4,
      cost: 345.67,
      usage: 234
    },
    schedule: {
      frequency: 'weekly',
      days: ['Monday'],
      time: '08:00'
    }
  },
  {
    id: '5',
    name: '內容策略顧問',
    description: '基於數據分析生成內容創作建議和策略',
    type: 'content',
    status: 'training',
    isActive: false,
    createdAt: '2024-01-12T00:00:00Z',
    lastRun: '2024-01-13T14:20:00Z',
    totalRuns: 67,
    successRate: 78.5,
    avgProcessingTime: 4.1,
    model: 'Claude 3.5 Sonnet',
    prompt: '基於歷史內容表現數據和目標受眾分析，生成具體的內容創作建議...',
    parameters: {
      temperature: 0.8,
      maxTokens: 1200,
      topP: 0.9
    },
    triggers: ['內容規劃請求', '月度策略更新'],
    outputs: ['內容建議', '發布時間表', '主題推薦'],
    performance: {
      accuracy: 76.2,
      efficiency: 82.7,
      cost: 123.45,
      usage: 67
    },
    schedule: {
      frequency: 'weekly',
      days: ['Friday'],
      time: '14:00'
    }
  },
  {
    id: '6',
    name: '工作流程優化器',
    description: '分析工作流程表現並提供自動化改進建議',
    type: 'automation',
    status: 'error',
    isActive: false,
    createdAt: '2024-01-08T00:00:00Z',
    lastRun: '2024-01-14T12:10:00Z',
    totalRuns: 145,
    successRate: 65.2,
    avgProcessingTime: 6.3,
    model: 'Claude 3.5 Sonnet',
    prompt: '分析工作流程的執行數據，識別瓶頸和優化機會，提供具體的改進建議...',
    parameters: {
      temperature: 0.5,
      maxTokens: 900,
      topP: 0.8
    },
    triggers: ['工作流程完成', '性能異常'],
    outputs: ['優化報告', '改進建議', '效率分析'],
    performance: {
      accuracy: 68.9,
      efficiency: 71.3,
      cost: 267.89,
      usage: 145
    },
    schedule: {
      frequency: 'daily',
      time: '18:00'
    }
  }
]

function getTypeIcon(type: AIAgent['type']) {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'analysis':
      return <BarChart3 className="h-4 w-4" />
    case 'lead_scoring':
      return <Target className="h-4 w-4" />
    case 'content':
      return <MessageSquare className="h-4 w-4" />
    case 'automation':
      return <Zap className="h-4 w-4" />
    case 'monitoring':
      return <Eye className="h-4 w-4" />
    default:
      return <Bot className="h-4 w-4" />
  }
}

function getTypeName(type: AIAgent['type']) {
  switch (type) {
    case 'email':
      return '郵件生成'
    case 'analysis':
      return '數據分析'
    case 'lead_scoring':
      return '潛客評分'
    case 'content':
      return '內容策略'
    case 'automation':
      return '流程優化'
    case 'monitoring':
      return '監控分析'
    default:
      return '其他'
  }
}

function getStatusIcon(status: AIAgent['status']) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'paused':
      return <Pause className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'training':
      return <Brain className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getStatusColor(status: AIAgent['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'training':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: AIAgent['status']) {
  switch (status) {
    case 'active':
      return '運行中'
    case 'paused':
      return '已暫停'
    case 'error':
      return '異常'
    case 'training':
      return '訓練中'
    default:
      return '未知'
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

function getFrequencyText(frequency: string) {
  switch (frequency) {
    case 'manual':
      return '手動觸發'
    case 'hourly':
      return '每小時'
    case 'daily':
      return '每日'
    case 'weekly':
      return '每週'
    default:
      return '未設定'
  }
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(mockAIAgents)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { aiTasks, setAiTasks } = useAppStore()

  useEffect(() => {
    // 從 store 載入 AI 智能體數據
    if (aiTasks.length === 0) {
      setAiTasks(mockAIAgents)
    } else {
      setAgents(aiTasks)
    }
  }, [aiTasks, setAiTasks])

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || agent.type === typeFilter
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAgentToggle = (agentId: string, isActive: boolean) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, isActive, status: isActive ? 'active' : 'paused' as const }
        : agent
    ))
  }

  const handleAgentAction = (agentId: string, action: 'start' | 'pause' | 'stop' | 'edit' | 'delete' | 'duplicate') => {
    switch (action) {
      case 'start':
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'active' as const, isActive: true }
            : agent
        ))
        break
      case 'pause':
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'paused' as const, isActive: false }
            : agent
        ))
        break
      case 'stop':
        setAgents(prev => prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'paused' as const, isActive: false }
            : agent
        ))
        break
      case 'edit':
        // TODO: 實現編輯功能
        console.log('編輯智能體:', agentId)
        break
      case 'delete':
        setAgents(prev => prev.filter(agent => agent.id !== agentId))
        break
      case 'duplicate':
        const originalAgent = agents.find(a => a.id === agentId)
        if (originalAgent) {
          const newAgent = {
            ...originalAgent,
            id: Date.now().toString(),
            name: `${originalAgent.name} (副本)`,
            status: 'paused' as const,
            isActive: false,
            createdAt: new Date().toISOString(),
            totalRuns: 0
          }
          setAgents(prev => [...prev, newAgent])
        }
        break
    }
  }

  const activeCount = agents.filter(a => a.status === 'active').length
  const errorCount = agents.filter(a => a.status === 'error').length
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0)
  const avgSuccessRate = agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI 智能體</h1>
          <p className="text-muted-foreground">
            管理和監控 AI 智能體的運行狀態
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          創建智能體
        </Button>
      </div>

      {/* 統計概覽 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">運行中</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              共 {agents.length} 個智能體
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總執行次數</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRuns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              本月新增 1,247 次
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成功率</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              目標：95%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">異常智能體</CardTitle>
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
            placeholder="搜索智能體..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getTypeIcon(typeFilter as AIAgent['type'])}
              類型篩選
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter('all')}>
              全部類型
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('email')}>
              郵件生成
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('analysis')}>
              數據分析
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('lead_scoring')}>
              潛客評分
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('content')}>
              內容策略
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('automation')}>
              流程優化
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter('monitoring')}>
              監控分析
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {getStatusIcon(statusFilter as AIAgent['status'])}
              狀態篩選
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              全部狀態
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>
              運行中
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('paused')}>
              已暫停
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('error')}>
              異常
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('training')}>
              訓練中
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 智能體列表 */}
      <div className="grid gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getTypeIcon(agent.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeIcon(agent.type)}
                        <span className="ml-1">{getTypeName(agent.type)}</span>
                      </Badge>
                      <Badge className={getStatusColor(agent.status)}>
                        {getStatusIcon(agent.status)}
                        <span className="ml-1">{getStatusText(agent.status)}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={agent.isActive}
                    onCheckedChange={(checked) => handleAgentToggle(agent.id, checked)}
                    disabled={agent.status === 'error' || agent.status === 'training'}
                  />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAgentAction(agent.id, 'edit')}>
                        <Edit className="h-4 w-4 mr-2" />
                        編輯
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAgentAction(agent.id, 'duplicate')}>
                        <Copy className="h-4 w-4 mr-2" />
                        複製
                      </DropdownMenuItem>
                      {agent.status === 'active' ? (
                        <DropdownMenuItem onClick={() => handleAgentAction(agent.id, 'pause')}>
                          <Pause className="h-4 w-4 mr-2" />
                          暫停
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleAgentAction(agent.id, 'start')}>
                          <Play className="h-4 w-4 mr-2" />
                          啟動
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleAgentAction(agent.id, 'delete')}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        刪除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {agent.description}
              </p>
              
              {/* 基本信息 */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">模型</p>
                  <p className="text-sm font-medium">{agent.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">執行次數</p>
                  <p className="text-sm font-medium">{agent.totalRuns.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">成功率</p>
                  <p className="text-sm font-medium">{agent.successRate}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">平均耗時</p>
                  <p className="text-sm font-medium">{agent.avgProcessingTime}s</p>
                </div>
              </div>
              
              {/* 觸發器和輸出 */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2">觸發條件：</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.triggers.slice(0, 2).map((trigger, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                    {agent.triggers.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.triggers.length - 2} 更多
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">輸出結果：</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.outputs.slice(0, 2).map((output, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {output}
                      </Badge>
                    ))}
                    {agent.outputs.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{agent.outputs.length - 2} 更多
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 執行時間信息 */}
              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最後執行：</span>
                  <span>{formatDate(agent.lastRun)}</span>
                </div>
                {agent.nextRun && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">下次執行：</span>
                    <span>{formatDate(agent.nextRun)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">執行頻率：</span>
                  <span>{getFrequencyText(agent.schedule?.frequency || 'manual')}</span>
                </div>
              </div>
              
              {/* 性能指標 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">性能指標：</p>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">準確率：</span>
                    <span>{agent.performance.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">效率：</span>
                    <span>{agent.performance.efficiency}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">成本：</span>
                    <span>${agent.performance.cost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">使用量：</span>
                    <span>{agent.performance.usage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">沒有找到智能體</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? '請調整搜索條件或篩選器' 
                : '開始創建您的第一個 AI 智能體'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              創建智能體
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 創建智能體對話框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>創建新的 AI 智能體</DialogTitle>
            <DialogDescription>
              配置您的 AI 智能體以自動化特定任務
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">智能體名稱</Label>
                <Input id="name" placeholder="輸入智能體名稱" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">類型</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇智能體類型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">郵件生成</SelectItem>
                    <SelectItem value="analysis">數據分析</SelectItem>
                    <SelectItem value="lead_scoring">潛客評分</SelectItem>
                    <SelectItem value="content">內容策略</SelectItem>
                    <SelectItem value="automation">流程優化</SelectItem>
                    <SelectItem value="monitoring">監控分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input id="description" placeholder="描述智能體的功能" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt">系統提示詞</Label>
              <Textarea 
                id="prompt" 
                placeholder="輸入智能體的系統提示詞..." 
                rows={4}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">創造性 (Temperature)</Label>
                <Input id="temperature" type="number" min="0" max="1" step="0.1" defaultValue="0.7" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTokens">最大 Token 數</Label>
                <Input id="maxTokens" type="number" min="100" max="2000" defaultValue="500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topP">Top P</Label>
                <Input id="topP" type="number" min="0" max="1" step="0.1" defaultValue="0.9" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              創建智能體
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}