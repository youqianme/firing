#!/bin/bash

# 有钱么 (YouQianMe) 项目设置脚本

set -e

echo "=== 开始设置有钱么项目 ==="

# 检查 Node.js 和 npm 版本
echo "=== 检查 Node.js 和 npm 版本 ==="
node -v
npm -v

# 更新 npm (可选，需要 sudo 权限)
echo "=== 更新 npm (可选) ==="
echo "注意：全局 npm 更新需要 sudo 权限，如需要请手动运行：sudo npm install -g npm@latest"
echo "跳过全局 npm 更新，继续安装项目依赖..."

# 安装项目依赖（使用 workspaces）
echo "=== 安装项目依赖 ==="
npm install

# 验证安装结果
echo "=== 验证安装结果 ==="
npm list @firing/types
npm list @firing/utils
npm list @firing/data-access

# 验证 Web 端依赖
if [ -d "apps/web" ]; then
  echo "=== 验证 Web 端依赖 ==="
  cd apps/web && npm list better-sqlite3 recharts date-fns && cd ..
fi

# 验证移动端依赖
if [ -d "apps/mobile" ]; then
  echo "=== 验证移动端依赖 ==="
  cd apps/mobile && npm list expo expo-sqlite react-native && cd ..
fi

echo "=== 设置完成！==="
echo "项目已准备就绪，您可以运行以下命令："
echo "- Web 端开发服务器: npm run dev:web"
echo "- 移动端开发服务器: npm run dev:mobile"
echo "- 构建 Web 端: npm run build:web"
echo "- 构建移动端: npm run build:mobile"
