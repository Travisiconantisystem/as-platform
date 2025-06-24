import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '第三方平台',
  description: '管理第三方平台整合',
}

export default function PlatformsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">第三方平台</h1>
          <p className="text-muted-foreground">
            管理您的第三方平台整合
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">平台整合</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}