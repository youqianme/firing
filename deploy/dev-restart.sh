#!/bin/bash

# 开发环境启动脚本 - 强制重启有钱么财务应用开发环境容器

echo "正在强制重启有钱么财务应用开发环境容器..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
  echo "错误: Docker 未安装，请先安装 Docker"
  exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
  echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
  exit 1
fi

# 确定使用的Docker Compose命令
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  echo "错误: 无法找到可用的Docker Compose命令"
  exit 1
fi

# 停止并移除开发环境容器
echo "正在停止旧的开发环境容器..."
$DOCKER_COMPOSE_CMD stop app-dev
$DOCKER_COMPOSE_CMD rm -f app-dev

# 启动开发环境容器
echo "正在启动新的开发环境容器..."
$DOCKER_COMPOSE_CMD up -d --build app-dev

if [ $? -eq 0 ]; then
  echo "开发环境容器启动成功!"
  echo "开发环境: http://localhost:3000"
else
  echo "开发环境容器启动失败!"
  exit 1
fi
