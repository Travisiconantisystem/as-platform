'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Zap, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: string
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span className="text-green-600">{trend}</span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total AI Agents"
        value="12"
        description="Active agents"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        trend="+2 from last month"
      />
      <StatCard
        title="Workflows"
        value="8"
        description="Running workflows"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        trend="+1 from last week"
      />
      <StatCard
        title="Automations"
        value="24"
        description="Active automations"
        icon={<Zap className="h-4 w-4 text-muted-foreground" />}
        trend="+4 from last month"
      />
      <StatCard
        title="Performance"
        value="98.5%"
        description="System uptime"
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        trend="+0.2% from last week"
      />
    </div>
  )
}