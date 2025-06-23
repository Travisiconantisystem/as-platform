"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Bot,
  Brain,
  MessageSquare,
  Zap,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AIAgent {
  id: string
  name: string
  type: 'customer_service' | 'sales' | 'analysis' | 'content' | 'automation'
  status: 'active' | 'inactive' | 'training' | 'error'
  performance: {
    accuracy: number
    responseTime: number // in ms
    tasksCompleted: number
    successRate: number
  }
  lastActive: Date
  description: string
  avatar?: string
}

interface AIAgentsStatusProps {
  agents?: AIAgent[]
  className?: string
}

const mockAgents: AIAgent[] = [
  {
    id: '1',
    name: 'CustomerCare AI',
    type: 'customer_service',
    status: 'active',
    performance: {
      accuracy: 94,
      responseTime: 1200,
      tasksCompleted: 1847,
      successRate: 96
    },
    lastActive: new Date(Date.now() - 2 * 60 * 1000),
    description: '24/7 客戶服務智能助手',
    avatar: '/avatars/customer-ai.jpg'
  },
  {
    id: '2',
    name: 'SalesBot Pro',
    type: 'sales',
    status: 'active',
    performance: {
      accuracy: 87,
      responseTime: 800,
      tasksCompleted: 623,
      successRate: 89
    },
    lastActive: new Date(Date.now() - 5 * 60 * 1000),
    description: '智能銷售助手和潛客開發',
    avatar: '/avatars/sales-ai.jpg'
  },
  {
    id: '3',
    name: 'DataAnalyst AI',
    type: 'analysis',
    status: 'training',
    performance: {
      accuracy: 78,
      responseTime: 3500,
      tasksCompleted: 234,
      successRate: 82
    },
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    description: '數據分析和洞察生成',
    avatar: '/avatars/analyst-ai.jpg'
  },
  {
    id: '4',
    name: 'ContentCreator AI',
    type: 'content',
    status: 'inactive',
    performance: {
      accuracy: 91,
      responseTime: 2100,
      tasksCompleted: 456,
      successRate: 93
    },
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    description: '自動內容創作和優化',
    avatar: '/avatars/content-ai.jpg'
  },
  {
    id: '5',
    name: 'AutoFlow AI',
    type: 'automation',
    status: 'error',
    performance: {
      accuracy: 65,
      responseTime: 1800,
      tasksCompleted: 89,
      successRate: 71
    },
    lastActive: new Date(Date.now() - 45 * 60 * 1000),
    description: '工作流程自動化執行',
    avatar: '/avatars/automation-ai.jpg'
  }
]

const getTypeIcon = (type: AIAgent['type']) => {
  switch (type) {
    case 'customer_service':
      return MessageSquare
    case 'sales':
      return TrendingUp
    case 'analysis':
      return Brain
    case 'content':
      return Zap
    case 'automation':
      return Bot
    default:
      return Bot
  }
}

// getStatusColor function removed as it was unused

const getBadgeVariant = (status: AIAgent['status']) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'training':
      return 'info'
    case 'error':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: AIAgent['status']) => {
  switch (status) {
    case 'active':
      return '運行中'
    case 'inactive':
      return '已停止'
    case 'training':
      return '訓練中'
    case 'error':
      return '錯誤'
    default:
      return '未知'
  }
}

const getTypeText = (type: AIAgent['type']) => {
  switch (type) {
    case 'customer_service':
      return '客戶服務'
    case 'sales':
      return '銷售助手'
    case 'analysis':
      return '數據分析'
    case 'content':
      return '內容創作'
    case 'automation':
      return '自動化'
    default:
      return '未知'
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) {
    return `${minutes} 分鐘前`
  } else {
    return `${hours} 小時前`
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function AIAgentsStatus({ agents = mockAgents, className }: AIAgentsStatusProps) {
  const activeCount = agents.filter(a => a.status === 'active').length
  const totalCount = agents.length
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI 智能體狀態</span>
          </div>
          <Badge variant="outline">
            {activeCount}/{totalCount} 運行中
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => {
            const TypeIcon = getTypeIcon(agent.type)
            
            return (
              <div key={agent.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={agent.avatar} />
                      <AvatarFallback>
                        <TypeIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{agent.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getTypeText(agent.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getBadgeVariant(agent.status)}>
                      {getStatusText(agent.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          設置
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {agent.status === 'active' ? (
                            <><Pause className="h-4 w-4 mr-2" />暫停</>
                          ) : (
                            <><Play className="h-4 w-4 mr-2" />啟動</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>查看日誌</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          刪除智能體
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {agent.status === 'training' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">訓練進度</span>
                      <span className="font-medium">{agent.performance.accuracy}%</span>
                    </div>
                    <Progress value={agent.performance.accuracy} className="h-2" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {agent.performance.accuracy}%
                    </div>
                    <div className="text-gray-500">準確率</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {agent.performance.responseTime}ms
                    </div>
                    <div className="text-gray-500">回應時間</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {formatNumber(agent.performance.tasksCompleted)}
                    </div>
                    <div className="text-gray-500">完成任務</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {agent.performance.successRate}%
                    </div>
                    <div className="text-gray-500">成功率</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>上次活動: {formatTime(agent.lastActive)}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'active' ? 'bg-green-500' :
                    agent.status === 'training' ? 'bg-blue-500 animate-pulse' :
                    agent.status === 'error' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}