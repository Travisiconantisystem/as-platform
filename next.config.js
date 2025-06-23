/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'jsdelivr-cdn',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
        },
      },
    },
    {
      urlPattern: /\/_next\/image\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})

const nextConfig = {
  // 實驗性功能
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 圖片優化配置
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'github.com',
      'githubusercontent.com',
      'gravatar.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 編譯配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 輸出配置
  output: 'standalone',

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/signup',
        permanent: true,
      },
    ]
  },

  // 重寫配置
  async rewrites() {
    return [
      {
        source: '/api/n8n/:path*',
        destination: `${process.env.N8N_BASE_URL || 'http://localhost:5678'}/api/:path*`,
      },
    ]
  },

  // 標頭配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' ? '*' : 'https://yourdomain.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // 環境變數配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 添加自定義webpack配置
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // 優化bundle大小
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    // 添加bundle分析器（開發環境）
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      )
    }

    return config
  },

  // TypeScript配置
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint配置
  eslint: {
    ignoreDuringBuilds: false,
  },

  // 靜態優化配置
  trailingSlash: false,
  poweredByHeader: false,

  // 國際化配置（如需要）
  // i18n: {
  //   locales: ['zh-TW', 'zh-CN', 'en'],
  //   defaultLocale: 'zh-TW',
  // },

  // 自定義服務器配置
  serverRuntimeConfig: {
    // 只在服務器端可用
    mySecret: 'secret',
  },
  publicRuntimeConfig: {
    // 在服務器端和客戶端都可用
    staticFolder: '/static',
  },

  // 性能配置
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // 自定義構建ID
  generateBuildId: async () => {
    // 可以返回任何字符串，但必須是唯一的
    return `${new Date().getTime()}`
  },

  // 自定義頁面擴展名
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // 自定義Sass選項
  sassOptions: {
    includePaths: ['./styles'],
  },

  // 自定義Less選項
  // lessLoaderOptions: {
  //   lessOptions: {
  //     modifyVars: {
  //       '@primary-color': '#1DA57A',
  //     },
  //   },
  // },

  // 自定義PostCSS配置
  // postcss: {
  //   plugins: {
  //     tailwindcss: {},
  //     autoprefixer: {},
  //   },
  // },

  // 自定義Babel配置
  // babel: {
  //   presets: ['next/babel'],
  //   plugins: [],
  // },

  // 自定義導出配置
  // exportPathMap: async function (
  //   defaultPathMap,
  //   { dev, dir, outDir, distDir, buildId }
  // ) {
  //   return {
  //     '/': { page: '/' },
  //     '/about': { page: '/about' },
  //   }
  // },

  // 自定義Asset前綴
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.mydomain.com' : '',

  // 自定義基礎路徑
  // basePath: '/docs',

  // 自定義目標
  // target: 'server',

  // 自定義distDir
  // distDir: 'build',

  // 自定義cleanDistDir
  cleanDistDir: true,

  // 自定義useFileSystemPublicRoutes
  useFileSystemPublicRoutes: true,

  // 自定義generateEtags
  generateEtags: true,

  // 自定義compress
  compress: true,

  // 自定義httpAgentOptions
  httpAgentOptions: {
    keepAlive: true,
  },
}

module.exports = withPWA(nextConfig)