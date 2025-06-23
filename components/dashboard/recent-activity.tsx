"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Bot, 
  Workflow,
  Globe,
  MessageSquare
} from 'lucide-react'

interface Activity {
  id: string
  type: 'workflow' | 'agent' | 'platform' | 'user' | 'system'
  title: string
  description: string
  status: 'success' | 'error' | 'pending' | 'info'
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
}

interface RecentActivityProps {
  activities?: Activity[]
  className?: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'workflow',
    title: '客戶外展工作流程執行完成',
    description: '成功發送 25 封個性化郵件',
    status: 'success',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    user: {
      name: 'Travis',
      avatar: '/avatars/travis.jpg'
    }
  },
  {
    id: '2',
    type: 'agent',
    title: 'AI 客服智能體回應查詢',
    description: '處理了 12 個客戶查詢，滿意度 95%',
    status: 'success',
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: '3',
    type: 'platform',
    title: 'LinkedIn 平台連接更新',
    description: '同步了 150 個新聯繫人',
    status: 'info',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '4',
    type: 'workflow',
    title: '數據分析工作流程失敗',
    description: 'API 限制達到上限，需要檢查配置',
    status: 'error',
    timestamp: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: '5',
    type: 'user',
    title: '新用戶註冊',
    description: 'john.doe@example.com 加入了團隊',
    status: 'info',
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  }
]

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'workflow':
      return Workflow
    case 'agent':
      return Bot
    case 'platform':
      return Globe
    case 'user':
      return User
    case 'system':
      return MessageSquare
    default:
      return Clock
  }
}

const getStatusIcon = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'pending':
      return Clock
    default:
      return Clock
  }
}

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'pending':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
}

const getBadgeVariant = (status: Activity['status']) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'destructive'
    case 'pending':
      return 'warning'
    default:
      return 'info'
  }
}

export function RecentActivity({ activities = mockActivities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>最近活動</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type)
            const StatusIcon = getStatusIcon(activity.status)
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {activity.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <ActivityIcon className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                      <Badge variant={getBadgeVariant(activity.status)} className="text-xs">
                        {activity.status === 'success' ? '成功' : 
                         activity.status === 'error' ? '失敗' :
                         activity.status === 'pending' ? '進行中' : '資訊'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true,
                      locale: zhTW 
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}