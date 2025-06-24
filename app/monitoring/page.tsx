import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '系統監控',
  description: '監控系統狀態和性能',
}

export default function MonitoringPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系統監控</h1>
          <p className="text-muted-foreground">
            監控系統狀態和性能指標
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">監控儀表板</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}