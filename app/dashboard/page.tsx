'use client'

import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { WorkflowStatus } from '@/components/dashboard/workflow-status'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PlatformOverview } from '@/components/dashboard/platform-overview'
import { AIAgentsStatus } from '@/components/dashboard/ai-agents-status'
import { SystemHealth } from '@/components/dashboard/system-health'
import { 
  Activity, 
  Bot, 
  TrendingUp, 
  Users, 
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// 模擬數據
const statsData = [
  {
    title: '活躍工作流程',
    value: 24,
    description: '本月新增 3 個',
    icon: Activity,
    trend: 'up' as const,
    trendValue: 12.5
  },
  {
    title: 'AI 智能體',
    value: 8,
    description: '7 個運行中',
    icon: Bot,
    trend: 'up' as const,
    trendValue: 8.2
  },
  {
    title: '總處理量',
    value: 15420,
    description: '今日已處理',
    icon: TrendingUp,
    trend: 'up' as const,
    trendValue: 23.1
  },
  {
    title: '連接用戶',
    value: 1247,
    description: '活躍用戶數',
    icon: Users,
    trend: 'down' as const,
    trendValue: -2.4
  }
]

const quickActionsData = [
  {
    title: '創建工作流程',
    description: '設計新的自動化流程',
    icon: Zap,
    variant: 'default' as const,
    onClick: () => console.log('創建工作流程')
  },
  {
    title: '新增 AI 智能體',
    description: '配置智能助理',
    icon: Bot,
    variant: 'secondary' as const,
    onClick: () => console.log('新增 AI 智能體')
  },
  {
    title: '排程任務',
    description: '設定定時執行',
    icon: Clock,
    variant: 'outline' as const,
    onClick: () => console.log('排程任務')
  },
  {
    title: '系統檢查',
    description: '運行健康檢測',
    icon: CheckCircle,
    variant: 'ghost' as const,
    onClick: () => console.log('系統檢查')
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
          <p className="text-muted-foreground">
            歡迎回來！這是您的 AI Automation 控制中心。
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>系統正常</span>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* 快速操作 */}
      <QuickActions actions={quickActionsData} />

      {/* 主要內容區域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 左側列 */}
        <div className="space-y-6">
          {/* 工作流程狀態 */}
          <WorkflowStatus />
          
          {/* 平台概覽 */}
          <PlatformOverview />
        </div>

        {/* 右側列 */}
        <div className="space-y-6">
          {/* AI 智能體狀態 */}
          <AIAgentsStatus />
          
          {/* 最近活動 */}
          <RecentActivity />
        </div>
      </div>

      {/* 系統健康狀態 */}
      <SystemHealth />
    </div>
  )
}