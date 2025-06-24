'use client'

interface DashboardErrorProps {
  error?: Error | undefined
  resetError: () => void
}

export function DashboardError({ error, resetError }: DashboardErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">載入儀表板時發生錯誤</h3>
        <p className="text-sm text-muted-foreground">
          {error?.message || '請稍後再試或聯繫技術支援'}
        </p>
      </div>
      <button
        onClick={resetError}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        重新載入
      </button>
    </div>
  )
}