'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Mail, 
  Target,
  Clock,
  DollarSign,
  Activity,
  Eye,
  MousePointer,
  MessageSquare,
  Heart,
  Share,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store/useAppStore'

interface AnalyticsData {
  period: string
  totalLeads: number
  qualifiedLeads: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  emailsReplied: number
  conversionRate: number
  avgResponseTime: number
  revenue: number
  cost: number
  roi: number
}

interface SocialMetrics {
  platform: string
  followers: number
  engagement: number
  reach: number
  impressions: number
  clicks: number
  shares: number
  comments: number
  likes: number
  posts: number
  growthRate: number
}

interface WorkflowMetrics {
  id: string
  name: string
  executions: number
  successRate: number
  avgDuration: number
  errors: number
  lastRun: string
  status: 'active' | 'paused' | 'error'
}

const mockAnalyticsData: AnalyticsData[] = [
  {
    period: '本週',
    totalLeads: 1247,
    qualifiedLeads: 423,
    emailsSent: 2847,
    emailsOpened: 1139,
    emailsClicked: 284,
    emailsReplied: 97,
    conversionRate: 7.8,
    avgResponseTime: 4.2,
    revenue: 45600,
    cost: 8900,
    roi: 412
  },
  {
    period: '上週',
    totalLeads: 1156,
    qualifiedLeads: 389,
    emailsSent: 2634,
    emailsOpened: 1027,
    emailsClicked: 247,
    emailsReplied: 84,
    conversionRate: 6.9,
    avgResponseTime: 4.8,
    revenue: 41200,
    cost: 8200,
    roi: 402
  }
]

const mockSocialMetrics: SocialMetrics[] = [
  {
    platform: 'Instagram',
    followers: 15420,
    engagement: 4.2,
    reach: 89340,
    impressions: 156780,
    clicks: 2847,
    shares: 456,
    comments: 1234,
    likes: 8967,
    posts: 24,
    growthRate: 12.5
  },
  {
    platform: 'LinkedIn',
    followers: 8934,
    engagement: 6.8,
    reach: 45670,
    impressions: 78920,
    clicks: 1567,
    shares: 234,
    comments: 567,
    likes: 3456,
    posts: 18,
    growthRate: 8.3
  },
  {
    platform: 'Facebook',
    followers: 12567,
    engagement: 3.1,
    reach: 67890,
    impressions: 123450,
    clicks: 1890,
    shares: 345,
    comments: 789,
    likes: 5678,
    posts: 21,
    growthRate: 5.7
  }
]

const mockWorkflowMetrics: WorkflowMetrics[] = [
  {
    id: '1',
    name: 'Apollo 潛在客戶爬取',
    executions: 1247,
    successRate: 98.5,
    avgDuration: 2.3,
    errors: 18,
    lastRun: '2024-01-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Instagram 內容分析',
    executions: 856,
    successRate: 96.2,
    avgDuration: 1.8,
    errors: 32,
    lastRun: '2024-01-15T09:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: '個性化郵件發送',
    executions: 2847,
    successRate: 94.7,
    avgDuration: 0.8,
    errors: 151,
    lastRun: '2024-01-15T11:45:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: '競爭對手監控',
    executions: 234,
    successRate: 89.3,
    avgDuration: 5.2,
    errors: 25,
    lastRun: '2024-01-15T08:00:00Z',
    status: 'paused'
  }
]

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-TW', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTrendIcon(current: number, previous: number) {
  if (current > previous) {
    return <TrendingUp className="h-4 w-4 text-green-500" />
  } else if (current < previous) {
    return <TrendingDown className="h-4 w-4 text-red-500" />
  } else {
    return <Minus className="h-4 w-4 text-gray-500" />
  }
}

function getTrendColor(current: number, previous: number) {
  if (current > previous) {
    return 'text-green-600'
  } else if (current < previous) {
    return 'text-red-600'
  } else {
    return 'text-gray-600'
  }
}

function calculateChange(current: number, previous: number): string {
  if (previous === 0) return '0%'
  const change = ((current - previous) / previous) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
}

function getStatusColor(status: WorkflowMetrics['status']) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status: WorkflowMetrics['status']) {
  switch (status) {
    case 'active':
      return '運行中'
    case 'paused':
      return '已暫停'
    case 'error':
      return '異常'
    default:
      return '未知'
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [currentData, setCurrentData] = useState(mockAnalyticsData[0])
  const [previousData, setPreviousData] = useState(mockAnalyticsData[1])
  const { analytics, setAnalytics } = useAppStore()

  useEffect(() => {
    // 從 store 載入分析數據
    if (!analytics.totalLeads) {
      setAnalytics({
        totalLeads: currentData.totalLeads,
        qualifiedLeads: currentData.qualifiedLeads,
        conversionRate: currentData.conversionRate,
        revenue: currentData.revenue,
        emailMetrics: {
          sent: currentData.emailsSent,
          opened: currentData.emailsOpened,
          clicked: currentData.emailsClicked,
          replied: currentData.emailsReplied
        },
        socialMetrics: mockSocialMetrics,
        workflowMetrics: mockWorkflowMetrics
      })
    }
  }, [analytics, setAnalytics, currentData])

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // 這裡可以根據時間範圍載入不同的數據
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">數據分析</h1>
          <p className="text-muted-foreground">
            業務表現洞察和趨勢分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">今天</SelectItem>
              <SelectItem value="7d">過去 7 天</SelectItem>
              <SelectItem value="30d">過去 30 天</SelectItem>
              <SelectItem value="90d">過去 90 天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            導出報告
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">總覽</TabsTrigger>
          <TabsTrigger value="leads">潛在客戶</TabsTrigger>
          <TabsTrigger value="email">郵件營銷</TabsTrigger>
          <TabsTrigger value="social">社交媒體</TabsTrigger>
          <TabsTrigger value="workflows">工作流程</TabsTrigger>
        </TabsList>

        {/* 總覽標籤 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 關鍵指標 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總潛在客戶</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.totalLeads)}</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(currentData.totalLeads, previousData.totalLeads)}
                  <span className={`ml-1 ${getTrendColor(currentData.totalLeads, previousData.totalLeads)}`}>
                    {calculateChange(currentData.totalLeads, previousData.totalLeads)}
                  </span>
                  <span className="text-muted-foreground ml-1">vs 上週</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">轉換率</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.conversionRate}%</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(currentData.conversionRate, previousData.conversionRate)}
                  <span className={`ml-1 ${getTrendColor(currentData.conversionRate, previousData.conversionRate)}`}>
                    {calculateChange(currentData.conversionRate, previousData.conversionRate)}
                  </span>
                  <span className="text-muted-foreground ml-1">vs 上週</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總收入</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentData.revenue)}</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(currentData.revenue, previousData.revenue)}
                  <span className={`ml-1 ${getTrendColor(currentData.revenue, previousData.revenue)}`}>
                    {calculateChange(currentData.revenue, previousData.revenue)}
                  </span>
                  <span className="text-muted-foreground ml-1">vs 上週</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">投資回報率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.roi}%</div>
                <div className="flex items-center text-xs">
                  {getTrendIcon(currentData.roi, previousData.roi)}
                  <span className={`ml-1 ${getTrendColor(currentData.roi, previousData.roi)}`}>
                    {calculateChange(currentData.roi, previousData.roi)}
                  </span>
                  <span className="text-muted-foreground ml-1">vs 上週</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 詳細統計 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>郵件營銷表現</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">已發送</span>
                  <span className="font-medium">{formatNumber(currentData.emailsSent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">開信率</span>
                  <span className="font-medium">
                    {((currentData.emailsOpened / currentData.emailsSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">點擊率</span>
                  <span className="font-medium">
                    {((currentData.emailsClicked / currentData.emailsSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">回覆率</span>
                  <span className="font-medium">
                    {((currentData.emailsReplied / currentData.emailsSent) * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>成本效益分析</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">總收入</span>
                  <span className="font-medium text-green-600">{formatCurrency(currentData.revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">總成本</span>
                  <span className="font-medium text-red-600">{formatCurrency(currentData.cost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">淨利潤</span>
                  <span className="font-medium">{formatCurrency(currentData.revenue - currentData.cost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">平均回應時間</span>
                  <span className="font-medium">{currentData.avgResponseTime} 小時</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 潛在客戶標籤 */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">總潛在客戶</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.totalLeads)}</div>
                <p className="text-xs text-muted-foreground">
                  本週新增 {currentData.totalLeads - previousData.totalLeads} 個
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">合格潛在客戶</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.qualifiedLeads)}</div>
                <p className="text-xs text-muted-foreground">
                  合格率 {((currentData.qualifiedLeads / currentData.totalLeads) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">轉換率</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  目標：10%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 郵件營銷標籤 */}
        <TabsContent value="email" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">已發送</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.emailsSent)}</div>
                <p className="text-xs text-muted-foreground">
                  本週發送量
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">開信率</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((currentData.emailsOpened / currentData.emailsSent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(currentData.emailsOpened)} 次開信
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">點擊率</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((currentData.emailsClicked / currentData.emailsSent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(currentData.emailsClicked)} 次點擊
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">回覆率</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((currentData.emailsReplied / currentData.emailsSent) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(currentData.emailsReplied)} 次回覆
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 社交媒體標籤 */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid gap-6">
            {mockSocialMetrics.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {platform.platform === 'Instagram' && <Activity className="h-5 w-5" />}
                      {platform.platform === 'LinkedIn' && <Users className="h-5 w-5" />}
                      {platform.platform === 'Facebook' && <MessageSquare className="h-5 w-5" />}
                    </div>
                    {platform.platform}
                    <Badge variant="outline" className="ml-auto">
                      成長率 +{platform.growthRate}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">追蹤者</p>
                      <p className="text-2xl font-bold">{formatNumber(platform.followers)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">互動率</p>
                      <p className="text-2xl font-bold">{platform.engagement}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">觸及人數</p>
                      <p className="text-2xl font-bold">{formatNumber(platform.reach)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">曝光次數</p>
                      <p className="text-2xl font-bold">{formatNumber(platform.impressions)}</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-5 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">讚</p>
                        <p className="font-medium">{formatNumber(platform.likes)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">留言</p>
                        <p className="font-medium">{formatNumber(platform.comments)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Share className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">分享</p>
                        <p className="font-medium">{formatNumber(platform.shares)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">點擊</p>
                        <p className="font-medium">{formatNumber(platform.clicks)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">貼文</p>
                        <p className="font-medium">{platform.posts}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 工作流程標籤 */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-4">
            {mockWorkflowMetrics.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {getStatusText(workflow.status)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        查看詳情
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">執行次數</p>
                      <p className="text-2xl font-bold">{formatNumber(workflow.executions)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">成功率</p>
                      <p className="text-2xl font-bold">{workflow.successRate}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">平均耗時</p>
                      <p className="text-2xl font-bold">{workflow.avgDuration}s</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">錯誤次數</p>
                      <p className="text-2xl font-bold text-red-600">{workflow.errors}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">最後執行</p>
                      <p className="text-sm font-medium">{formatDate(workflow.lastRun)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}