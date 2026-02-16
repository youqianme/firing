# 有钱么 (YouQianMe) 财务应用

一个功能强大的个人财务管理应用，支持资产负债管理、交易记录、FIRE 目标规划等功能。

## 📁 项目结构

项目采用 Monorepo 结构，使用 npm workspaces 管理依赖：

```text
firing/
  ├── apps/                 (应用源码)
  │   ├── web/              (Web 端项目 - Next.js)
  │   └── mobile/           (移动端项目 - React Native/Expo)
  ├── packages/             (共享代码)
  │   ├── types/            (共享类型定义)
  │   ├── utils/            (共享工具函数)
  │   ├── data-access/      (共享数据访问层)
  │   └── ui/               (共享 UI 组件)
  ├── config/               (配置文件)
  │   ├── .env.example      (环境变量示例)
  │   └── .env.production   (生产环境配置)
  ├── deploy/               (部署脚本)
  ├── doc/                  (项目文档)
  ├── package.json          (根配置：Workspaces 与脚本)
  ├── docker-compose.yml    (Docker 配置)
  └── Dockerfile            (Docker 构建文件)
```

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm 9+
- Docker (可选，用于容器化部署)

### 2. 安装依赖

#### 方法 1: 使用 setup.sh 脚本（推荐）

```bash
# 克隆代码仓库
git clone <repository-url>
cd firing

# 为脚本添加执行权限
chmod +x setup.sh

# 运行设置脚本
./setup.sh
```

setup.sh 脚本会自动：
- 检查 Node.js 和 npm 版本
- 安装所有项目依赖
- 验证依赖安装结果

#### 方法 2: 手动安装

```bash
# 克隆代码仓库
git clone <repository-url>
cd firing

# 安装所有依赖
npm install
```

### 3. 启动开发服务器

#### Web 端

```bash
npm run dev:web
# 访问 http://localhost:3000
```

#### 移动端

```bash
npm run dev:mobile
```

启动后，您可以通过以下方式访问：

1. **使用 Expo Go 应用**
   - 在 iOS 或 Android 设备上安装 Expo Go 应用
   - 使用设备相机扫描终端中显示的 QR 码
   - 应用会自动在 Expo Go 中打开

2. **在 Mac 上使用 iOS 模拟器**

   #### 前提条件
   - 一台运行 macOS 的 Mac 电脑
   - 安装最新版本的 Xcode（从 App Store 下载）
   - 安装 Xcode 命令行工具

   #### 详细步骤

   1. **安装 Xcode**
      - 打开 App Store，搜索 "Xcode"
      - 下载并安装 Xcode（约 10GB+，可能需要较长时间）
      - 安装完成后，打开 Xcode 并同意许可协议

   2. **安装 Xcode 命令行工具**
      - 打开终端，运行命令：
        ```bash
        xcode-select --install
        ```
      - 按照提示完成安装

   3. **安装 iOS 模拟器**
      - 打开 Xcode
      - 点击顶部菜单栏的 "Xcode" → "Preferences"
      - 点击 "Components" 标签页
      - 在 "Simulators" 部分，下载并安装至少一个 iOS 模拟器（推荐选择最新的 iOS 版本）

   4. **启动本项目的移动端开发服务器**
      - 在项目根目录打开终端
      - 运行命令：
        ```bash
        npm run dev:mobile
        ```

   5. **启动 iOS 模拟器**
      - 在终端中，当看到 "Press i to open iOS simulator" 提示时，按 `i` 键
      - Expo 会自动启动 iOS 模拟器并安装您的应用

   6. **选择不同的 iOS 设备**
      - 如果需要在不同的 iOS 设备上测试：
        - 在 Xcode 中，打开 "Window" → "Devices and Simulators"
        - 选择 "Simulators" 标签页
        - 点击左下角的 "+" 按钮添加新的模拟器
        - 选择设备类型和 iOS 版本，点击 "Create"
        - 重新运行 `npm run dev:mobile` 并按 `i` 键启动新的模拟器

   #### 常见问题解决

   - **模拟器启动失败**：
     - 确保 Xcode 已完全安装并打开过至少一次
     - 尝试重启 Mac 后再试
     - 检查终端是否有具体的错误信息

   - **权限问题**：
     - 确保您有足够的权限运行 Xcode 和模拟器
     - 尝试使用 sudo 权限运行命令（不推荐，仅作为最后的选择）

   - **应用安装失败**：
     - 检查网络连接是否正常
     - 确保 Expo 开发服务器正在运行
     - 尝试在模拟器中删除已有的应用，然后重新启动

   注意：首次启动 iOS 模拟器可能需要较长时间（30秒到1分钟），因为需要初始化模拟器环境和安装应用。

3. **使用 Android 模拟器**
   - 在终端中按 `a` 键启动 Android 模拟器
   - 应用会自动在模拟器中打开

4. **使用 Web 浏览器**
   - 在终端中按 `w` 键启动 Web 版本
   - 应用会在默认浏览器中打开

注意：首次启动可能需要下载依赖和构建应用，时间会稍长。

### 4. 构建生产版本

#### Web 端

```bash
npm run build:web
npm run start:web
# 访问 http://localhost:3000
```

#### 移动端

```bash
npm run build:mobile
# 构建产物在 apps/mobile/dist 目录
```

## 📦 核心功能

### 1. 资产管理
- 支持多种资产类型（现金、股票、基金、房产等）
- 资产估值与分类统计
- 资产历史记录与趋势分析

### 2. 负债管理
- 支持多种负债类型（信用卡、贷款、房贷等）
- 还款计划与记录
- 利息计算与负债分析

### 3. 交易记录
- 资产转账与交易记录
- 交易分类与标签
- 交易历史查询与统计

### 4. FIRE 目标规划
- 年度支出设置
- 安全提款率设置
- FIRE 目标金额计算
- 进度追踪与分析

### 5. 数据同步
- 本地数据持久化（SQLite）
- 跨平台数据一致性

## 🛠 技术栈

### 前端
- **Web**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo, TypeScript
- **Shared UI**: 共享 UI 组件库（@firing/ui）

### 数据管理
- **Database**: SQLite (better-sqlite3 for web, expo-sqlite for mobile)
- **Data Access**: Repository Pattern, Adapter Pattern

### 工具与库
- **State Management**: React Context API
- **Charting**: Recharts
- **Date Handling**: date-fns
- **Navigation**: React Navigation (mobile), Next.js App Router (web)

## 📖 项目文档

- [项目结构文档](./doc/PROJECT_STRUCTURE.md)
- [产品需求文档](./doc/PRD.md)
- [UI 设计文档](./doc/UI_Description.md)
- [用户故事与测试用例](./doc/UserStoriesAndTestCases.md)

## 🚢 部署说明

### 本地部署

1. 安装依赖：`npm install`
2. 启动服务：`npm run dev:web` (Web) 或 `npm run dev:mobile` (Mobile)

### Docker 部署

#### 使用部署脚本（推荐）

项目提供了完整的部署脚本，位于 `deploy/` 目录：

```bash
# 构建镜像
./deploy/build.sh

# 启动容器
./deploy/start.sh

# 停止容器
./deploy/stop.sh

# 重启容器
./deploy/restart.sh

# 查看日志
./deploy/logs.sh
```

#### 部署脚本说明

- **build.sh**：构建所有服务的 Docker 镜像
- **start.sh**：启动所有服务的容器
- **stop.sh**：停止所有服务的容器
- **restart.sh**：先停止所有服务，然后重新启动它们
- **logs.sh**：查看容器日志，支持选择查看开发环境、生产环境或所有服务的日志

#### 访问应用

启动后，应用会在以下地址可用：
- 开发环境: http://localhost:3000
- 生产环境: http://localhost:3001

## 🤝 贡献指南

1. Fork 代码仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](./LICENSE) 文件

## 📞 联系方式

- 项目链接: <repository-url>
- 问题反馈: <repository-url>/issues

---

**有钱么** - 让财务管理更简单，让财富增长更轻松！