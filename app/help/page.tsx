import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '幫助中心',
  description: '獲取幫助和支援',
}

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">幫助中心</h1>
          <p className="text-muted-foreground">
            獲取幫助和技術支援
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">常見問題</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}