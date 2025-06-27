/** @type {import('next').NextConfig} */
const nextConfig = {
  // 高速リフレッシュを有効化
  reactStrictMode: true,

  // SWCコンパイラーを明示的に有効化（高速化）
  swcMinify: true,

  // 実験的機能でコンパイル高速化
  experimental: {
    // esmExternals: true,
    // serverComponentsExternalPackages: [],
  },

  // TypeScript設定
  typescript: {
    // 型チェックを高速化（開発時のみ）
    ignoreBuildErrors: false,
  },

  // Hot Reload設定を最適化
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // 開発時のキャッシュを有効化
      config.cache = {
        type: "filesystem",
      };
    }

    // パフォーマンス最適化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    };

    return config;
  },
};

module.exports = nextConfig;
