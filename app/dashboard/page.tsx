'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
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
  CheckCircle
} from 'lucide-react'

// 模擬數據
const statsData = [
  {
    title: '活躍工作流程',
    value: 24,
    description: '本月新增 3 個',
    icon: Activity,
    trend: {
      value: 12.5,
      label: '較上月',
      type: 'increase' as const
    }
  },
  {
    title: 'AI 智能體',
    value: 8,
    description: '7 個運行中',
    icon: Bot,
    trend: {
      value: 8.2,
      label: '較上月',
      type: 'increase' as const
    }
  },
  {
    title: '總處理量',
    value: 15420,
    description: '今日已處理',
    icon: TrendingUp,
    trend: {
      value: 23.1,
      label: '較昨日',
      type: 'increase' as const
    }
  },
  {
    title: '連接用戶',
    value: 1247,
    description: '活躍用戶數',
    icon: Users,
    trend: {
      value: 2.4,
      label: '較上月',
      type: 'decrease' as const
    }
  }
]

const quickActionsData = [
  {
    id: '1',
    title: '創建工作流程',
    description: '設計新的自動化流程',
    icon: Zap,
    variant: 'default' as const,
    action: () => console.log('創建工作流程')
  },
  {
    id: '2',
    title: '新增 AI 智能體',
    description: '配置智能助理',
    icon: Bot,
    variant: 'secondary' as const,
    action: () => console.log('新增 AI 智能體')
  },
  {
    id: '3',
    title: '排程任務',
    description: '設定定時執行',
    icon: Clock,
    variant: 'outline' as const,
    action: () => console.log('排程任務')
  },
  {
    id: '4',
    title: '系統檢查',
    description: '運行健康檢測',
    icon: CheckCircle,
    variant: 'outline' as const,
    action: () => console.log('系統檢查')
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard')
    }
  }, [status, router])

  // 如果正在檢查認證狀態，顯示載入中
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium">載入中...</p>
        </div>
      </div>
    )
  }

  // 如果未認證，不渲染內容（會被重定向）
  if (status === 'unauthenticated') {
    return null
  }

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