"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity,
  Wifi,
  Cpu,
  HardDrive,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface SystemMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: {
    warning: number
    critical: number
  }
  icon: React.ComponentType<{ className?: string }>
}

interface ServiceStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'degraded'
  uptime: number // percentage
  responseTime: number // ms
  lastCheck: Date
}

interface SystemHealthProps {
  metrics?: SystemMetric[]
  services?: ServiceStatus[]
  className?: string
}

const mockMetrics: SystemMetric[] = [
  {
    id: '1',
    name: 'CPU 使用率',
    value: 45,
    unit: '%',
    status: 'healthy',
    threshold: { warning: 70, critical: 90 },
    icon: Cpu
  },
  {
    id: '2',
    name: '記憶體使用',
    value: 68,
    unit: '%',
    status: 'warning',
    threshold: { warning: 80, critical: 95 },
    icon: MemoryStick
  },
  {
    id: '3',
    name: '磁碟空間',
    value: 34,
    unit: '%',
    status: 'healthy',
    threshold: { warning: 80, critical: 95 },
    icon: HardDrive
  },
  {
    id: '4',
    name: '網路延遲',
    value: 23,
    unit: 'ms',
    status: 'healthy',
    threshold: { warning: 100, critical: 200 },
    icon: Wifi
  }
]

const mockServices: ServiceStatus[] = [
  {
    id: '1',
    name: 'API 服務',
    status: 'online',
    uptime: 99.9,
    responseTime: 145,
    lastCheck: new Date(Date.now() - 30 * 1000)
  },
  {
    id: '2',
    name: '資料庫',
    status: 'online',
    uptime: 99.8,
    responseTime: 89,
    lastCheck: new Date(Date.now() - 45 * 1000)
  },
  {
    id: '3',
    name: 'AI 推理引擎',
    status: 'degraded',
    uptime: 97.2,
    responseTime: 2340,
    lastCheck: new Date(Date.now() - 60 * 1000)
  },
  {
    id: '4',
    name: '郵件服務',
    status: 'online',
    uptime: 99.5,
    responseTime: 567,
    lastCheck: new Date(Date.now() - 20 * 1000)
  },
  {
    id: '5',
    name: '檔案儲存',
    status: 'offline',
    uptime: 0,
    responseTime: 0,
    lastCheck: new Date(Date.now() - 5 * 60 * 1000)
  }
]

const getMetricStatusColor = (status: SystemMetric['status']) => {
  switch (status) {
    case 'healthy':
      return 'text-green-500'
    case 'warning':
      return 'text-yellow-500'
    case 'critical':
      return 'text-red-500'
    default:
      return 'text-gray-400'
  }
}

const getMetricBadgeVariant = (status: SystemMetric['status']) => {
  switch (status) {
    case 'healthy':
      return 'success'
    case 'warning':
      return 'warning'
    case 'critical':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getServiceStatusColor = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'online':
      return 'text-green-500'
    case 'degraded':
      return 'text-yellow-500'
    case 'offline':
      return 'text-red-500'
    default:
      return 'text-gray-400'
  }
}

const getServiceBadgeVariant = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'online':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'offline':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const getServiceStatusText = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'online':
      return '正常'
    case 'degraded':
      return '降級'
    case 'offline':
      return '離線'
    default:
      return '未知'
  }
}

const getServiceIcon = (status: ServiceStatus['status']) => {
  switch (status) {
    case 'online':
      return CheckCircle
    case 'degraded':
      return AlertTriangle
    case 'offline':
      return AlertTriangle
    default:
      return AlertTriangle
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (seconds < 60) {
    return `${seconds} 秒前`
  } else {
    return `${minutes} 分鐘前`
  }
}

export function SystemHealth({ 
  metrics = mockMetrics, 
  services = mockServices, 
  className 
}: SystemHealthProps) {
  const healthyServices = services.filter(s => s.status === 'online').length
  const totalServices = services.length
  const overallHealth = (healthyServices / totalServices) * 100
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>系統健康狀態</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={overallHealth >= 90 ? 'success' : overallHealth >= 70 ? 'warning' : 'destructive'}>
              {overallHealth.toFixed(1)}% 健康
            </Badge>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 系統指標 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">系統指標</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              
              return (
                <div key={metric.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-4 w-4 ${getMetricStatusColor(metric.status)}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <Badge variant={getMetricBadgeVariant(metric.status)} className="text-xs">
                      {metric.value}{metric.unit}
                    </Badge>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className={`h-2 ${
                      metric.status === 'critical' ? '[&>div]:bg-red-500' :
                      metric.status === 'warning' ? '[&>div]:bg-yellow-500' :
                      '[&>div]:bg-green-500'
                    }`}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>警告: {metric.threshold.warning}{metric.unit}</span>
                    <span>危險: {metric.threshold.critical}{metric.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 服務狀態 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">服務狀態</h4>
          <div className="space-y-3">
            {services.map((service) => {
              const StatusIcon = getServiceIcon(service.status)
              
              return (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-4 w-4 ${getServiceStatusColor(service.status)}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{service.name}</span>
                        <Badge variant={getServiceBadgeVariant(service.status)} className="text-xs">
                          {getServiceStatusText(service.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>運行時間: {service.uptime}%</span>
                        <span>回應時間: {service.responseTime}ms</span>
                        <span>檢查時間: {formatTime(service.lastCheck)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    service.status === 'online' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}