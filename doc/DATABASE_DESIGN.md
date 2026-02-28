# 数据库设计文档 - 有钱么 (YouQianMe)

本文档详细描述了"有钱么"财务应用的数据库架构、表结构设计、数据模型和实现细节。

## 🎯 数据库概述

### 1. 技术选型
- **主数据库**: SQLite (开发环境)
- **云端数据库**: 
  - Neon (Serverless Postgres) - Vercel部署
  - LibSQL/Turso - 边缘计算部署
- **ORM/数据访问**: 自定义Repository模式 + SQL原生查询
- **连接管理**: 单例模式 + 连接池

### 2. 数据库架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web端         │    │   移动端        │    │   云端          │
│   better-sqlite3│    │   expo-sqlite   │    │   Neon Postgres │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│   Repository层  │    │   Repository层  │    │   Repository层  │
│   (统一接口)    │    │   (统一接口)    │    │   (统一接口)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 数据模型设计

### 1. 用户管理

#### 用户表 (users)
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT,
    is_guest BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. 资产管理

#### 资产表 (assets)
```sql
CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'cash', 'savings', 'checking', 'stocks', 'bonds', 'funds', 'reits',
        'crypto', 'real_estate', 'vehicle', 'precious_metals', 'other'
    )),
    subtype TEXT,
    current_value DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'CNY',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_included_in_fire BOOLEAN DEFAULT TRUE,
    institution_name TEXT,
    account_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_active ON assets(is_active);
```

#### 资产历史价值表 (asset_values)
```sql
CREATE TABLE asset_values (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE(asset_id, date)
);

CREATE INDEX idx_asset_values_asset_id ON asset_values(asset_id);
CREATE INDEX idx_asset_values_date ON asset_values(date);
```

### 3. 负债管理

#### 负债表 (liabilities)
```sql
CREATE TABLE liabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'credit_card', 'mortgage', 'auto_loan', 'student_loan',
        'personal_loan', 'business_loan', 'other'
    )),
    current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    original_amount DECIMAL(15,2),
    interest_rate DECIMAL(5,4),
    minimum_payment DECIMAL(10,2),
    payment_due_day INTEGER,
    currency TEXT DEFAULT 'CNY',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    lender_name TEXT,
    account_number TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX idx_liabilities_type ON liabilities(type);
CREATE INDEX idx_liabilities_active ON liabilities(is_active);
```

#### 负债还款记录表 (liability_payments)
```sql
CREATE TABLE liability_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    liability_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liability_id) REFERENCES liabilities(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_liability_id ON liability_payments(liability_id);
CREATE INDEX idx_payments_date ON liability_payments(payment_date);
```

### 4. 交易管理

#### 交易记录表 (transactions)
```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    from_asset_id INTEGER,
    to_asset_id INTEGER,
    type TEXT NOT NULL CHECK (type IN (
        'income', 'expense', 'transfer', 'investment', 'adjustment'
    )),
    category TEXT,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    description TEXT,
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    FOREIGN KEY (to_asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### 5. FIRE目标管理

#### FIRE配置表 (fire_config)
```sql
CREATE TABLE fire_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    annual_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
    safe_withdrawal_rate DECIMAL(5,4) NOT NULL DEFAULT 0.04,
    target_amount DECIMAL(15,2) GENERATED ALWAYS AS (
        annual_expenses / NULLIF(safe_withdrawal_rate, 0)
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 6. 市场数据

#### 市场数据表 (market_data)
```sql
CREATE TABLE market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    name TEXT,
    current_price DECIMAL(15,4),
    price_change DECIMAL(15,4),
    price_change_percent DECIMAL(8,4),
    market_cap BIGINT,
    volume BIGINT,
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_market_data_user_id ON market_data(user_id);
CREATE INDEX idx_market_data_symbol ON market_data(symbol);
```

### 7. 活动日志

#### 活动日志表 (activity_logs)
```sql
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    description TEXT,
    metadata TEXT, -- JSON格式存储额外信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at);
```

## 🔧 数据库初始化

### 1. 初始化脚本

#### SQLite初始化 (packages/data-access/src/database/init.sql)
```sql
-- 启用外键约束
PRAGMA foreign_keys = ON;

-- 创建所有表
-- [上述所有CREATE TABLE语句]

-- 创建视图
CREATE VIEW net_worth_summary AS
SELECT 
    u.id as user_id,
    COALESCE(SUM(a.current_value), 0) as total_assets,
    COALESCE(SUM(l.current_balance), 0) as total_liabilities,
    COALESCE(SUM(a.current_value), 0) - COALESCE(SUM(l.current_balance), 0) as net_worth,
    datetime('now') as calculated_at
FROM users u
LEFT JOIN assets a ON u.id = a.user_id AND a.is_active = TRUE
LEFT JOIN liabilities l ON u.id = l.user_id AND l.is_active = TRUE
GROUP BY u.id;

-- 创建资产分类视图
CREATE VIEW asset_allocation AS
SELECT 
    user_id,
    type,
    COUNT(*) as asset_count,
    SUM(current_value) as total_value,
    ROUND(SUM(current_value) * 100.0 / NULLIF(
        (SELECT SUM(current_value) FROM assets a2 WHERE a2.user_id = a1.user_id AND a2.is_active = TRUE), 0
    ), 2) as percentage
FROM assets a1
WHERE is_active = TRUE
GROUP BY user_id, type;
```

### 2. 数据库适配器

#### 统一接口定义
```typescript
// packages/data-access/src/database/adapter.ts
export interface DatabaseAdapter {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // 查询执行
  execute(sql: string, params?: any[]): Promise<any>;
  query(sql: string, params?: any[]): Promise<any[]>;
  
  // 事务支持
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>;
  
  // 迁移管理
  migrate(): Promise<void>;
  
  // 清理数据
  clearUserData(userId: string): Promise<void>;
}
```

#### SQLite实现 (packages/data-access/src/database/sqlite-adapter.ts)
```typescript
import Database from 'better-sqlite3';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;
  
  async connect(): Promise<void> {
    this.db = new Database('youqianme.db');
    this.db.pragma('foreign_keys = ON');
    await this.migrate();
  }
  
  async execute(sql: string, params?: any[]): Promise<any> {
    const stmt = this.db.prepare(sql);
    return stmt.run(params);
  }
  
  async query(sql: string, params?: any[]): Promise<any[]> {
    const stmt = this.db.prepare(sql);
    return stmt.all(params);
  }
}
```

#### Postgres实现 (packages/data-access/src/database/postgres-adapter.ts)
```typescript
import { Pool } from 'pg';

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;
  
  async connect(): Promise<void> {
    this.pool = new Pool({
      connectionString: process.env.POSTGRES_URL
    });
    await this.migrate();
  }
  
  async execute(sql: string, params?: any[]): Promise<any> {
    const result = await this.pool.query(sql, params);
    return result;
  }
  
  async query(sql: string, params?: any[]): Promise<any[]> {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}
```

## 📈 性能优化

### 1. 索引策略
```sql
-- 用户相关索引
CREATE INDEX idx_assets_user_active ON assets(user_id, is_active);
CREATE INDEX idx_liabilities_user_active ON liabilities(user_id, is_active);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);

-- 查询优化索引
CREATE INDEX idx_asset_values_asset_date ON asset_values(asset_id, date);
CREATE INDEX idx_payments_liability_date ON liability_payments(liability_id, payment_date);
```

### 2. 查询优化示例

#### 获取用户净资产
```sql
-- 优化后的净资产查询
SELECT 
    COALESCE(SUM(CASE WHEN a.is_active = TRUE THEN a.current_value ELSE 0 END), 0) as total_assets,
    COALESCE(SUM(CASE WHEN l.is_active = TRUE THEN l.current_balance ELSE 0 END), 0) as total_liabilities,
    COALESCE(SUM(CASE WHEN a.is_active = TRUE THEN a.current_value ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN l.is_active = TRUE THEN l.current_balance ELSE 0 END), 0) as net_worth
FROM users u
LEFT JOIN assets a ON u.id = a.user_id
LEFT JOIN liabilities l ON u.id = l.user_id
WHERE u.id = ?;
```

#### 获取资产趋势
```sql
-- 获取指定时间范围的资产价值趋势
SELECT 
    av.date,
    SUM(av.value) as total_value
FROM asset_values av
JOIN assets a ON av.asset_id = a.id
WHERE a.user_id = ? 
    AND a.is_active = TRUE
    AND av.date >= ? 
    AND av.date <= ?
GROUP BY av.date
ORDER BY av.date;
```

## 🔍 数据完整性

### 1. 约束规则
- **外键约束**：确保数据关联完整性
- **检查约束**：验证枚举值范围
- **唯一约束**：防止重复数据
- **非空约束**：确保必填字段

### 2. 级联操作
```sql
-- 用户删除时级联删除所有相关数据
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- 资产删除时保留交易记录但设置为NULL
FOREIGN KEY (from_asset_id) REFERENCES assets(id) ON DELETE SET NULL
```

## 🧪 测试数据

### 1. 演示数据脚本
```sql
-- 游客账户演示数据
INSERT INTO users (id, is_guest) VALUES ('guest_demo_001', TRUE);

-- 演示资产数据
INSERT INTO assets (user_id, name, type, current_value) VALUES
('guest_demo_001', '现金', 'cash', 50000.00),
('guest_demo_001', '支付宝余额', 'cash', 15000.00),
('guest_demo_001', '招商银行储蓄', 'savings', 200000.00),
('guest_demo_001', '腾讯股票', 'stocks', 100000.00),
('guest_demo_001', '自住房产', 'real_estate', 3000000.00);

-- 演示负债数据
INSERT INTO liabilities (user_id, name, type, current_balance, interest_rate) VALUES
('guest_demo_001', '房贷', 'mortgage', 1500000.00, 0.045),
('guest_demo_001', '信用卡', 'credit_card', 5000.00, 0.18);
```

## 🔐 安全考虑

### 1. 数据隔离
- **用户ID过滤**：所有查询必须包含user_id条件
- **权限验证**：API层验证用户身份
- **SQL注入防护**：使用参数化查询

### 2. 敏感数据处理
```typescript
// 敏感信息脱敏
export const maskSensitiveData = (data: any) => {
  if (data.account_number) {
    data.account_number = data.account_number.replace(/\d(?=\d{4})/g, '*');
  }
  return data;
};
```

## 📋 维护指南

### 1. 数据库迁移
```bash
# 创建新的迁移文件
npm run db:migrate:create --name=add_new_feature

# 执行迁移
npm run db:migrate:up

# 回滚迁移
npm run db:migrate:down
```

### 2. 数据备份
```bash
# SQLite备份
cp youqianme.db youqianme_backup_$(date +%Y%m%d_%H%M%S).db

# Postgres备份
pg_dump $POSTGRES_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. 性能监控
```sql
-- 查看慢查询
SELECT * FROM sqlite_master WHERE type='table';

-- 分析索引使用情况
EXPLAIN QUERY PLAN SELECT * FROM assets WHERE user_id = 'xxx';
```

## 🔗 相关文件

### 核心文件
- `packages/data-access/src/database/manager.ts` - 数据库管理器
- `packages/data-access/src/database/adapter.ts` - 数据库适配器接口
- `packages/data-access/src/repositories/` - 数据仓库实现
- `apps/web/lib/database.ts` - Web端数据库配置
- `apps/mobile/lib/db.ts` - 移动端数据库配置

### 初始化文件
- `packages/data-access/src/database/init.sql` - 数据库初始化脚本
- `packages/utils/src/mockData.ts` - 演示数据生成器

---

**文档维护**: 随着数据库演进，本文档将持续更新以反映最新设计状态。