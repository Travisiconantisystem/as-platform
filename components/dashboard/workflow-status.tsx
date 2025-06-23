"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Square, 
  MoreHorizontal,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface WorkflowItem {
  id: string
  name: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'scheduled'
  progress: number
  lastRun?: Date
  nextRun?: Date
  description: string
  executionCount: number
}

interface WorkflowStatusProps {
  workflows?: WorkflowItem[]
  className?: string
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: '客戶外展自動化',
    status: 'running',
    progress: 75,
    lastRun: new Date(Date.now() - 10 * 60 * 1000),
    description: '自動發送個性化冷郵件給潛在客戶',
    executionCount: 142
  },
  {
    id: '2',
    name: 'LinkedIn 聯繫人同步',
    status: 'completed',
    progress: 100,
    lastRun: new Date(Date.now() - 30 * 60 * 1000),
    nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
    description: '定期同步 LinkedIn 聯繫人資料',
    executionCount: 89
  },
  {
    id: '3',
    name: '客戶回應分析',
    status: 'paused',
    progress: 45,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: '分析客戶郵件回應並分類',
    executionCount: 67
  },
  {
    id: '4',
    name: '數據清理工作流程',
    status: 'failed',
    progress: 20,
    lastRun: new Date(Date.now() - 45 * 60 * 1000),
    description: '清理和標準化客戶數據',
    executionCount: 23
  },
  {
    id: '5',
    name: '週報生成',
    status: 'scheduled',
    progress: 0,
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    description: '自動生成週度業務報告',
    executionCount: 12
  }
]

const getStatusIcon = (status: WorkflowItem['status']) => {
  switch (status) {
    case 'running':
      return Play
    case 'paused':
      return Pause
    case 'completed':
      return CheckCircle
    case 'failed':
      return AlertCircle
    case 'scheduled':
      return Clock
    default:
      return Square
  }
}

const getStatusColor = (status: WorkflowItem['status']) => {
  switch (status) {
    case 'running':
      return 'text-blue-500'
    case 'paused':
      return 'text-yellow-500'
    case 'completed':
      return 'text-green-500'
    case 'failed':
      return 'text-red-500'
    case 'scheduled':
      return 'text-gray-500'
    default:
      return 'text-gray-400'
  }
}

const getBadgeVariant = (status: WorkflowItem['status']) => {
  switch (status) {
    case 'running':
      return 'info'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'success'
    case 'failed':
      return 'destructive'
    case 'scheduled':
      return 'secondary'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: WorkflowItem['status']) => {
  switch (status) {
    case 'running':
      return '執行中'
    case 'paused':
      return '已暫停'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失敗'
    case 'scheduled':
      return '已排程'
    default:
      return '未知'
  }
}

const formatTime = (date: Date) => {
  return date.toLocaleString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function WorkflowStatus({ workflows = mockWorkflows, className }: WorkflowStatusProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Workflow className="h-5 w-5" />
          <span>工作流程狀態</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => {
            const StatusIcon = getStatusIcon(workflow.status)
            
            return (
              <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(workflow.status)}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                      <p className="text-sm text-gray-500">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getBadgeVariant(workflow.status)}>
                      {getStatusText(workflow.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>查看詳情</DropdownMenuItem>
                        <DropdownMenuItem>編輯工作流程</DropdownMenuItem>
                        <DropdownMenuItem>複製工作流程</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          刪除工作流程
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {workflow.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">進度</span>
                      <span className="font-medium">{workflow.progress}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="space-x-4">
                    {workflow.lastRun && (
                      <span>上次執行: {formatTime(workflow.lastRun)}</span>
                    )}
                    {workflow.nextRun && (
                      <span>下次執行: {formatTime(workflow.nextRun)}</span>
                    )}
                  </div>
                  <span>執行次數: {workflow.executionCount}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}