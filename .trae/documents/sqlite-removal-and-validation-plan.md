# SQLite 移除与功能验证计划

## 概述
完全移除 SQLite 依赖，统一使用 Neon (PostgreSQL) 数据库，并验证所有页面和 API 接口功能正常。

## 执行步骤

### 1. 移除 SQLite 相关代码和依赖

1.1 **删除 SQLite 适配器文件**
   - 删除 `apps/web/lib/database-adapter.ts`

1.2 **更新 package.json**
   - 从 `apps/web/package.json` 中移除 `better-sqlite3` 和 `@types/better-sqlite3` 依赖
   - 保留 `@neondatabase/serverless` 和 `@libsql/client`

1.3 **更新 next.config.mjs**
   - 移除 `serverExternalPackages: ['better-sqlite3']`
   - 移除 webpack externals 中的 `better-sqlite3`

1.4 **更新 Dockerfile**
   - 移除对 `python3 make g++` 的安装（better-sqlite3 构建需要）
   - 移除 `DATABASE_URL` 环境变量
   - 移除 `/app/data` volume 配置
   - 更新环境变量文档

1.5 **更新其他文档（可选）**
   - 从 README 和其他文档中移除 SQLite 相关说明

### 2. 验证所有页面功能

2.1 **首页 (page.tsx)**
   - 验证资产列表加载
   - 验证负债列表加载
   - 验证活动列表加载
   - 验证 FIRE 配置加载
   - 验证核心指标计算正常

2.2 **资产页面 (assets/page.tsx)**
   - 验证资产列表显示
   - 验证新增资产功能
   - 验证编辑资产功能
   - 验证删除资产功能
   - 验证资产筛选功能

2.3 **负债页面 (liabilities/page.tsx)**
   - 验证负债列表显示
   - 验证新增负债功能
   - 验证编辑负债功能
   - 验证删除负债功能
   - 验证还款记录功能

2.4 **交易页面 (transactions/page.tsx)**
   - 验证交易列表显示
   - 验证转账功能
   - 验证定期兑付功能
   - 验证删除交易功能

2.5 **FIRE 页面 (fire/page.tsx)**
   - 验证 FIRE 进度显示
   - 验证 FIRE 配置编辑功能
   - 验证 FIRE 资产明细显示

2.6 **活动页面 (activity/page.tsx)**
   - 验证活动列表加载
   - 验证分页功能
   - 验证筛选功能

2.7 **账户页面 (accounts/page.tsx)**
   - 验证账户列表显示
   - 验证新增/编辑/删除账户功能

2.8 **收益页面 (earnings/page.tsx)**
   - 验证收益数据加载
   - 验证日历显示

2.9 **市场数据页面 (market-data/page.tsx)**
   - 验证市场数据加载和保存

2.10 **设置页面 (settings/page.tsx)**
   - 验证所有设置功能

### 3. 验证所有 API 接口

3.1 **资产相关 API**
   - `GET /api/assets` - 获取所有资产
   - `POST /api/assets` - 创建资产
   - `PUT /api/assets/[id]` - 更新资产
   - `DELETE /api/assets/[id]` - 删除资产

3.2 **负债相关 API**
   - `GET /api/liabilities` - 获取所有负债
   - `POST /api/liabilities` - 创建负债
   - `PUT /api/liabilities/[id]` - 更新负债
   - `DELETE /api/liabilities/[id]` - 删除负债

3.3 **交易相关 API**
   - `GET /api/transactions` - 获取所有交易
   - `POST /api/transactions` - 创建交易
   - `DELETE /api/transactions/[id]` - 删除交易

3.4 **还款相关 API**
   - `GET /api/payments` - 获取所有还款
   - `POST /api/payments` - 创建还款

3.5 **活动相关 API**
   - `GET /api/activity` - 获取活动列表

3.6 **FIRE 相关 API**
   - `GET /api/fire` - 获取 FIRE 配置
   - `POST /api/fire` - 更新 FIRE 配置

3.7 **用户设置相关 API**
   - `GET /api/settings` - 获取用户设置
   - `POST /api/settings` - 更新用户设置

3.8 **演示数据相关 API**
   - `POST /api/demo/init` - 初始化演示数据
   - `POST /api/demo/reset` - 重置演示数据
   - `POST /api/settings/test-data` - 生成测试数据

3.9 **市场数据相关 API**
   - `GET /api/market-data` - 获取市场数据
   - `POST /api/market-data` - 保存市场数据

3.10 **收益相关 API**
   - `GET /api/earnings` - 获取收益数据

3.11 **账户相关 API**
   - `GET /api/accounts` - 获取账户列表
   - `POST /api/accounts` - 创建账户
   - `PUT /api/accounts/[id]` - 更新账户
   - `DELETE /api/accounts/[id]` - 删除账户

## 预期结果

- ✅ 所有 SQLite 相关代码和依赖已移除
- ✅ 项目可以正常构建和运行
- ✅ 所有页面功能正常
- ✅ 所有 API 接口正常工作
- ✅ 使用 Neon PostgreSQL 作为唯一数据库
