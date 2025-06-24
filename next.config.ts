import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 移除 standalone 輸出模式以支持 Vercel 部署
  
  // 外部包配置
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  
  // 環境變量
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  
  // 圖片優化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 編譯優化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 性能優化
  poweredByHeader: false,
  compress: true,
  
  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 實驗性功能配置
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

// 導出配置
export default nextConfig;
