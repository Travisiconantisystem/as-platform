"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Home,
  Settings,
  Users,
  Workflow,
  Bot,
  BarChart3,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  MessageSquare,
  Activity,
  FileText,
  Search,
  Plus
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: '儀表板',
    href: '/',
    icon: Home,
    current: false,
    badge: null
  },
  {
    name: '工作流程',
    href: '/workflows',
    icon: Workflow,
    current: false,
    badge: '3'
  },
  {
    name: 'AI 智能體',
    href: '/agents',
    icon: Bot,
    current: false,
    badge: null
  },
  {
    name: '平台連接',
    href: '/platforms',
    icon: Globe,
    current: false,
    badge: '5'
  },
  {
    name: '數據分析',
    href: '/analytics',
    icon: BarChart3,
    current: false,
    badge: null
  },
  {
    name: '對話記錄',
    href: '/conversations',
    icon: MessageSquare,
    current: false,
    badge: null
  },
  {
    name: '活動監控',
    href: '/monitoring',
    icon: Activity,
    current: false,
    badge: null
  },
  {
    name: '用戶管理',
    href: '/users',
    icon: Users,
    current: false,
    badge: null
  },
  {
    name: '通知中心',
    href: '/notifications',
    icon: Bell,
    current: false,
    badge: '12'
  },
  {
    name: '文檔中心',
    href: '/docs',
    icon: FileText,
    current: false,
    badge: null
  },
  {
    name: '系統設置',
    href: '/settings',
    icon: Settings,
    current: false,
    badge: null
  },
  {
    name: '幫助支援',
    href: '/help',
    icon: HelpCircle,
    current: false,
    badge: null
  }
]

const quickActions = [
  {
    name: '新建工作流程',
    href: '/workflows/new',
    icon: Plus,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: '創建 AI 智能體',
    href: '/agents/new',
    icon: Bot,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: '連接平台',
    href: '/platforms/connect',
    icon: Zap,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: '查看分析',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-orange-500 hover:bg-orange-600'
  }
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AS Platform</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索功能..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 h-5 w-5",
                  collapsed ? "mr-0" : "mr-3",
                  isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            快速操作
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                  action.color
                )}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            <p>AS Platform v1.0</p>
            <p>© 2024 ArmStrong</p>
          </div>
        )}
      </div>
    </div>
  )
}