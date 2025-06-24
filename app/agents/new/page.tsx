import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '創建新智能體',
  description: '創建和配置新的AI智能體',
}

export default function NewAgentPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">創建新智能體</h1>
          <p className="text-muted-foreground">
            配置和創建新的AI智能體
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">智能體配置</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}