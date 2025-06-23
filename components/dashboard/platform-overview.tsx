"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface Platform {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync?: Date
  syncProgress?: number
  dataCount: number
  description: string
  icon?: string
}

interface PlatformOverviewProps {
  platforms?: Platform[]
  className?: string
}

const mockPlatforms: Platform[] = [
  {
    id: '1',
    name: 'LinkedIn',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000),
    dataCount: 1247,
    description: '專業社交網絡平台',
    icon: '💼'
  },
  {
    id: '2',
    name: 'Gmail',
    status: 'syncing',
    syncProgress: 65,
    dataCount: 3892,
    description: '電子郵件服務',
    icon: '📧'
  },
  {
    id: '3',
    name: 'HubSpot',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    dataCount: 567,
    description: 'CRM 客戶關係管理',
    icon: '🎯'
  },
  {
    id: '4',
    name: 'Slack',
    status: 'error',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    dataCount: 234,
    description: '團隊協作平台',
    icon: '💬'
  },
  {
    id: '5',
    name: 'Google Sheets',
    status: 'disconnected',
    dataCount: 0,
    description: '雲端試算表',
    icon: '📊'
  },
  {
    id: '6',
    name: 'Zapier',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    dataCount: 89,
    description: '自動化整合平台',
    icon: '⚡'
  }
]

const getStatusIcon = (status: Platform['status']) => {
  switch (status) {
    case 'connected':
      return CheckCircle
    case 'disconnected':
      return AlertCircle
    case 'error':
      return AlertCircle
    case 'syncing':
      return RefreshCw
    default:
      return Clock
  }
}

const getStatusColor = (status: Platform['status']) => {
  switch (status) {
    case 'connected':
      return 'text-green-500'
    case 'disconnected':
      return 'text-gray-500'
    case 'error':
      return 'text-red-500'
    case 'syncing':
      return 'text-blue-500'
    default:
      return 'text-gray-400'
  }
}

const getBadgeVariant = (status: Platform['status']) => {
  switch (status) {
    case 'connected':
      return 'success'
    case 'disconnected':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'syncing':
      return 'info'
    default:
      return 'secondary'
  }
}

const getStatusText = (status: Platform['status']) => {
  switch (status) {
    case 'connected':
      return '已連接'
    case 'disconnected':
      return '未連接'
    case 'error':
      return '錯誤'
    case 'syncing':
      return '同步中'
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

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function PlatformOverview({ platforms = mockPlatforms, className }: PlatformOverviewProps) {
  const connectedCount = platforms.filter(p => p.status === 'connected').length
  const totalCount = platforms.length
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>平台連接狀態</span>
          </div>
          <Badge variant="outline">
            {connectedCount}/{totalCount} 已連接
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => {
            const StatusIcon = getStatusIcon(platform.status)
            
            return (
              <div key={platform.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{platform.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-500">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon 
                      className={`h-4 w-4 ${getStatusColor(platform.status)} ${
                        platform.status === 'syncing' ? 'animate-spin' : ''
                      }`} 
                    />
                    <Badge variant={getBadgeVariant(platform.status)} className="text-xs">
                      {getStatusText(platform.status)}
                    </Badge>
                  </div>
                </div>
                
                {platform.status === 'syncing' && platform.syncProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">同步進度</span>
                      <span className="font-medium">{platform.syncProgress}%</span>
                    </div>
                    <Progress value={platform.syncProgress} className="h-2" />
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    {platform.lastSync ? (
                      <span>上次同步: {formatTime(platform.lastSync)}</span>
                    ) : (
                      <span>從未同步</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatNumber(platform.dataCount)}</span>
                    <span className="text-gray-500">筆資料</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {platform.status === 'disconnected' ? (
                    <Button size="sm" className="flex-1">
                      連接
                    </Button>
                  ) : platform.status === 'error' ? (
                    <Button size="sm" variant="outline" className="flex-1">
                      重新連接
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="flex-1">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        同步
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}