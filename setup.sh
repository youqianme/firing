#!/bin/bash

# 有钱么 (YouQianMe) 项目设置脚本

set -e

echo "=== 开始设置有钱么项目 ==="

# 函数：检查命令是否存在
check_command() {
    if command -v "$1" > /dev/null 2>&1; then
        return 0
    elif type "$1" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 函数：获取 Node.js 主版本号
get_node_major_version() {
    node -v | cut -d'v' -f2 | cut -d'.' -f1
}

# 函数：安装 Node.js
install_node() {
    echo "正在尝试安装或更新 Node.js..."
    
    OS="$(uname -s)"
    case "${OS}" in
        Linux*)     machine=Linux;;
        Darwin*)    machine=Mac;;
        CYGWIN*)    machine=Cygwin;;
        MINGW*)     machine=MinGw;;
        *)          machine="UNKNOWN:${OS}"
    esac

    if [ "$machine" = "Mac" ]; then
        if check_command brew; then
            echo "检测到 Homebrew，正在使用 brew 安装/升级 Node.js..."
            brew upgrade node || brew install node
        else
            echo "错误：未检测到 Homebrew。请手动安装 Node.js (https://nodejs.org/) 或先安装 Homebrew (https://brew.sh/)."
            exit 1
        fi
    elif [ "$machine" = "Linux" ]; then
        echo "检测到 Linux 系统，准备安装/更新 Node.js (目标版本: 最新 LTS)..."
        
        # 检查是否已有 curl，如果没有则安装
        if ! check_command curl; then
            echo "正在安装 curl..."
            if check_command apt-get; then
                if [ "$(id -u)" -ne 0 ]; then sudo apt-get update && sudo apt-get install -y curl; else apt-get update && apt-get install -y curl; fi
            elif check_command yum; then
                if [ "$(id -u)" -ne 0 ]; then sudo yum install -y curl; else yum install -y curl; fi
            fi
        fi

        if check_command apt-get; then
            echo "使用 apt-get 安装..."
            
            # 清理可能冲突的旧包
            echo "正在清理可能冲突的旧版本包 (libnode-dev, nodejs)..."
            if [ "$(id -u)" -ne 0 ]; then
                sudo apt-get remove -y libnode-dev libnode72 nodejs npm || true
                sudo apt-get autoremove -y || true
            else
                apt-get remove -y libnode-dev libnode72 nodejs npm || true
                apt-get autoremove -y || true
            fi

            if [ "$(id -u)" -ne 0 ]; then
                curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                sudo apt-get install -y nodejs
            else
                curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
                apt-get install -y nodejs
            fi
        elif check_command yum; then
            echo "使用 yum 安装..."
            if [ "$(id -u)" -ne 0 ]; then
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
                sudo yum install -y nodejs
            else
                curl -fsSL https://rpm.nodesource.com/setup_lts.x | bash -
                yum install -y nodejs
            fi
        else
             echo "错误：未检测到支持的包管理器。请手动安装 Node.js LTS (https://nodejs.org/)."
             exit 1
        fi
    else
        echo "错误：不支持的操作系统或无法自动安装。请手动安装 Node.js (https://nodejs.org/)."
        exit 1
    fi
}

# 检查 Node.js 是否已安装且版本符合要求
if ! check_command node; then
    install_node
else
    current_ver=$(get_node_major_version)
    if [ "$current_ver" -lt 18 ]; then
        echo "检测到当前 Node.js 版本 (v$current_ver) 过低，需要 v18+。"
        install_node
    else
        echo "检测到 Node.js (v$current_ver) 已安装且版本符合要求。"
    fi
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
