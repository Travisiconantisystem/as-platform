import { Metadata } from 'next'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { PlatformOverview } from '@/components/dashboard/platform-overview'
import { WorkflowStatus } from '@/components/dashboard/workflow-status'
import { AIAgentStatus } from '@/components/dashboard/ai-agent-status'
import { SystemHealth } from '@/components/dashboard/system-health'
import { WelcomeModal } from '@/components/modals/welcome-modal'

import { ErrorBoundary } from '@/components/ui/error-boundary'
import { DashboardError } from '@/components/ui/dashboard-error'

export const metadata: Metadata = {
  title: '儀表板',
  description: 'AS Platform 主控台 - 管理您的自動化工作流程、AI智能體和第三方平台整合',
}

// 載入組件
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 標題骨架 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
      
      {/* 統計卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      
      {/* 內容區域骨架 */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-xl bg-muted" />
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}



// 主儀表板內容
async function DashboardContent() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 頁面標題和操作 */}
      <DashboardHeader />
      
      {/* 統計概覽 */}
      <Suspense fallback={
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      }>
        <DashboardStats />
      </Suspense>
      
      {/* 主要內容區域 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左側主要內容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 最近活動 */}
          <Suspense fallback={
            <div className="h-96 animate-pulse rounded-xl bg-muted" />
          }>
            <ErrorBoundary fallback={DashboardError}>
              <RecentActivity />
            </ErrorBoundary>
          </Suspense>
          
          {/* 工作流程狀態 */}
          <Suspense fallback={
            <div className="h-64 animate-pulse rounded-xl bg-muted" />
          }>
            <ErrorBoundary fallback={DashboardError}>
              <WorkflowStatus />
            </ErrorBoundary>
          </Suspense>
        </div>
        
        {/* 右側邊欄 */}
        <div className="space-y-6">
          {/* 快速操作 */}
          <Suspense fallback={
            <div className="h-80 animate-pulse rounded-xl bg-muted" />
          }>
            <QuickActions />
          </Suspense>
          
          {/* 平台概覽 */}
          <Suspense fallback={
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          }>
            <ErrorBoundary fallback={DashboardError}>
              <PlatformOverview />
            </ErrorBoundary>
          </Suspense>
          
          {/* AI智能體狀態 */}
          <Suspense fallback={
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          }>
            <ErrorBoundary fallback={DashboardError}>
              <AIAgentStatus />
            </ErrorBoundary>
          </Suspense>
          
          {/* 系統健康狀態 */}
          <Suspense fallback={
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          }>
            <ErrorBoundary fallback={DashboardError}>
              <SystemHealth />
            </ErrorBoundary>
          </Suspense>
        </div>
      </div>
      
      {/* 歡迎模態框（僅首次訪問顯示） */}
      <WelcomeModal />
    </div>
  )
}

// 主頁面組件
export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-6">
          <DashboardSkeleton />
        </div>
      }>
        <ErrorBoundary fallback={DashboardError}>
          <DashboardContent />
        </ErrorBoundary>
      </Suspense>
    </main>
  )
}

// 頁面配置
export const dynamic = 'force-dynamic'
export const revalidate = 0
