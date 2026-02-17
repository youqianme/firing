#!/bin/bash

# 启动脚本 - 启动有钱么财务应用容器

echo "正在启动有钱么财务应用容器..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
  echo "错误: Docker 未安装，请先安装 Docker"
  
  # 检测操作系统类型
  if [[ "$(uname)" == "Darwin" ]]; then
    # macOS
    echo "安装指南: https://docs.docker.com/desktop/install/mac-install/"
  elif [[ "$(uname)" == "Linux" ]]; then
    # Linux
    echo "安装指南: https://docs.docker.com/engine/install/"
  else
    # 其他系统
    echo "安装指南: https://docs.docker.com/get-docker/"
  fi
  exit 1
fi

# 检查并设置Docker相关工具的PATH
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS
  DOCKER_BIN_DIR="/Applications/Docker.app/Contents/Resources/bin"
  if [ -d "$DOCKER_BIN_DIR" ]; then
    export PATH="$DOCKER_BIN_DIR:$PATH"
  fi
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
  echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
  echo "安装指南: https://docs.docker.com/compose/install/"
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

# 启动所有服务
$DOCKER_COMPOSE_CMD up -d app-prod

if [ $? -eq 0 ]; then
  echo "容器启动成功!"
  echo "生产环境: http://localhost:3001"
else
  echo "容器启动失败!"
  exit 1
fi
