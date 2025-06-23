'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store/useAppStore'

interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft' | 'error'
  trigger: string
  lastRun?: string
  nextRun?: string
  runCount: number
  successRate: number
  createdAt: string
  updatedAt: string
}

const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Apollo 聯絡人自動化',
    description: '自動處理 Apollo 爬取的聯絡人數據，進行 AI 分析和評分',
    status: 'active',
    trigger: 'webhook',
    lastRun: '2024-01-15T10:30:00Z',
    nextRun: '2024-01-15T11:00:00Z',
    runCount: 1247,
    successRate: 98.5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Instagram 內容分析',
    description: '分析 Instagram 貼文表現，生成優化建議',
    status: 'active',
    trigger: 'schedule',
    lastRun: '2024-01-15T09:00:00Z',
    nextRun: '2024-01-16T09:00:00Z',
    runCount: 456,
    successRate: 95.2,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '3',
    name: '個性化郵件生成',
    description: '根據潛在客戶資料生成個性化外展郵件',
    status: 'paused',
    trigger: 'manual',
    lastRun: '2024-01-14T16:45:00Z',
    runCount: 89,
    successRate: 92.1,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: '4',
    name: 'AI 智能體監控',
    description: '監控 AI 智能體狀態，自動處理異常情況',
    status: 'error',
    trigger: 'event',
    lastRun: '2024-01-15T08:15:00Z',
    runCount: 234,
    successRate: 87.3,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-15T08:15:00Z'
  }
]

function getStatusIcon(status: Workflow['status']) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'paused':
      return <Pause className="h-4 w-4 text-yellow-500" />
    case 'draft':
      return <Clock className="h-4 w-4 text-gray-500" />
    case 'error':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

function getStatusColor(status: Workflow['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
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

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { workflows: storeWorkflows, setWorkflows: setStoreWorkflows } = useAppStore()

  useEffect(() => {
    // 從 store 載入工作流程數據
    if (storeWorkflows.length === 0) {
      setStoreWorkflows(mockWorkflows)
    } else {
      setWorkflows(storeWorkflows)
    }
  }, [storeWorkflows, setStoreWorkflows])

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleWorkflowAction = (workflowId: string, action: 'start' | 'pause' | 'delete' | 'edit') => {
    switch (action) {
      case 'start':
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, status: 'active' as const } : w
        ))
        break
      case 'pause':
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, status: 'paused' as const } : w
        ))
        break
      case 'delete':
        setWorkflows(prev => prev.filter(w => w.id !== workflowId))
        break
      case 'edit':
        console.log('編輯工作流程:', workflowId)
        break
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工作流程管理</h1>
          <p className="text-muted-foreground">
            管理和監控您的自動化工作流程
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新建工作流程
        </Button>
      </div>

      {/* 統計概覽 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總工作流程</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.filter(w => w.status === 'active').length} 個運行中
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總執行次數</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.reduce((sum, w) => sum + w.runCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              本月新增 1,247 次
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              較上月提升 2.3%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">異常工作流程</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.filter(w => w.status === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">
              需要立即處理
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和篩選 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索工作流程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
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
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              草稿
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('error')}>
              異常
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 工作流程列表 */}
      <div className="grid gap-4">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {workflow.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status === 'active' && '運行中'}
                    {workflow.status === 'paused' && '已暫停'}
                    {workflow.status === 'draft' && '草稿'}
                    {workflow.status === 'error' && '異常'}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {workflow.status === 'paused' || workflow.status === 'error' ? (
                        <DropdownMenuItem onClick={() => handleWorkflowAction(workflow.id, 'start')}>
                          <Play className="h-4 w-4 mr-2" />
                          啟動
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleWorkflowAction(workflow.id, 'pause')}>
                          <Pause className="h-4 w-4 mr-2" />
                          暫停
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleWorkflowAction(workflow.id, 'edit')}>
                        <Settings className="h-4 w-4 mr-2" />
                        編輯
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleWorkflowAction(workflow.id, 'delete')}
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
            
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">觸發方式</p>
                  <p className="font-medium">
                    {workflow.trigger === 'webhook' && 'Webhook'}
                    {workflow.trigger === 'schedule' && '定時執行'}
                    {workflow.trigger === 'manual' && '手動觸發'}
                    {workflow.trigger === 'event' && '事件觸發'}
                  </p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">執行次數</p>
                  <p className="font-medium">{workflow.runCount.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">成功率</p>
                  <p className="font-medium">{workflow.successRate}%</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">最後執行</p>
                  <p className="font-medium">
                    {workflow.lastRun ? formatDate(workflow.lastRun) : '從未執行'}
                  </p>
                </div>
              </div>
              
              {workflow.nextRun && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    下次執行時間：{formatDate(workflow.nextRun)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">沒有找到工作流程</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? '請調整搜索條件或篩選器' 
                : '開始創建您的第一個自動化工作流程'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新建工作流程
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}