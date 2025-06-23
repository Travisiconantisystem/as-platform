import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            頁面未找到
          </h2>
          <p className="text-gray-600 mb-6">
            抱歉，您訪問的頁面不存在或已被移動。
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回儀表板
          </Link>
          
          <Link 
            href="/"
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}