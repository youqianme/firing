# 有钱么财务应用变更日志

## [1.3.0] - 2026-03-02

### 🚀 新特性

- **侧边栏折叠功能**
  - 实现左侧菜单的折叠/展开功能
  - 折叠状态宽度为 64px，只显示图标
  - 展开状态宽度为 256px，显示完整菜单
  - 添加平滑过渡动画，提升用户体验
  - 使用 Context API 管理侧边栏状态
  - DemoBanner 位置根据侧边栏状态自动调整
  - 窗口大小变化时位置也会相应调整

### 📱 移动端优化

- **首页布局优化**
  - 核心指标卡片在移动端更紧凑，减少内边距
  - FIRE 进度卡片在移动端首屏可见
  - 趋势图高度调整为移动端更合适的尺寸

- **设置页面数据管理区域优化**
  - 数据管理区域在移动端改为单列布局
  - 确保内容不会超出视口宽度

- **DemoBanner 优化**
  - 调整 z-index 为 15，低于底部导航（z-20）
  - 不再遮挡移动端的底部菜单
  - 位置根据侧边栏状态自适应调整

## [1.2.2] - 2026-03-01

### ⚙️ 配置变更

- **数据库配置简化**
  - 移除默认 SQLite 数据库选项，统一使用 Neon (Postgres)
  - 更新 `database.ts`，优先使用 `POSTGRES_URL` 或 `NEON_DATABASE_URL`
  - 移除 `path` 和 `fs` 导入，不再需要本地文件系统
  - 本地开发通过 `.env.local` 配置 Neon 数据库连接
  - 如果未配置数据库，将抛出明确的错误提示
  - 删除 SQLite 适配器文件 `apps/web/lib/database-adapter.ts`
  - 从 `apps/web/package.json` 移除 `better-sqlite3` 和 `@types/better-sqlite3` 依赖
  - 更新 `next.config.mjs`，移除 `serverExternalPackages` 和 webpack externals 配置
  - 更新 `Dockerfile`，移除 SQLite 构建依赖（`python3 make g++`）和 volume 配置
  - 更新 `config/.env.example`，移除 SQLite 配置，添加 Neon 配置示例
  - 删除 `config/.env.production`（包含旧的 SQLite 配置）

- **部署方式切换至 Vercel**
  - 移除 Docker 部署相关文件和配置
  - 删除 `Dockerfile` 和 `docker-compose.yml`
  - 删除 `deploy/` 目录及其所有 Docker 部署脚本
  - 更新 `README.md`，移除 Docker 部署文档，保留 Vercel 部署说明
  - 项目现在完全使用 Vercel 部署，不再需要 Docker

### �🐛 问题修复

- **PostgreSQL 列名兼容性修复**
  - 修复 Neon (Postgres) 适配器的大小写敏感列名问题
  - 更新 `convertSql` 方法，自动检测和引用所有包含大写字母的标识符
  - 支持的列名包括：`userId`、`accountId`、`includeInFire`、`updatedAt`、`createdAt` 等
  - 避免为 SQL 关键字添加引号（如 `SELECT`、`FROM`、`WHERE`）

- **marketData 表修复**
  - 修复 `marketDataRepository` 中对不存在的 `userId` 列的引用
  - 更新相关 API 路由以匹配新的方法签名
  - 从 schema 确认 `marketData` 表没有 `userId` 列

- **前端鲁棒性增强**
  - 所有页面添加 `Array.isArray()` 安全检查
  - 修复页面：transactions、assets、liabilities、fire、home、activity、accounts、earnings
  - 当 API 返回错误对象 `{ error: "..." }` 而不是数组时，应用程序不会崩溃
  - 所有数组操作（`.filter()`, `.map()`, `for...of`）都有安全防护

## [1.2.1] - 2026-03-01

### 🔧 优化与修复

- **数字显示优化**
  - 修复首页图标数字超过百万显示不完整的问题
  - 优化 `formatCurrency` 函数，添加智能大数格式化功能
  - 超过 1 万的数字自动缩写为 "万" 单位（如 ¥123.45万）
  - 超过 1 亿的数字自动缩写为 "亿" 单位（如 ¥1.23亿）
  - 小于 1 万的数字保持原有格式不变

## [1.2.0] - 2026-02-28

### 🚀 新特性

- **游客账户系统**
  - 实现零注册体验，用户无需注册即可使用完整功能
  - 基于UUID的设备绑定机制，确保每个设备拥有独立的游客账户
  - 完整的数据隔离实现，通过HTTP头`x-user-id`实现用户数据分离
  - 支持一键清空所有个人数据
  - 支持一键重新填充演示数据
  - 添加全屏Loading状态，防止重复操作
  - 游客模式提示条UI组件，提供清晰的用户指引

### 🔧 优化与修复

- **数据管理优化**
  - 优化数据库初始化流程，避免重复初始化演示数据
  - 改进API错误处理机制，提供更友好的错误提示
  - 增强数据操作的原子性，确保数据一致性

## [1.1.0] - 2026-02-27

### 🚀 新特性

- **FIRE 目标规划**
  - 新增 FIRE (Financial Independence, Retire Early) 目标页面
  - 支持配置年度支出和安全提取率 (SWR)
  - 可视化展示 FIRE 进度、目标金额和当前资产缺口
  - 支持筛选计入 FIRE 计算的资产

### 🏗️ 基础设施

- **多数据库支持**
  - 新增 Neon (Serverless Postgres) 数据库支持，适配 Vercel 部署环境
  - 新增 LibSQL/Turso 数据库支持
  - 实现数据库适配器的动态切换，根据环境变量自动选择存储引擎 (SQLite/Postgres/LibSQL)

### 🔧 优化与修复

- **部署适配**
  - 优化 Vercel 部署流程
  - 修复每日收益计算问题

### Commits

- ccf861a deploy
- 608f7a9 build web
- 1714243 fire
- 51e0f21 neon db
- f17b6d3 vercel db
- e1fece4 setup
- 7f252c7 dev

## [1.0.3] - 2026-02-23

### ⚡️ 性能优化

- **前端渲染优化**
  - 在 `AssetsPage` 中引入 `useMemo` 缓存资产列表过滤逻辑，避免表单输入时的无效重渲染，彻底解决打字卡顿问题
  - 在首页引入 `useMemo` 缓存图表数据，减少图表组件的不必要重绘
  - 在多个核心页面 (`AssetsPage`, `TransactionsPage`, `ActivityPage`, `HomePage`) 的 `useEffect` 中引入 `AbortController`，确保组件卸载时自动取消未完成的 API 请求，防止竞态条件和内存泄漏
  - 移除导致全局布局抖动（Layout Thrashing）的高成本 `window.dispatchEvent` 调用

- **后端与数据库**
  - 优化数据库连接初始化逻辑，将 `initializeDatabase()` 移入 API 路由处理函数内部，避免模块加载时的并发连接竞争
  - 为 SQLite 的 `PRAGMA` 设置添加防御性 `try-catch` 块，增强热重载场景下的文件锁稳定性

- **构建与开发环境**
  - 在 `next.config.mjs` 中禁用 `reactStrictMode`，减少开发模式下的双重渲染开销
  - 将 `better-sqlite3` 配置为 Webpack 和 Next.js 的外部依赖 (`externals`), 避免打包原生模块导致的编译 CPU 飙升
  - 移除启动脚本中的 `MALLOC_TRACING` 环境变量，消除 Node.js 调试警告

### 🐛 问题修复

- **配置兼容性**
  - 适配 Next.js 16 配置，将 `experimental.serverComponentsExternalPackages` 迁移至顶层 `serverExternalPackages`
  - 更新 `dev` 脚本为 `next dev --webpack`，解决与默认 Turbopack 的配置冲突

- **Git 配置**
  - 更新 `.gitignore` 规则，忽略 SQLite WAL 模式产生的临时文件 (`*.db-shm`, `*.db-wal`)

## [1.0.2] - 2026-02-17

### ✨ 功能更新

- **生成测试数据功能**
  - 在设置页面添加“生成测试数据”按钮，位于数据管理卡片中
  - 实现一键生成覆盖所有功能的测试数据，包含账户、资产、负债、交易等多种数据类型
  - 添加详细的确认对话框，包含测试数据的详细说明
  - 实现加载状态指示器，防止用户重复点击
  - 实现成功/失败的消息提示，提升用户体验

- **后端 API 实现**
  - 在 `/api/settings/test-data` 路径下实现生成测试数据的 API 端点
  - 使用 `INSERT OR REPLACE` 语句避免主键约束冲突
  - 实现事务处理，确保数据生成的原子性
  - 测试数据生成过程在 1 秒内完成，符合性能要求

- **用户体验优化**
  - 优化设置页面的网格布局，提升视觉效果
  - 确保响应式设计，在不同屏幕尺寸下正常工作
  - 改进卡片式设计，提升用户体验
  - 优化按钮命名，将“添加测试数据”改为“生成测试数据”以更准确地反映其功能

- **功能修复**
  - 修复确认对话框行为问题，确保所有操作只在用户确认后执行
  - 添加详细的控制台日志，便于调试和问题定位
  - 确保网络请求只在用户确认后执行，防止误操作

## [1.0.1] - 2026-02-16

### 📁 结构调整

- **删除无用文件**
  - 删除 apps/web/app/test.tsx 测试文件
  - 删除 apps/mobile/index.ts 入口文件
  - 删除 apps/mobile/package-lock.json 文件
  - 删除 openspec 目录

- **优化目录结构**
  - 创建 config/ 目录，用于存放环境变量配置文件
  - 创建 packages/ui/ 目录，用于共享 UI 组件

- **更新配置文件**
  - 更新根目录 package.json，添加 config/ 目录到 workspaces
  - 为 UI 组件包创建 package.json 文件

- **更新文档**
  - 更新 README.md 文件，反映项目结构的变化
  - 更新 PROJECT_STRUCTURE.md 文件，详细说明新的目录结构
  - 更新 CHANGELOG.md 文件，记录本次结构调整的变更

## [1.0.0] - 2026-02-16

### 🎉 初始版本

- **项目结构**
  - 采用 Monorepo 结构，使用 npm workspaces 管理依赖
  - 创建 apps/web 和 apps/mobile 目录，分别用于 Web 和移动端开发
  - 创建 packages 目录，包含共享的 types、utils、data-access 和 ui 包
  - 创建 config 目录，用于存放环境变量配置文件
  - 优化部署脚本目录结构，提供完整的 Docker 部署支持

- **核心功能**
  - 资产管理：支持多种资产类型，资产估值与分类统计
  - 负债管理：支持多种负债类型，还款计划与记录
  - 交易记录：资产转账与交易记录，交易分类与标签
  - FIRE 目标规划：年度支出设置，安全提款率设置，目标金额计算
  - 数据同步：本地数据持久化（SQLite），跨平台数据一致性

- **技术实现**
  - Web 端：使用 Next.js 16, React 19, TypeScript, Tailwind CSS
  - 移动端：使用 React Native, Expo, TypeScript
  - 数据管理：使用 SQLite（Web 端使用 better-sqlite3，移动端使用 expo-sqlite）
  - 数据访问：使用 Repository Pattern 和 Adapter Pattern，实现跨平台兼容
  - 共享代码：提取共享类型定义、工具函数、数据访问层和 UI 组件，实现代码复用

- **部署支持**
  - 提供 Docker 配置，支持容器化部署
  - 提供完整的部署脚本（build.sh, start.sh, stop.sh, restart.sh, logs.sh）
  - 支持开发环境和生产环境的分离部署

- **文档**
  - 创建项目结构文档、产品需求文档、UI 设计文档和用户故事与测试用例
  - 提供详细的 README.md 文件，包含快速开始指南和核心功能说明
  - 提供详细的部署文档，包含部署流程和注意事项

## [1.0.1] - 2026-02-16

### 📁 结构调整

- **删除无用文件**
  - 删除 apps/web/app/test.tsx 测试文件
  - 删除 apps/mobile/index.ts 入口文件
  - 删除 apps/mobile/package-lock.json 文件
  - 删除 openspec 目录

- **优化目录结构**
  - 创建 config/ 目录，用于存放环境变量配置文件
  - 创建 packages/ui/ 目录，用于共享 UI 组件

- **更新配置文件**
  - 更新根目录 package.json，添加 config/ 目录到 workspaces
  - 为 UI 组件包创建 package.json 文件

- **更新文档**
  - 更新 README.md 文件，反映项目结构的变化
  - 更新 PROJECT_STRUCTURE.md 文件，详细说明新的目录结构
  - 更新 CHANGELOG.md 文件，记录本次结构调整的变更

## [0.1.0] - 2026-02-10

### 🚧 开发版本

- **Web 端基础架构**
  - 搭建 Next.js 项目脚手架
  - 实现基础页面布局和路由
  - 实现资产管理、负债管理、交易记录等核心功能的 Web 端界面

- **移动端基础架构**
  - 搭建 React Native/Expo 项目脚手架
  - 实现底部标签栏导航
  - 实现资产管理、负债管理、交易记录等核心功能的移动端界面

- **数据模型设计**
  - 设计资产、负债、交易、账户等核心数据模型
  - 实现 SQLite 数据库表结构
  - 实现基础的数据访问操作

- **共享代码初始化**
  - 创建共享类型定义包
  - 创建共享工具函数包
  - 创建共享数据访问层包

[1.1.0]: #
[1.0.3]: #
[1.0.2]: #
[1.0.1]: #
[1.0.0]: #
[0.1.0]: #