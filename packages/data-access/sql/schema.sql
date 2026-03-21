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
