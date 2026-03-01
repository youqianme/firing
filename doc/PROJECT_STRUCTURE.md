# 全栈项目目录结构说明

本文档详细介绍了 `有钱么` 项目的整体文件结构及其作用。该项目采用 **Monorepo** 结构，使用 **Next.js** 构建 Web 端，使用 **React Native (Expo)** 构建移动端。

## 📂 根目录概览

```text
firing/
  ├── package.json          (根配置：Workspaces 与脚本)
  ├── package-lock.json     (依赖锁文件)
  ├── .gitignore            (Git 忽略规则)
  ├── apps/                 (应用源码)
  │   ├── web/              (Web 端项目)
  │   └── mobile/           (移动端项目)
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
  ├── docker-compose.yml    (Docker 配置)
  └── Dockerfile            (Docker 构建文件)
```

### 根目录配置文件
- **`package.json`**: 定义了 Workspaces (`apps/*`, `packages/*`, `config/*`) 和全局启动脚本。
  - `npm run dev:web`: 启动 Web 端开发环境。
  - `npm run dev:mobile`: 启动移动端 Metro 服务。
  - `npm run build:web`: 构建 Web 端生产版本。
  - `npm run build:mobile`: 构建移动端生产版本。
  - `npm run start:web`: 启动 Web 端生产服务器。

### 共享代码目录 (`packages/`)
- **`types/`**: 共享类型定义，包含资产、负债、交易等所有数据模型的类型。
- **`utils/`**: 共享工具函数，包含货币转换、日期格式化、FIRE计算等功能。
- **`data-access/`**: 共享数据访问层，包含数据库适配器和仓库模式。
- **`ui/`**: 共享 UI 组件，包含在 Web 端和移动端之间共享的通用组件。

### 配置文件目录 (`config/`)
- **`.env.example`**: 环境变量示例文件，包含所有需要的环境变量及其默认值。
- **`.env.production`**: 生产环境变量配置文件，包含生产环境的具体配置。

### 部署脚本目录 (`deploy/`)
- **`build.sh`**: 构建所有服务的 Docker 镜像。
- **`start.sh`**: 启动所有服务的容器。
- **`stop.sh`**: 停止所有服务的容器。
- **`restart.sh`**: 先停止所有服务，然后重新启动它们。
- **`logs.sh`**: 查看容器日志，支持选择查看开发环境、生产环境或所有服务的日志。
- **`README.md`**: 部署文档，包含部署流程和注意事项。

补充说明：
- 本仓库可能会出现本地工具/缓存目录（例如 `.trae/`、`mobile/temp_home/`、`**/.next/`、`node_modules/`），它们不属于项目核心结构，已通过 `.gitignore` 进行忽略。

---

## 🌐 Web 端目录详解 (`apps/web/`)

采用 **Next.js (App Router)** 架构。

### `apps/web/app/`
Web 端的核心页面和 API 路由目录。
- **`api/`**: 后端 API 接口。
  - `accounts/`: 账户（Account）API。
  - `activity/`: 时间轴（操作日志）API。
  - `assets/`: 资产 API（含 `[id]` 动态路由）。
  - `auth/register/`: 用户注册API（预留）。
  - `demo/init/`: 演示数据初始化API。
  - `demo/reset/`: 演示数据重置API（游客账户专用）。
  - `earnings/`: 收益数据API。
  - `fire/`: FIRE 目标 API。
  - `liabilities/`: 负债 API（含 `[id]` 与 `payments/` 子资源）。
  - `market-data/`: 市场数据（手动配置）API。
  - `settings/`: 设置API（含数据清空功能）。
  - `transactions/`: 交易/转账（Ledger）API（含 `[id]` 动态路由）。
- **`components/`**: 共享组件。
  - `DemoBanner.tsx`: 游客模式提示条组件。
  - `Sidebar.tsx`: 可折叠侧边栏组件。
- **`context/`**: React上下文。
  - `UserContext.tsx`: 用户状态管理（游客账户核心逻辑）。
  - `SidebarContext.tsx`: 侧边栏折叠状态管理。
- **`activity/`**: 时间轴页面。
- **`assets/`**: 资产管理页面。
- **`earnings/`**: 收益日历页面。
- **`fire/`**: FIRE 目标管理页面。
- **`liabilities/`**: 负债管理页面。
- **`market-data/`**: 市场数据管理页面。
- **`settings/`**: 设置页面。
- **`transactions/`**: 交易/转账页面（转账、定期兑付等）。
- **`layout.tsx`**: 全局布局文件。
- **`page.tsx`**: 首页（仪表盘）。

### `apps/web/lib/`
- **`database.ts`**: Web 端数据库配置与初始化逻辑。
- **`database-adapter.ts`**: Web 端数据库适配器，使用 better-sqlite3。
- **`dataAccess.ts`**: Web 端数据访问层，使用共享的仓库模式。

### `apps/web/styles/`
- **`globals.css`**: 全局样式文件。

### `apps/web` 配置文件
- **`package.json`**: Web 端依赖定义。

---

## 📱 移动端目录详解 (`apps/mobile/`)

采用 **Expo (React Native)** 架构。

### `apps/mobile/app/` (Expo Router)
移动端页面路由。
- **`(tabs)/`**: 底部标签栏页面。
  - `index.tsx`: 首页（仪表盘）。
  - `assets.tsx`: 资产列表与编辑。
  - `liabilities.tsx`: 负债列表。
  - `settings.tsx`: 设置页（含 FIRE 配置）。
  - `transactions.tsx`: 交易记录页面。
- **`_layout.tsx`**: 根布局。

### `apps/mobile/lib/`
- **`db.ts`**: 移动端 SQLite 数据库配置与初始化逻辑。
- **`database-adapter.ts`**: 移动端数据库适配器，使用 expo-sqlite。
- **`dataAccess.ts`**: 移动端数据访问层，使用共享的仓库模式。

### `apps/mobile/assets/`
- **`adaptive-icon.png`**: 自适应图标。
- **`favicon.png`**: 网站图标。
- **`icon.png`**: 应用图标。
- **`splash-icon.png`**: 启动屏幕图标。

### `apps/mobile` 配置文件
- **`package.json`**: 移动端依赖定义。
- **`app.json`**: Expo 应用配置。
- **`tsconfig.json`**: TypeScript 配置文件。

---

## 🚀 快速开始

### 启动 Web 端
```bash
# 在根目录运行
npm install
npm run dev:web
# 访问 http://localhost:3000
```

### 启动移动端
```bash
# 在根目录运行
npm run dev:mobile
# 按 'i' 启动 iOS 模拟器，或按 'a' 启动 Android 模拟器
```

### 构建生产版本
```bash
# 构建 Web 端
npm run build:web

# 构建移动端
npm run build:mobile
```

### Docker 部署
```bash
# 构建镜像
./deploy/build.sh

# 启动容器
./deploy/start.sh

# 访问应用
# 开发环境: http://localhost:3000
# 生产环境: http://localhost:3001
```