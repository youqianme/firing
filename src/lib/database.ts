import * as sqlite3 from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'youqianme.db');
const dbVerbose = process.env.DB_VERBOSE === 'true';

// 数据库连接单例
let dbInstance: sqlite3.Database | null = null;

// 获取数据库连接
export function getDb(): sqlite3.Database {
  if (!dbInstance) {
    dbInstance = new sqlite3.default(dbPath, { verbose: dbVerbose ? console.log : undefined });
  }
  return dbInstance;
}

// 初始化数据库表结构
export function initDatabase() {
  const db = getDb();
  
  // 创建资产表
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL,
      amount REAL NOT NULL,
      includeInFire INTEGER NOT NULL DEFAULT 1,
      accountId TEXT,
      quantity REAL,
      unitPrice REAL,
      interestRate REAL,
      startDate TEXT,
      endDate TEXT,
      valuationMethod TEXT NOT NULL DEFAULT 'MANUAL',
      updatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      notes TEXT
    );
  `);

  // 创建负债表
  db.exec(`
    CREATE TABLE IF NOT EXISTS liabilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL,
      balance REAL NOT NULL,
      interestRate REAL,
      startDate TEXT,
      endDate TEXT,
      updatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      notes TEXT
    );
  `);

  // 创建还款记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      liabilityId TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (liabilityId) REFERENCES liabilities(id)
    );
  `);

  // 创建交易表
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      fromAssetId TEXT,
      toAssetId TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      fee REAL DEFAULT 0,
      date TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (fromAssetId) REFERENCES assets(id),
      FOREIGN KEY (toAssetId) REFERENCES assets(id)
    );
  `);

  // 创建账户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT,
      createdAt TEXT NOT NULL,
      notes TEXT
    );
  `);

  // 创建市场数据表
  db.exec(`
    CREATE TABLE IF NOT EXISTS marketData (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL UNIQUE,
      price REAL NOT NULL,
      updatedAt TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'MANUAL'
    );
  `);

  // 创建时间轴表
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      objectType TEXT NOT NULL,
      objectId TEXT NOT NULL,
      objectName TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      oldAmount REAL,
      delta REAL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // 创建 FIRE 配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS fireConfig (
      id TEXT PRIMARY KEY,
      annualExpense REAL NOT NULL,
      swr REAL NOT NULL DEFAULT 0.04,
      updatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // 创建用户设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS userSettings (
      id TEXT PRIMARY KEY,
      baseCurrency TEXT NOT NULL DEFAULT 'CNY',
      privacyMode INTEGER NOT NULL DEFAULT 0,
      updatedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // 添加索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
    CREATE INDEX IF NOT EXISTS idx_assets_accountId ON assets(accountId);
    CREATE INDEX IF NOT EXISTS idx_liabilities_type ON liabilities(type);
    CREATE INDEX IF NOT EXISTS idx_payments_liabilityId ON payments(liabilityId);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_activities_createdAt ON activities(createdAt);
    CREATE INDEX IF NOT EXISTS idx_activities_objectType ON activities(objectType);
  `);

  // 初始化默认设置
  const settings = db.prepare('SELECT * FROM userSettings LIMIT 1').get();
  if (!settings) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO userSettings (id, baseCurrency, privacyMode, updatedAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run('default', 'CNY', 0, now, now);
  }
}

// 关闭数据库连接
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// 生成唯一 ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 导出数据库连接（用于向后兼容）
export const db = getDb();
