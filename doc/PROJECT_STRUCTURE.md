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
  ├── docs/                 (项目文档)
  ├── README.md
  ├── PRD.md
  └── UI_Description.md
```

### 根目录配置文件
- **`package.json`**: 定义了 Workspaces (`apps/*`) 和全局启动脚本。
  - `npm run dev:web`: 启动 Web 端开发环境。
  - `npm run dev:mobile`: 启动移动端 Metro 服务。
  - `npm run db:studio`: 启动 Prisma Studio。

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
  - `dashboard/`: 仪表盘聚合数据 API。
  - `dev/data/`: 开发辅助数据 API。
  - `earnings/daily/`: 日收益与收益日历数据 API。
  - `fire/`: FIRE 目标 API（`config/`、`status/`）。
  - `liabilities/`: 负债 API（含 `[id]` 与 `payments/` 子资源）。
  - `market-data/`: 市场数据（手动配置）API。
  - `time-deposits/`: 定期存款相关 API（如 `[assetId]/redeem/` 到期兑付）。
  - `transactions/`: 交易/转账（Ledger）API（含 `[id]` 动态路由）。
- **`activity/`**: 时间轴页面。
- **`assets/`**: 资产管理页面。
- **`earnings/`**: 收益日历页面。
- **`fire/`**: FIRE 目标管理页面。
- **`liabilities/`**: 负债管理页面。
- **`settings/`**: 设置页面。
- **`transactions/`**: 交易/转账页面（转账、定期兑付等）。
- **`layout.tsx`**: 全局布局文件。
- **`page.tsx`**: 首页（仪表盘）。

### `apps/web/components/`
Web 端专用的 UI 组件。
- **`ui/`**: 基础组件（Button, Card, Input 等）。
- **`Sidebar.tsx`**: 侧边导航栏。

### `apps/web/lib/`
- **`prisma.ts`**: Prisma 客户端实例。
- **`financial-utils.ts`**: 核心金融计算逻辑（资产/负债估值、定期利息计算等；复用于 Web/Mobile）。
- **`currency-utils.ts`**: 汇率换算（折算为本位币）工具函数。
- **`utils.ts`**: 通用工具函数。

### `apps/web/prisma/`
- **`schema.prisma`**: 数据库模型定义。
- **`dev.db`**: SQLite 数据库文件 (开发环境)。

补充说明：
- Web 端开发默认使用 `apps/web/prisma/dev.db`，由 `apps/web/.env` 中的 `DATABASE_URL` 控制。

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
- **`_layout.tsx`**: 根布局。

### `apps/mobile/lib/`
- **`db.ts`**: 移动端 SQLite 数据库配置与初始化逻辑。
- **`storage.ts`**: 移动端本地存储封装（偏好/配置等）。

### `apps/mobile/components/`
移动端专用组件。
- **`Card.tsx`**: 卡片组件。

### `apps/mobile` 配置文件
- **`package.json`**: 移动端依赖定义。
- **`app.json`**: Expo 应用配置。

### `apps/mobile/ios/`
iOS 原生工程（Expo Prebuild / 原生能力集成），包含 `Podfile`、Xcode 工程与 Workspace 等文件。

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

### 数据库管理
```bash
# 推送 Schema 变更 (Web)
npm run db:push

# 查看数据 (Web)
npm run db:studio
```
