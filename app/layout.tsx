import type { Metadata } from "next";
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { MainLayout } from '@/components/layout/main-layout'
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
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
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
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="zh-TW" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 預載入關鍵資源 */}
        <link
          rel="preload"
          href="/fonts/sf-pro-display.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
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
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ModalProvider>
                {/* 主要內容 */}
                <div className="relative flex min-h-screen flex-col">
                  <div className="flex-1">
                    <MainLayout>
                      {children}
                    </MainLayout>
                  </div>
                </div>
                
                {/* 全局通知 */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '12px 16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    },
                    success: {
                      iconTheme: {
                        primary: 'hsl(var(--primary))',
                        secondary: 'hsl(var(--primary-foreground))',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: 'hsl(var(--destructive))',
                        secondary: 'hsl(var(--destructive-foreground))',
                      },
                    },
                    loading: {
                      iconTheme: {
                        primary: 'hsl(var(--muted-foreground))',
                        secondary: 'hsl(var(--muted))',
                      },
                    },
                  }}
                />
                
                {/* 無障礙功能 */}
                <div id="skip-to-content" className="sr-only">
                  <a
                    href="#main-content"
                    className="fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
                  >
                    跳到主要內容
                  </a>
                </div>
                
                {/* 離線提示 */}
                <div id="offline-indicator" className="hidden">
                  <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-yellow-500 p-4 text-center text-white shadow-lg md:left-auto md:right-4 md:w-80">
                    <p className="text-sm font-medium">您目前處於離線狀態</p>
                    <p className="text-xs opacity-90">部分功能可能無法使用</p>
                  </div>
                </div>
                
                {/* 更新提示 */}
                <div id="update-indicator" className="hidden">
                  <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-blue-500 p-4 text-center text-white shadow-lg md:left-auto md:right-4 md:w-80">
                    <p className="text-sm font-medium">有新版本可用</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 rounded bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                    >
                      立即更新
                    </button>
                  </div>
                </div>
              </ModalProvider>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
        
        {/* 服務工作者註冊 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // 檢查更新
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            document.getElementById('update-indicator').classList.remove('hidden');
                          }
                        });
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
                
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
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
