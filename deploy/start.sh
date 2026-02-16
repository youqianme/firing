#!/bin/bash

# 启动脚本 - 启动有钱么财务应用容器

echo "正在启动有钱么财务应用容器..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 启动所有服务
docker-compose up -d

echo "容器启动成功!"
echo "开发环境: http://localhost:3000"
echo "生产环境: http://localhost:3001"
