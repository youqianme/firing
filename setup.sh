#!/bin/bash

# 有钱么 (YouQianMe) 项目设置脚本

set -e

echo "=== 开始设置有钱么项目 ==="

# 检查 Node.js 和 npm 版本
echo "=== 检查 Node.js 和 npm 版本 ==="
node -v
npm -v

# 更新 npm
echo "=== 更新 npm ==="
npm install -g npm@latest

# 安装项目依赖
echo "=== 安装项目依赖 ==="
npm install

# 安装额外的必要依赖
echo "=== 安装额外的必要依赖 ==="
npm install better-sqlite3 sqlite3
npm install recharts
npm install date-fns
npm install @types/better-sqlite3

# 验证安装结果
echo "=== 验证安装结果 ==="
npm list better-sqlite3
npm list recharts
npm list date-fns

# 创建必要的目录结构
echo "=== 创建必要的目录结构 ==="
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/data

# 创建数据库目录
mkdir -p data

echo "=== 设置完成！==="
echo "项目已准备就绪，您可以运行 'npm run dev' 启动开发服务器。"
