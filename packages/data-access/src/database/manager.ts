import { DatabaseAdapter } from './adapter';

/**
 * 数据库管理器，负责初始化数据库和管理数据库连接
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private adapter: DatabaseAdapter;
  private isInitialized: boolean = false;

  private constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  /**
   * 获取数据库管理器实例
   * @param adapter 数据库适配器
   * @returns 数据库管理器实例
   */
  public static getInstance(adapter: DatabaseAdapter): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(adapter);
    }
    return DatabaseManager.instance;
  }

  /**
   * 初始化数据库
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
      await this.adapter.beginTransaction();

      // 创建资产表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
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
        )
      `);

      // 创建负债表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS liabilities (
          id TEXT PRIMARY KEY,
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
        )
      `);

      // 创建还款记录表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          liabilityId TEXT NOT NULL,
          amount DOUBLE PRECISION NOT NULL,
          date TEXT NOT NULL,
          notes TEXT,
          createdAt TEXT NOT NULL,
          FOREIGN KEY (liabilityId) REFERENCES liabilities (id) ON DELETE CASCADE
        )
      `);

      // 创建交易表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
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
        )
      `);

      // 创建账户表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS accounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          currency TEXT,
          createdAt TEXT NOT NULL,
          notes TEXT
        )
      `);

      // 创建市场数据表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS marketData (
          id TEXT PRIMARY KEY,
          symbol TEXT NOT NULL UNIQUE,
          price DOUBLE PRECISION NOT NULL,
          updatedAt TEXT NOT NULL,
          source TEXT NOT NULL
        )
      `);

      // 创建活动表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY,
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
        )
      `);

      // 创建FIRE配置表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS fireConfig (
          id TEXT PRIMARY KEY,
          annualExpense DOUBLE PRECISION NOT NULL DEFAULT 0,
          swr DOUBLE PRECISION NOT NULL DEFAULT 4,
          updatedAt TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);

      // 创建用户设置表
      await this.adapter.run(`
        CREATE TABLE IF NOT EXISTS userSettings (
          id TEXT PRIMARY KEY,
          baseCurrency TEXT NOT NULL DEFAULT 'CNY',
          privacyMode INTEGER NOT NULL DEFAULT 0,
          updatedAt TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);

      // 检查并插入默认FIRE配置
      const fireConfigCount = await this.adapter.get('SELECT COUNT(*) as count FROM fireConfig');
      if (fireConfigCount && Number(fireConfigCount.count) === 0) {
        const now = new Date().toISOString();
        await this.adapter.run(
          'INSERT INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)',
          ['default', 0, 4, now, now]
        );
      }

      // 检查并插入默认用户设置
      const settingsCount = await this.adapter.get('SELECT COUNT(*) as count FROM userSettings');
      if (settingsCount && Number(settingsCount.count) === 0) {
        const now = new Date().toISOString();
        await this.adapter.run(
          'INSERT INTO userSettings (id, baseCurrency, privacyMode, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)',
          ['default', 'CNY', 0, now, now]
        );
      }

      await this.adapter.commit();
      this.isInitialized = true;
    } catch (error) {
      await this.adapter.rollback();
      throw error;
    } finally {
      this.initializationPromise = null;
    }
    })();

    return this.initializationPromise;
  }

  /**
   * 获取数据库适配器
   * @returns 数据库适配器
   */
  public getAdapter(): DatabaseAdapter {
    return this.adapter;
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    await this.adapter.close();
  }
}