import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '連接平台',
  description: '連接新的第三方平台',
}

export default function ConnectPlatformPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">連接平台</h1>
          <p className="text-muted-foreground">
            連接和配置新的第三方平台
          </p>
        </div>
        
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">可用平台</h2>
          <p className="text-muted-foreground">
            此頁面正在開發中，敬請期待。
          </p>
        </div>
      </div>
    </div>
  )
}