#!/bin/bash

# 停止脚本 - 停止有钱么财务应用容器

echo "正在停止有钱么财务应用容器..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 停止所有服务
docker-compose down

echo "容器停止成功!"
