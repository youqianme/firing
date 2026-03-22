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
  ├── doc/                  (项目文档)
  ├── package.json          (根配置：Workspaces 与脚本)
  └── vercel.json           (Vercel 部署配置)
```

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm 9+

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

### 3. 数据库初始化

本项目使用 **人工执行 SQL 文件** 的方式进行数据库初始化，程序运行时不再自动创建表结构。

#### 初始化步骤

```bash
# 使用 SQLite 客户端执行 schema.sql
sqlite3 youqianme.db < packages/data-access/sql/schema.sql

# 或使用其他数据库客户端执行
# 对于 Neon (Postgres) 或 Turso (LibSQL)，请使用对应客户端执行 SQL 文件
```

#### 数据库 Schema 文件

- **位置**: `packages/data-access/sql/schema.sql`
- **内容**: 包含所有表的 DDL 语句和初始数据
- **更新**: 当表结构变更时，需要人工更新此文件并重新执行

#### 使用 init-db.mjs 脚本（可选）

```bash
# 配置环境变量后，运行初始化脚本
node scripts/init-db.mjs
```

该脚本会读取 `packages/data-access/sql/schema.sql` 并执行其中的 SQL 语句。

### 4. 启动开发服务器

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

### 5. 构建生产版本

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
- 支持设置资产开始日期，用于历史趋势计算

### 2. 负债管理
- 支持多种负债类型（信用卡、贷款、房贷等）
- 还款计划与记录
- 利息计算与负债分析
- 支持设置负债开始日期，用于历史趋势计算

### 3. 交易记录
- 资产转账与交易记录
- 交易分类与标签
- 交易历史查询与统计

### 4. FIRE 目标规划
- 年度支出设置
- 安全提款率设置
- FIRE 目标金额计算
- 进度追踪与分析

### 5. 资产负债趋势图
- 可视化展示资产、负债、净资产三条趋势曲线
- 资产（绿色）显示在0轴上方，负债（红色）显示在0轴下方
- 净资产（蓝色折线）显示资产减负债的差额
- **FIRE进度（橙色虚线）**：显示财务自由目标完成百分比
- 双Y轴设计：左侧显示金额，右侧显示FIRE进度百分比
- 按月计算数据，基于实际创建时间（startDate）统计
- 支持6种时间范围切换：6个月、1年、2年、3年、5年、10年
- 在资产/负债创建之前的时间点显示为0，不进行估算

### 6. 数据同步
- 本地数据持久化（SQLite）
- 跨平台数据一致性

### 7. 游客账户系统
- **零注册体验**：无需注册即可使用完整功能
- **数据隔离**：每个设备拥有独立的游客账户
- **一键重置**：支持清空数据或重新填充演示数据
- **无缝升级**：未来可无缝升级为正式注册用户

### 8. 测试数据生成
- 一键生成覆盖所有功能的测试数据
- 包含账户、资产、负债、交易等多种数据类型
- 符合常规业务逻辑的真实数据
- 快速体验系统所有功能

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
- [游客账户系统实现文档](./doc/GUEST_ACCOUNT_SYSTEM.md) - 详细记录游客账户系统的完整实现
- [数据库设计文档](./doc/DATABASE_DESIGN.md) - 完整的数据库架构和表结构设计

## 🚢 部署说明

### 本地部署

1. 安装依赖：`npm install`
2. 启动服务：`npm run dev:web` (Web) 或 `npm run dev:mobile` (Mobile)

### Vercel 部署

本项目支持部署到 Vercel。

1.  在 Vercel 控制台导入项目。
2.  Framework Preset 选择 Next.js。
3.  Root Directory 保持默认或根据提示选择（Vercel 通常能自动识别 Monorepo 中的 `apps/web`）。
4.  配置环境变量：
    *   **选项 A (推荐): 使用 Vercel Postgres (Neon)**
        *   在 Vercel 项目设置中，添加 Storage -> Postgres。
        *   Vercel 会自动设置 `POSTGRES_URL` 等环境变量，无需手动配置。
    *   **选项 B: 使用 Turso (LibSQL)**
        *   `TURSO_DATABASE_URL`: LibSQL/Turso 数据库连接 URL (例如: `libsql://your-db.turso.io`)
        *   `TURSO_AUTH_TOKEN`: LibSQL/Turso 认证 Token
    *   **注意**：如果不配置上述变量，将默认使用本地 SQLite 文件数据库。在 Vercel 等 Serverless 环境中，本地文件是临时的，重新部署后数据会丢失。强烈建议配置 Neon 或 Turso 以实现数据持久化。
5.  点击 Deploy。

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