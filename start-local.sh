#!/bin/bash

# 本地开发环境启动脚本 - 启动 web 端

echo "正在准备启动有钱么 Web 端..."

# 1. 查找并关闭已占用端口的进程 (默认 3000)
PORT=3000
echo "正在检查端口 $PORT..."

# 获取占用端口的进程 PID
PID=$(lsof -ti:$PORT)

if [ -n "$PID" ]; then
  echo "发现端口 $PORT 被进程 $PID 占用，正在终止..."
  kill -9 $PID
  echo "进程 $PID 已终止"
else
  echo "端口 $PORT 未被占用"
fi

# 2. 启动服务
echo "正在启动 Web 服务..."
echo "注意：在远程服务器上运行时，请确保使用 '0.0.0.0' 作为主机地址，以便外部访问。"
# 设置 HOST 环境变量为 0.0.0.0，使 Next.js 监听所有网络接口
HOST=0.0.0.0 npm run dev:web
