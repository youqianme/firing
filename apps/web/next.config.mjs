import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config) => {
    config.externals.push('better-sqlite3');
    return config;
  },
  // 开发环境禁用 standalone 模式，避免文件系统操作开销
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // 确保 monorepo 中的依赖能被正确追踪
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
