import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    // 确保 monorepo 中的依赖能被正确追踪
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

export default nextConfig;
