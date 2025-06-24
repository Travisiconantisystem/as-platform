import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '對話記錄',
  description: '查看和管理對話記錄',
}

export default function ConversationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">對話記錄</h1>
          <p className="text-muted-foreground">
            查看和管理您的對話記錄
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">對話管理</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}