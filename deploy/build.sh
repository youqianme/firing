#!/bin/bash

# 构建脚本 - 构建有钱么财务应用Docker镜像

echo "正在构建有钱么财务应用Docker镜像..."

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

# 检查Dockerfile是否存在
if [ ! -f "Dockerfile" ]; then
  echo "错误: Dockerfile 不存在，请先创建 Dockerfile"
  exit 1
fi

# 构建所有服务
echo "正在拉取镜像并构建..."
echo "注意: 已配置中国友好的npm镜像源 (registry.npmmirror.com)"
echo "如果遇到网络超时问题，请检查网络连接或配置Docker镜像加速器"

$DOCKER_COMPOSE_CMD build

if [ $? -eq 0 ]; then
  echo "镜像构建成功!"
else
  echo "镜像构建失败!"
  echo "可能的原因:"
  echo "1. 网络连接问题 - 请检查网络连接"
  echo "2. Docker镜像加速器配置问题 - 请配置有效的镜像加速器"
  echo "3. Docker Hub服务暂时不可用 - 请稍后重试"
  echo "解决方案:"
  echo "- 检查网络连接"
  echo "- 配置Docker镜像加速器 (推荐以下中国镜像源):"
  echo "  • 阿里云: https://<your-id>.mirror.aliyuncs.com"
  echo "  • 网易云: https://hub-mirror.c.163.com"
  echo "  • 腾讯云: https://mirror.ccs.tencentyun.com"
  echo "  • 七牛云: https://reg-mirror.qiniu.com"
  echo "- 配置方法: Docker Desktop -> Settings -> Docker Engine"
  echo "- 稍后重试构建"
  exit 1
fi
