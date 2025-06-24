import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '通知中心',
  description: '管理系統通知',
}

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">通知中心</h1>
          <p className="text-muted-foreground">
            管理和查看系統通知
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">通知列表</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}