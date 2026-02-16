import { db, generateId } from './database';
import {
  Asset,
  Liability,
  Payment,
  Transaction,
  Account,
  MarketData,
  Activity,
  FireConfig,
  UserSettings
} from '../types/index';

// 资产相关操作
export const assetRepository = {
  // 获取所有资产
  getAll: (): Asset[] => {
    return db.prepare('SELECT * FROM assets ORDER BY updatedAt DESC').all() as Asset[];
  },

  // 根据 ID 获取资产
  getById: (id: string): Asset | undefined => {
    return db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as Asset | undefined;
  },

  // 创建资产
  create: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset => {
    const id = generateId();
    const now = new Date().toISOString();
    const newAsset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now
    };

    db.prepare(`
      INSERT INTO assets (
        id, name, type, currency, amount, includeInFire, accountId, quantity, unitPrice,
        interestRate, startDate, endDate, valuationMethod, updatedAt, createdAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newAsset.id, newAsset.name, newAsset.type, newAsset.currency, newAsset.amount,
      newAsset.includeInFire ? 1 : 0, newAsset.accountId, newAsset.quantity,
      newAsset.unitPrice, newAsset.interestRate, newAsset.startDate,
      newAsset.endDate, newAsset.valuationMethod, newAsset.updatedAt,
      newAsset.createdAt, newAsset.notes
    );

    return newAsset;
  },

  // 更新资产
  update: (id: string, asset: Partial<Asset>): Asset | undefined => {
    const existing = assetRepository.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedAsset = {
      ...existing,
      ...asset,
      updatedAt: now
    };

    db.prepare(`
      UPDATE assets SET
        name = ?, type = ?, currency = ?, amount = ?, includeInFire = ?,
        accountId = ?, quantity = ?, unitPrice = ?, interestRate = ?,
        startDate = ?, endDate = ?, valuationMethod = ?, updatedAt = ?, notes = ?
      WHERE id = ?
    `).run(
      updatedAsset.name, updatedAsset.type, updatedAsset.currency, updatedAsset.amount,
      updatedAsset.includeInFire ? 1 : 0, updatedAsset.accountId, updatedAsset.quantity,
      updatedAsset.unitPrice, updatedAsset.interestRate, updatedAsset.startDate,
      updatedAsset.endDate, updatedAsset.valuationMethod, updatedAsset.updatedAt,
      updatedAsset.notes, id
    );

    return updatedAsset;
  },

  // 删除资产
  delete: (id: string): boolean => {
    const result = db.prepare('DELETE FROM assets WHERE id = ?').run(id);
    return result.changes > 0;
  },

  // 根据类型获取资产
  getByType: (type: string): Asset[] => {
    return db.prepare('SELECT * FROM assets WHERE type = ? ORDER BY updatedAt DESC').all(type) as Asset[];
  },

  // 根据账户获取资产
  getByAccountId: (accountId: string): Asset[] => {
    return db.prepare('SELECT * FROM assets WHERE accountId = ? ORDER BY updatedAt DESC').all(accountId) as Asset[];
  }
};

// 负债相关操作
export const liabilityRepository = {
  // 获取所有负债
  getAll: (): Liability[] => {
    return db.prepare('SELECT * FROM liabilities ORDER BY updatedAt DESC').all() as Liability[];
  },

  // 根据 ID 获取负债
  getById: (id: string): Liability | undefined => {
    return db.prepare('SELECT * FROM liabilities WHERE id = ?').get(id) as Liability | undefined;
  },

  // 创建负债
  create: (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Liability => {
    const id = generateId();
    const now = new Date().toISOString();
    const newLiability = {
      ...liability,
      id,
      createdAt: now,
      updatedAt: now
    };

    db.prepare(`
      INSERT INTO liabilities (
        id, name, type, currency, balance, interestRate, startDate, endDate,
        updatedAt, createdAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newLiability.id, newLiability.name, newLiability.type, newLiability.currency,
      newLiability.balance, newLiability.interestRate, newLiability.startDate,
      newLiability.endDate, newLiability.updatedAt, newLiability.createdAt,
      newLiability.notes
    );

    return newLiability;
  },

  // 更新负债
  update: (id: string, liability: Partial<Liability>): Liability | undefined => {
    const existing = liabilityRepository.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedLiability = {
      ...existing,
      ...liability,
      updatedAt: now
    };

    db.prepare(`
      UPDATE liabilities SET
        name = ?, type = ?, currency = ?, balance = ?, interestRate = ?,
        startDate = ?, endDate = ?, updatedAt = ?, notes = ?
      WHERE id = ?
    `).run(
      updatedLiability.name, updatedLiability.type, updatedLiability.currency,
      updatedLiability.balance, updatedLiability.interestRate, updatedLiability.startDate,
      updatedLiability.endDate, updatedLiability.updatedAt, updatedLiability.notes, id
    );

    return updatedLiability;
  },

  // 删除负债
  delete: (id: string): boolean => {
    const result = db.prepare('DELETE FROM liabilities WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

// 还款记录相关操作
export const paymentRepository = {
  // 获取所有还款记录
  getAll: (): Payment[] => {
    return db.prepare('SELECT * FROM payments ORDER BY date DESC').all() as Payment[];
  },

  // 根据负债 ID 获取还款记录
  getByLiabilityId: (liabilityId: string): Payment[] => {
    return db.prepare('SELECT * FROM payments WHERE liabilityId = ? ORDER BY date DESC').all(liabilityId) as Payment[];
  },

  // 创建还款记录
  create: (payment: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const id = generateId();
    const now = new Date().toISOString();
    const newPayment = {
      ...payment,
      id,
      createdAt: now
    };

    db.prepare(`
      INSERT INTO payments (id, liabilityId, amount, date, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      newPayment.id, newPayment.liabilityId, newPayment.amount,
      newPayment.date, newPayment.notes, newPayment.createdAt
    );

    return newPayment;
  },

  // 删除还款记录
  delete: (id: string): boolean => {
    const result = db.prepare('DELETE FROM payments WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

// 交易相关操作
export const transactionRepository = {
  // 获取所有交易
  getAll: (): Transaction[] => {
    return db.prepare('SELECT * FROM transactions ORDER BY date DESC').all() as Transaction[];
  },

  // 根据 ID 获取交易
  getById: (id: string): Transaction | undefined => {
    return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as Transaction | undefined;
  },

  // 创建交易
  create: (transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const id = generateId();
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      id,
      createdAt: now
    };

    db.prepare(`
      INSERT INTO transactions (
        id, type, fromAssetId, toAssetId, amount, currency, fee, date, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newTransaction.id, newTransaction.type, newTransaction.fromAssetId,
      newTransaction.toAssetId, newTransaction.amount, newTransaction.currency,
      newTransaction.fee || 0, newTransaction.date, newTransaction.notes,
      newTransaction.createdAt
    );

    return newTransaction;
  },

  // 删除交易
  delete: (id: string): boolean => {
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

// 账户相关操作
export const accountRepository = {
  // 获取所有账户
  getAll: (): Account[] => {
    return db.prepare('SELECT * FROM accounts ORDER BY createdAt DESC').all() as Account[];
  },

  // 根据 ID 获取账户
  getById: (id: string): Account | undefined => {
    return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account | undefined;
  },

  // 创建账户
  create: (account: Omit<Account, 'id' | 'createdAt'>): Account => {
    const id = generateId();
    const now = new Date().toISOString();
    const newAccount = {
      ...account,
      id,
      createdAt: now
    };

    db.prepare(`
      INSERT INTO accounts (id, name, type, currency, createdAt, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      newAccount.id, newAccount.name, newAccount.type, newAccount.currency,
      newAccount.createdAt, newAccount.notes
    );

    return newAccount;
  },

  // 更新账户
  update: (id: string, account: Partial<Account>): Account | undefined => {
    const existing = accountRepository.getById(id);
    if (!existing) return undefined;

    const updatedAccount = {
      ...existing,
      ...account
    };

    db.prepare(`
      UPDATE accounts SET name = ?, type = ?, currency = ?, notes = ?
      WHERE id = ?
    `).run(
      updatedAccount.name, updatedAccount.type, updatedAccount.currency,
      updatedAccount.notes, id
    );

    return updatedAccount;
  },

  // 删除账户
  delete: (id: string): boolean => {
    const result = db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

// 市场数据相关操作
export const marketDataRepository = {
  // 获取所有市场数据
  getAll: (): MarketData[] => {
    return db.prepare('SELECT * FROM marketData ORDER BY symbol').all() as MarketData[];
  },

  // 根据符号获取市场数据
  getBySymbol: (symbol: string): MarketData | undefined => {
    return db.prepare('SELECT * FROM marketData WHERE symbol = ?').get(symbol) as MarketData | undefined;
  },

  // 创建或更新市场数据
  upsert: (symbol: string, price: number, source: 'MANUAL' | 'AUTO' = 'MANUAL'): MarketData => {
    const existing = marketDataRepository.getBySymbol(symbol);
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE marketData SET price = ?, updatedAt = ?, source = ?
        WHERE symbol = ?
      `).run(price, now, source, symbol);

      return {
        ...existing,
        price,
        updatedAt: now,
        source
      };
    } else {
      const id = generateId();
      const newMarketData = {
        id,
        symbol,
        price,
        updatedAt: now,
        source
      };

      db.prepare(`
        INSERT INTO marketData (id, symbol, price, updatedAt, source)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        newMarketData.id, newMarketData.symbol, newMarketData.price,
        newMarketData.updatedAt, newMarketData.source
      );

      return newMarketData;
    }
  }
};

// 时间轴相关操作
export const activityRepository = {
  // 获取所有活动
  getAll: (limit: number = 50, offset: number = 0): Activity[] => {
    return db.prepare('SELECT * FROM activities ORDER BY createdAt DESC LIMIT ? OFFSET ?')
      .all(limit, offset) as Activity[];
  },

  // 根据对象类型获取活动
  getByObjectType: (objectType: string, limit: number = 50, offset: number = 0): Activity[] => {
    return db.prepare('SELECT * FROM activities WHERE objectType = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?')
      .all(objectType, limit, offset) as Activity[];
  },

  // 创建活动
  create: (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const id = generateId();
    const now = new Date().toISOString();
    const newActivity = {
      ...activity,
      id,
      createdAt: now
    };

    db.prepare(`
      INSERT INTO activities (
        id, action, objectType, objectId, objectName, amount, currency,
        oldAmount, delta, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newActivity.id, newActivity.action, newActivity.objectType,
      newActivity.objectId, newActivity.objectName, newActivity.amount,
      newActivity.currency, newActivity.oldAmount, newActivity.delta,
      newActivity.notes, newActivity.createdAt
    );

    return newActivity;
  }
};

// FIRE 配置相关操作
export const fireConfigRepository = {
  // 获取 FIRE 配置
  get: (): FireConfig | undefined => {
    return db.prepare('SELECT * FROM fireConfig ORDER BY updatedAt DESC LIMIT 1').get() as FireConfig | undefined;
  },

  // 创建或更新 FIRE 配置
  upsert: (config: Omit<FireConfig, 'id' | 'createdAt' | 'updatedAt'>): FireConfig => {
    const existing = fireConfigRepository.get();
    const now = new Date().toISOString();

    if (existing) {
      db.prepare(`
        UPDATE fireConfig SET annualExpense = ?, swr = ?, updatedAt = ?
        WHERE id = ?
      `).run(config.annualExpense, config.swr, now, existing.id);

      return {
        ...existing,
        annualExpense: config.annualExpense,
        swr: config.swr,
        updatedAt: now
      };
    } else {
      const id = generateId();
      const newConfig = {
        ...config,
        id,
        createdAt: now,
        updatedAt: now
      };

      db.prepare(`
        INSERT INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        newConfig.id, newConfig.annualExpense, newConfig.swr,
        newConfig.updatedAt, newConfig.createdAt
      );

      return newConfig;
    }
  }
};

// 用户设置相关操作
export const userSettingsRepository = {
  // 获取用户设置
  get: (): UserSettings => {
    return db.prepare('SELECT * FROM userSettings LIMIT 1').get() as UserSettings;
  },

  // 更新用户设置
  update: (settings: Partial<UserSettings>): UserSettings => {
    const existing = userSettingsRepository.get();
    const now = new Date().toISOString();

    const updatedSettings = {
      ...existing,
      ...settings,
      updatedAt: now
    };

    db.prepare(`
      UPDATE userSettings SET baseCurrency = ?, privacyMode = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      updatedSettings.baseCurrency, updatedSettings.privacyMode ? 1 : 0,
      updatedSettings.updatedAt, updatedSettings.id
    );

    return updatedSettings;
  }
};
