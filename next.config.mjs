/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint設定はnext.config.mjsから削除（Next.js 16では非推奨）
  // ESLintの設定は.eslintrc.jsonまたはnext lintコマンドで行います
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // 画像最適化を有効化（WebP形式への自動変換、レスポンシブ画像対応）
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    // リモート画像のドメインを許可
    remotePatterns: [
      // Instagram
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
      // YouTube
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      // Twitter/X
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
      },
      // その他の一般的な画像ホスティングサービス
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
    // 画像サイズの設定（デバイスサイズに応じた最適化）
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小キャッシュTTL（秒）
    minimumCacheTTL: 60,
  },
  // Turbopackの設定（空のオブジェクトでエラーを回避）
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Mapbox GL JSのworkerファイルを適切に処理
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
      
      // Mapbox GL JSのworkerファイルを適切に処理
      config.module.rules.push({
        test: /mapbox-gl-csp-worker\.js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/chunks/[name].[hash][ext]',
        },
      })
    }

    return config
  },
}

export default nextConfig
