#!/bin/bash

# 构建脚本 - 构建有钱么财务应用Docker镜像

echo "正在构建有钱么财务应用Docker镜像..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 构建所有服务
docker-compose build

echo "镜像构建成功!"
