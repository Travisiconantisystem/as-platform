"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Zap,
  Bot,
  FileText,
  Settings,
  Upload,
  Download,
  BarChart3
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  variant?: 'default' | 'outline' | 'secondary'
  disabled?: boolean
}

interface QuickActionsProps {
  actions?: QuickAction[]
  className?: string
}

const defaultActions: QuickAction[] = [
  {
    id: '1',
    title: '新建工作流程',
    description: '創建自動化工作流程',
    icon: Plus,
    action: () => console.log('新建工作流程'),
    variant: 'default'
  },
  {
    id: '2',
    title: '創建 AI 智能體',
    description: '設置新的 AI 助手',
    icon: Bot,
    action: () => console.log('創建 AI 智能體'),
    variant: 'outline'
  },
  {
    id: '3',
    title: '快速分析',
    description: '生成數據報告',
    icon: BarChart3,
    action: () => console.log('快速分析'),
    variant: 'outline'
  },
  {
    id: '4',
    title: '導入數據',
    description: '上傳客戶資料',
    icon: Upload,
    action: () => console.log('導入數據'),
    variant: 'outline'
  },
  {
    id: '5',
    title: '導出報告',
    description: '下載分析結果',
    icon: Download,
    action: () => console.log('導出報告'),
    variant: 'outline'
  },
  {
    id: '6',
    title: '系統設置',
    description: '配置平台參數',
    icon: Settings,
    action: () => console.log('系統設置'),
    variant: 'secondary'
  }
]

export function QuickActions({ actions = defaultActions, className }: QuickActionsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>快速操作</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            
            return (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
                onClick={action.action}
                disabled={action.disabled}
              >
                <div className="flex items-center space-x-2 w-full">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <p className="text-xs text-muted-foreground text-left w-full">
                  {action.description}
                </p>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}