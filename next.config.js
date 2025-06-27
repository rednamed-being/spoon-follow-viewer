/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hot Reload設定を最適化
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // 高速リフレッシュを有効化
  reactStrictMode: true,
  // 開発時のキャッシュを最適化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
