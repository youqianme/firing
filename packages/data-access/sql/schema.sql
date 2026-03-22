-- 资产表
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sub_type TEXT,
  currency TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  include_in_fire INTEGER NOT NULL DEFAULT 1,
  account_id TEXT,
  quantity DOUBLE PRECISION,
  unit_price DOUBLE PRECISION,
  interest_rate DOUBLE PRECISION,
  start_date TEXT,
  end_date TEXT,
  valuation_method TEXT NOT NULL DEFAULT 'cost',
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  notes TEXT
);

-- 负债表
CREATE TABLE IF NOT EXISTS liabilities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL,
  balance DOUBLE PRECISION NOT NULL,
  interest_rate DOUBLE PRECISION,
  start_date TEXT,
  end_date TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  notes TEXT
);

-- 还款记录表
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  liability_id TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (liability_id) REFERENCES liabilities (id) ON DELETE CASCADE
);

-- 交易表
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  type TEXT NOT NULL,
  from_asset_id TEXT,
  to_asset_id TEXT,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  fee DOUBLE PRECISION,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (from_asset_id) REFERENCES assets (id) ON DELETE SET NULL,
  FOREIGN KEY (to_asset_id) REFERENCES assets (id) ON DELETE SET NULL
);

-- 账户表
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT,
  created_at TEXT NOT NULL,
  notes TEXT
);

-- 市场数据表
CREATE TABLE IF NOT EXISTS market_data (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  price DOUBLE PRECISION NOT NULL,
  updated_at TEXT NOT NULL,
  source TEXT NOT NULL
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  object_name TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL,
  old_amount DOUBLE PRECISION,
  delta DOUBLE PRECISION,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- FIRE成员表（支持家庭多成员）
CREATE TABLE IF NOT EXISTS fire_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,                        -- 成员姓名
  gender TEXT NOT NULL DEFAULT 'male',       -- 性别：male/female
  birth_date TEXT NOT NULL,                  -- 出生日期
  retirement_age INTEGER NOT NULL DEFAULT 60, -- 退休年龄（根据性别自动估算，但可手动修改）
  monthly_expense DOUBLE PRECISION NOT NULL DEFAULT 0,  -- 每月支出
  target_retirement_asset DOUBLE PRECISION NOT NULL DEFAULT 0,  -- 退休时目标资产
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  base_currency TEXT NOT NULL DEFAULT 'CNY',
  privacy_mode INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 用户账户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 初始数据
INSERT INTO user_settings (id, base_currency, privacy_mode, updated_at, created_at)
VALUES ('default', 'CNY', 0, datetime('now'), datetime('now'))
ON CONFLICT (id) DO NOTHING;
