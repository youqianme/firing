#!/bin/bash

# 日志脚本 - 查看有钱么财务应用容器日志

echo "查看有钱么财务应用容器日志..."

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 显示日志选项
echo "请选择要查看的服务日志:"
echo "1. 开发环境 (app-dev)"
echo "2. 生产环境 (app-prod)"
echo "3. 所有服务"

read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo "正在查看开发环境日志..."
    docker-compose logs -f app-dev
    ;;
  2)
    echo "正在查看生产环境日志..."
    docker-compose logs -f app-prod
    ;;
  3)
    echo "正在查看所有服务日志..."
    docker-compose logs -f
    ;;
  *)
    echo "无效选项，请重新运行脚本"
    exit 1
    ;;
esac
