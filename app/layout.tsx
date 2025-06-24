import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ClientProviders } from '@/components/providers/client-providers'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'AS Platform - AI Automation 一站式平台',
    template: '%s | AS Platform',
  },
  description: '整合第三方平台、N8N工作流程和AI智能體的一站式自動化平台，提升您的工作效率',
  keywords: [
    'AI自動化',
    '工作流程',
    'N8N',
    '第三方平台整合',
    'AI智能體',
    '自動化平台',
    '效率工具',
    '企業自動化',
  ],
  authors: [{ name: 'AS Platform Team' }],
  creator: 'AS Platform',
  publisher: 'AS Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: '/',
    title: 'AS Platform - AI Automation 一站式平台',
    description: '整合第三方平台、N8N工作流程和AI智能體的一站式自動化平台',
    siteName: 'AS Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AS Platform - AI Automation 一站式平台',
    description: '整合第三方平台、N8N工作流程和AI智能體的一站式自動化平台',
    images: ['/og-image.png'],
    creator: '@asplatform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icons/icon-base.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-base.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/icon-base.svg',
        color: '#007AFF',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AS Platform',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
  category: 'technology',
  classification: 'Business Software',
  referrer: 'origin-when-cross-origin',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 預載入關鍵資源 */}

        
        {/* DNS預取 */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        
        {/* 預連接 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Microsoft應用程式配置 */}
        <meta name="msapplication-TileColor" content="#007AFF" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* 安全標頭 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* 性能提示 */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
        
        {/* 應用程式特定元標籤 */}
        <meta name="application-name" content="AS Platform" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AS Platform" />
        
        {/* 搜索引擎優化 */}
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} />
        
        {/* 結構化數據 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'AS Platform',
              description: '整合第三方平台、N8N工作流程和AI智能體的一站式自動化平台',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              author: {
                '@type': 'Organization',
                name: 'AS Platform Team',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
        
        {/* 服務工作者註冊 */}
        {/* Service Worker 已移除 - 避免註冊失敗錯誤 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service Worker 功能已暫時移除
              console.log('Service Worker registration skipped');
                
              // 離線/在線狀態檢測
              function updateOnlineStatus() {
                const indicator = document.getElementById('offline-indicator');
                if (navigator.onLine) {
                  indicator.classList.add('hidden');
                } else {
                  indicator.classList.remove('hidden');
                }
              }
              
              window.addEventListener('online', updateOnlineStatus);
              window.addEventListener('offline', updateOnlineStatus);
              updateOnlineStatus();
            `,
          }}
        />
      </body>
    </html>
  )
}
