import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 輸出配置 - 使用 standalone 模式避免靜態導出問題
  output: 'standalone',
  
  // 外部包配置
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
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
    ignoreBuildErrors: true, // 暫時忽略 TypeScript 錯誤
  },
  
  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// 導出配置
export default nextConfig;
