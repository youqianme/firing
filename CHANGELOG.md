# 有钱么财务应用变更日志

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

[1.0.0]: #
[0.1.0]: #