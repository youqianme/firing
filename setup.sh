#!/bin/bash

# 有钱么 (YouQianMe) 项目设置脚本

set -e

echo "=== 开始设置有钱么项目 ==="

# 函数：检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        return 1
    else
        return 0
    fi
}

# 函数：安装 Node.js
install_node() {
    echo "未检测到 Node.js，正在尝试安装..."
    
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)     machine=Linux;;
        Darwin*)    machine=Mac;;
        CYGWIN*)    machine=Cygwin;;
        MINGW*)     machine=MinGw;;
        *)          machine="UNKNOWN:${OS}"
    esac

    if [ "$machine" == "Mac" ]; then
        if check_command brew; then
            echo "检测到 Homebrew，正在使用 brew 安装 Node.js..."
            brew install node
        else
            echo "错误：未检测到 Homebrew。请手动安装 Node.js (https://nodejs.org/) 或先安装 Homebrew (https://brew.sh/)."
            exit 1
        fi
    elif [ "$machine" == "Linux" ]; then
        if check_command apt-get; then
            echo "检测到 apt-get，正在安装 Node.js..."
            # 尝试安装 nodejs 和 npm
            if [ "$EUID" -ne 0 ]; then
                echo "请输入密码以使用 sudo 安装 Node.js"
                sudo apt-get update
                sudo apt-get install -y nodejs npm
            else
                apt-get update
                apt-get install -y nodejs npm
            fi
        elif check_command yum; then
            echo "检测到 yum，正在安装 Node.js..."
            if [ "$EUID" -ne 0 ]; then
                echo "请输入密码以使用 sudo 安装 Node.js"
                sudo yum install -y nodejs npm
            else
                yum install -y nodejs npm
            fi
        else
             echo "错误：未检测到支持的包管理器。请手动安装 Node.js (https://nodejs.org/)."
             exit 1
        fi
    else
        echo "错误：不支持的操作系统或无法自动安装。请手动安装 Node.js (https://nodejs.org/)."
        exit 1
    fi
}

# 检查 Node.js 是否已安装
if ! check_command node; then
    install_node
else
    echo "检测到 Node.js 已安装。"
fi

# 再次检查 Node.js 和 npm 版本
echo "=== 检查 Node.js 和 npm 版本 ==="
if check_command node && check_command npm; then
    node -v
    npm -v
else
    echo "错误：Node.js 或 npm 安装失败或未找到。请检查您的环境。"
    exit 1
fi

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
