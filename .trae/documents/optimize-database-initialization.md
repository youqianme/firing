# 数据库初始化逻辑优化计划

## 背景
当前 `DatabaseManager.initialize()` 方法在程序运行时通过代码执行 DDL 语句创建表结构和插入默认数据。这种方式存在以下问题：
1. DDL 语句分散在代码中，不易管理和维护
2. 难以进行版本控制和代码审查
3. 不方便数据库迁移管理

## 目标
1. 提供完整的 DDL SQL 文件，由人工单独执行
2. 程序完全不关心数据库表是否已创建，移除所有 DDL 执行逻辑
3. 不需要兼容旧逻辑，直接按最新表结构

## 具体步骤

### 1. 创建 SQL 文件
在 `packages/data-access/sql/` 目录下创建 `schema.sql` 文件，包含所有表结构和初始数据：

- assets 表
- liabilities 表
- payments 表
- transactions 表
- accounts 表
- marketData 表
- activities 表
- fireConfig 表
- userSettings 表

### 2. 修改 DatabaseManager

#### 2.1 完全移除 `initialize()` 方法
- 删除整个 `initialize()` 方法
- 删除 `isInitialized` 和 `initializationPromise` 状态
- 删除 `ensureUserIdColumn` 迁移方法
- 程序不再关心数据库是否已初始化

#### 2.2 简化 DatabaseManager
- 只保留 `getAdapter()` 和 `close()` 方法
- 移除所有与表创建相关的逻辑

### 3. 文件结构变更
```
packages/data-access/
├── sql/
│   └── schema.sql          # 新建：包含所有 DDL 和初始数据
├── src/
│   └── database/
│       ├── adapter.ts      # 不变
│       └── manager.ts      # 修改：移除 initialize 方法
```

### 4. SQL 文件内容

#### schema.sql
```sql
-- 资产表
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  includeInFire INTEGER NOT NULL DEFAULT 1,
  accountId TEXT,
  quantity DOUBLE PRECISION,
  unitPrice DOUBLE PRECISION,
  interestRate DOUBLE PRECISION,
  startDate TEXT,
  endDate TEXT,
  valuationMethod TEXT NOT NULL DEFAULT 'cost',
  updatedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  notes TEXT
);

-- 负债表
CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  balance DOUBLE PRECISION NOT NULL,
  interestRate DOUBLE PRECISION,
  startDate TEXT,
  endDate TEXT,
  updatedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  notes TEXT
);

-- 还款记录表
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  liabilityId TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (liabilityId) REFERENCES liabilities (id) ON DELETE CASCADE
);

-- 交易表
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  type TEXT NOT NULL,
  fromAssetId TEXT,
  toAssetId TEXT,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  fee DOUBLE PRECISION,
  date TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (fromAssetId) REFERENCES assets (id) ON DELETE SET NULL,
  FOREIGN KEY (toAssetId) REFERENCES assets (id) ON DELETE SET NULL
);

-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT,
  createdAt TEXT NOT NULL,
  notes TEXT
);

-- 市场数据表
CREATE TABLE IF NOT EXISTS marketData (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  price DOUBLE PRECISION NOT NULL,
  updatedAt TEXT NOT NULL,
  source TEXT NOT NULL
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL DEFAULT 'default',
  action TEXT NOT NULL,
  objectType TEXT NOT NULL,
  objectId TEXT NOT NULL,
  objectName TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  oldAmount DOUBLE PRECISION,
  delta DOUBLE PRECISION,
  notes TEXT,
  createdAt TEXT NOT NULL
);

-- FIRE配置表
CREATE TABLE IF NOT EXISTS fireConfig (
  id TEXT PRIMARY KEY,
  annualExpense DOUBLE PRECISION NOT NULL DEFAULT 0,
  swr DOUBLE PRECISION NOT NULL DEFAULT 4,
  updatedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS userSettings (
  id TEXT PRIMARY KEY,
  baseCurrency TEXT NOT NULL DEFAULT 'CNY',
  privacyMode INTEGER NOT NULL DEFAULT 0,
  updatedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

-- 初始数据
INSERT OR IGNORE INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt) 
VALUES ('default', 0, 4, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO userSettings (id, baseCurrency, privacyMode, updatedAt, createdAt) 
VALUES ('default', 'CNY', 0, datetime('now'), datetime('now'));
```

### 5. 调整所有引用 initialize() 的文件

需要修改的文件列表：

| 文件路径 | 当前调用方式 | 调整内容 |
|---------|------------|---------|
| `/Users/wangyuheng/Documents/trae_projects/firing/scripts/init-db.mjs` | `dbManager.initialize()` | 删除该调用，脚本改为只执行 SQL 文件 |
| `/Users/wangyuheng/Documents/trae_projects/firing/apps/web/lib/database.ts` | `dbManager.initialize()` | 删除该调用和相关函数 |
| `/Users/wangyuheng/Documents/trae_projects/firing/apps/mobile/lib/db.ts` | `dbManager.initialize()` | 删除该调用和相关函数 |

#### 各文件具体调整

**scripts/init-db.mjs**
- 删除 `dbManager.initialize()` 调用
- 脚本改为读取并执行 SQL 文件
- 执行完成后关闭连接

**apps/web/lib/database.ts**
- 删除 `initializeDatabase` 函数
- 删除 `dbManager.initialize()` 调用
- 导出简化后的 dbManager

**apps/mobile/lib/db.ts**
- 删除 `initDatabase` 函数
- 删除 `dbManager.initialize()` 调用
- 导出简化后的 dbManager

### 6. 使用方式

1. **人工执行 SQL 文件**：
   ```bash
   # 使用 sqlite3
   sqlite3 database.db < packages/data-access/sql/schema.sql
   
   # 或使用其他数据库客户端执行
   ```

2. **程序启动**：
   - 程序直接开始使用数据库，不再调用 initialize()
   - 假设表结构已经由人工创建好

## 预期结果
- 所有 DDL 语句集中在 SQL 文件中，便于管理
- 程序代码大幅简化，不再包含任何 DDL 逻辑
- 数据库初始化完全由人工控制
- 职责清晰分离：人工负责 Schema，程序负责业务数据
