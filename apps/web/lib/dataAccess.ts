import { dbManager } from './database';
import { generateId } from '@firing/utils';
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
} from '@firing/types';

// 获取数据库适配器
const getAdapter = () => dbManager.getAdapter();

// Helper to handle case-insensitive property access for Postgres compatibility
const getProp = (obj: any, key: string) => {
  if (!obj) return undefined;
  return obj[key] !== undefined ? obj[key] : obj[key.toLowerCase()];
};

// 资产相关操作
export const assetRepository = {
  // 获取所有资产
  getAll: async (userId: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE userId = ? ORDER BY updatedAt DESC', [userId]);
    return rows.map(row => ({
      ...row,
      includeInFire: getProp(row, 'includeInFire') === 1,
      accountId: getProp(row, 'accountId'),
      quantity: getProp(row, 'quantity'),
      unitPrice: getProp(row, 'unitPrice'),
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      valuationMethod: getProp(row, 'valuationMethod'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    })) as Asset[];
  },

  // 根据 ID 获取资产
  getById: async (userId: string, id: string): Promise<Asset | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM assets WHERE id = ? AND userId = ?', [id, userId]);
    if (!row) return undefined;
    return {
      ...row,
      includeInFire: getProp(row, 'includeInFire') === 1,
      accountId: getProp(row, 'accountId'),
      quantity: getProp(row, 'quantity'),
      unitPrice: getProp(row, 'unitPrice'),
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      valuationMethod: getProp(row, 'valuationMethod'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    } as Asset;
  },

  // 创建资产
  create: async (userId: string, asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newAsset = {
      ...asset,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO assets (id, userId, name, type, currency, amount, includeInFire, accountId, quantity, unitPrice, interestRate, startDate, endDate, valuationMethod, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newAsset.id, userId, newAsset.name, newAsset.type, newAsset.currency, newAsset.amount, newAsset.includeInFire ? 1 : 0, newAsset.accountId, newAsset.quantity, newAsset.unitPrice, newAsset.interestRate, newAsset.startDate, newAsset.endDate, newAsset.valuationMethod, newAsset.updatedAt, newAsset.createdAt, newAsset.notes]
    );

    return newAsset as unknown as Asset;
  },

  // 更新资产
  update: async (userId: string, id: string, asset: Partial<Asset>): Promise<Asset | undefined> => {
    const existing = await assetRepository.getById(userId, id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedAsset = {
      ...existing,
      ...asset,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE assets SET name = ?, type = ?, currency = ?, amount = ?, includeInFire = ?, accountId = ?, quantity = ?, unitPrice = ?, interestRate = ?, startDate = ?, endDate = ?, valuationMethod = ?, updatedAt = ?, notes = ? WHERE id = ? AND userId = ?`,
      [updatedAsset.name, updatedAsset.type, updatedAsset.currency, updatedAsset.amount, updatedAsset.includeInFire ? 1 : 0, updatedAsset.accountId, updatedAsset.quantity, updatedAsset.unitPrice, updatedAsset.interestRate, updatedAsset.startDate, updatedAsset.endDate, updatedAsset.valuationMethod, updatedAsset.updatedAt, updatedAsset.notes, id, userId]
    );

    return updatedAsset;
  },

  // 删除资产
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM assets WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  },

  // 根据类型获取资产
  getByType: async (userId: string, type: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE type = ? AND userId = ? ORDER BY updatedAt DESC', [type, userId]);
    return rows.map(row => ({
      ...row,
      includeInFire: getProp(row, 'includeInFire') === 1,
      accountId: getProp(row, 'accountId'),
      quantity: getProp(row, 'quantity'),
      unitPrice: getProp(row, 'unitPrice'),
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      valuationMethod: getProp(row, 'valuationMethod'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    })) as Asset[];
  },

  // 根据账户获取资产
  getByAccountId: async (userId: string, accountId: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE accountId = ? AND userId = ? ORDER BY updatedAt DESC', [accountId, userId]);
    return rows.map(row => ({
      ...row,
      includeInFire: getProp(row, 'includeInFire') === 1,
      accountId: getProp(row, 'accountId'),
      quantity: getProp(row, 'quantity'),
      unitPrice: getProp(row, 'unitPrice'),
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      valuationMethod: getProp(row, 'valuationMethod'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    })) as Asset[];
  }
};

// 负债相关操作
export const liabilityRepository = {
  // 获取所有负债
  getAll: async (userId: string): Promise<Liability[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM liabilities WHERE userId = ? ORDER BY updatedAt DESC', [userId]);
    return rows.map(row => ({
      ...row,
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    })) as Liability[];
  },

  // 根据 ID 获取负债
  getById: async (userId: string, id: string): Promise<Liability | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM liabilities WHERE id = ? AND userId = ?', [id, userId]);
    if (!row) return undefined;
    return {
      ...row,
      interestRate: getProp(row, 'interestRate'),
      startDate: getProp(row, 'startDate'),
      endDate: getProp(row, 'endDate'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt'),
      notes: getProp(row, 'notes')
    } as Liability;
  },

  // 创建负债
  create: async (userId: string, liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Liability> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newLiability = {
      ...liability,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO liabilities (id, userId, name, type, currency, balance, interestRate, startDate, endDate, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLiability.id, userId, newLiability.name, newLiability.type, newLiability.currency, newLiability.balance, newLiability.interestRate, newLiability.startDate, newLiability.endDate, newLiability.updatedAt, newLiability.createdAt, newLiability.notes]
    );

    return newLiability as unknown as Liability;
  },

  // 更新负债
  update: async (userId: string, id: string, liability: Partial<Liability>): Promise<Liability | undefined> => {
    const existing = await liabilityRepository.getById(userId, id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedLiability = {
      ...existing,
      ...liability,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE liabilities SET name = ?, type = ?, currency = ?, balance = ?, interestRate = ?, startDate = ?, endDate = ?, updatedAt = ?, notes = ? WHERE id = ? AND userId = ?`,
      [updatedLiability.name, updatedLiability.type, updatedLiability.currency, updatedLiability.balance, updatedLiability.interestRate, updatedLiability.startDate, updatedLiability.endDate, updatedLiability.updatedAt, updatedLiability.notes, id, userId]
    );

    return updatedLiability;
  },

  // 删除负债
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM liabilities WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }
};

// 还款记录相关操作
export const paymentRepository = {
  // 获取所有还款记录
  getAll: async (userId: string): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments WHERE userId = ? ORDER BY date DESC', [userId]);
    return rows.map(row => ({
      ...row,
      liabilityId: getProp(row, 'liabilityId'),
      createdAt: getProp(row, 'createdAt')
    })) as Payment[];
  },

  // 根据负债 ID 获取还款记录
  getByLiabilityId: async (userId: string, liabilityId: string): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments WHERE liabilityId = ? AND userId = ? ORDER BY date DESC', [liabilityId, userId]);
    return rows.map(row => ({
      ...row,
      liabilityId: getProp(row, 'liabilityId'),
      createdAt: getProp(row, 'createdAt')
    })) as Payment[];
  },

  // 创建还款记录
  create: async (userId: string, payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newPayment = {
      ...payment,
      id,
      userId,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO payments (id, userId, liabilityId, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newPayment.id, userId, newPayment.liabilityId, newPayment.amount, newPayment.date, newPayment.notes, newPayment.createdAt]
    );

    return newPayment as unknown as Payment;
  },

  // 删除还款记录
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM payments WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }
};

// 交易相关操作
export const transactionRepository = {
  // 获取所有交易
  getAll: async (userId: string): Promise<Transaction[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]);
    return rows.map(row => ({
      ...row,
      fromAssetId: getProp(row, 'fromAssetId'),
      toAssetId: getProp(row, 'toAssetId'),
      createdAt: getProp(row, 'createdAt')
    })) as Transaction[];
  },

  // 根据 ID 获取交易
  getById: async (userId: string, id: string): Promise<Transaction | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM transactions WHERE id = ? AND userId = ?', [id, userId]);
    if (!row) return undefined;
    return {
      ...row,
      fromAssetId: getProp(row, 'fromAssetId'),
      toAssetId: getProp(row, 'toAssetId'),
      createdAt: getProp(row, 'createdAt')
    } as Transaction;
  },

  // 创建交易
  create: async (userId: string, transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      id,
      userId,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO transactions (id, userId, type, fromAssetId, toAssetId, amount, currency, fee, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTransaction.id, userId, newTransaction.type, newTransaction.fromAssetId, newTransaction.toAssetId, newTransaction.amount, newTransaction.currency, newTransaction.fee || 0, newTransaction.date, newTransaction.notes, newTransaction.createdAt]
    );

    return newTransaction as unknown as Transaction;
  },

  // 删除交易
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }
};

// 账户相关操作
export const accountRepository = {
  // 获取所有账户
  getAll: async (userId: string): Promise<Account[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM accounts WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return rows.map(row => ({
      ...row,
      createdAt: getProp(row, 'createdAt')
    })) as Account[];
  },

  // 根据 ID 获取账户
  getById: async (userId: string, id: string): Promise<Account | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM accounts WHERE id = ? AND userId = ?', [id, userId]);
    if (!row) return undefined;
    return {
      ...row,
      createdAt: getProp(row, 'createdAt')
    } as Account;
  },

  // 创建账户
  create: async (userId: string, account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newAccount = {
      ...account,
      id,
      userId,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO accounts (id, userId, name, type, currency, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newAccount.id, userId, newAccount.name, newAccount.type, newAccount.currency, newAccount.createdAt, newAccount.notes]
    );

    return newAccount as unknown as Account;
  },

  // 更新账户
  update: async (userId: string, id: string, account: Partial<Account>): Promise<Account | undefined> => {
    const existing = await accountRepository.getById(userId, id);
    if (!existing) return undefined;

    const updatedAccount = {
      ...existing,
      ...account
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE accounts SET name = ?, type = ?, currency = ?, notes = ? WHERE id = ? AND userId = ?`,
      [updatedAccount.name, updatedAccount.type, updatedAccount.currency, updatedAccount.notes, id, userId]
    );

    return updatedAccount;
  },

  // 删除账户
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM accounts WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }
};

// 市场数据相关操作
export const marketDataRepository = {
  // 获取所有市场数据
  getAll: async (): Promise<MarketData[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM marketData ORDER BY symbol', []);
    return rows.map(row => ({
      ...row,
      updatedAt: getProp(row, 'updatedAt')
    })) as MarketData[];
  },

  // 根据符号获取市场数据
  getBySymbol: async (symbol: string): Promise<MarketData | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM marketData WHERE symbol = ?', [symbol]);
    if (!row) return undefined;
    return {
      ...row,
      updatedAt: getProp(row, 'updatedAt')
    } as MarketData;
  },

  // 创建或更新市场数据
  upsert: async (symbol: string, price: number, source: 'MANUAL' | 'AUTO' = 'MANUAL'): Promise<MarketData> => {
    const existing = await marketDataRepository.getBySymbol(symbol);
    const now = new Date().toISOString();
    const adapter = getAdapter();

    if (existing) {
      await adapter.run(
        `UPDATE marketData SET price = ?, updatedAt = ?, source = ? WHERE symbol = ?`,
        [price, now, source, symbol]
      );

      return {
        ...existing,
        price,
        updatedAt: now,
        source
      };
    } else {
      const id = generateId().toString();
      const newMarketData = {
        id,
        symbol,
        price,
        updatedAt: now,
        source
      };

      await adapter.run(
        `INSERT INTO marketData (id, symbol, price, updatedAt, source) VALUES (?, ?, ?, ?, ?)`,
        [newMarketData.id, newMarketData.symbol, newMarketData.price, newMarketData.updatedAt, newMarketData.source]
      );

      return newMarketData as unknown as MarketData;
    }
  }
};

// 时间轴相关操作
export const activityRepository = {
  // 获取所有活动
  getAll: async (userId: string, limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
    return rows.map(row => ({
      ...row,
      objectType: getProp(row, 'objectType'),
      objectId: getProp(row, 'objectId'),
      objectName: getProp(row, 'objectName'),
      oldAmount: getProp(row, 'oldAmount'),
      createdAt: getProp(row, 'createdAt')
    })) as Activity[];
  },

  // 根据对象类型获取活动
  getByObjectType: async (userId: string, objectType: string, limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities WHERE objectType = ? AND userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [objectType, userId, limit, offset]);
    return rows.map(row => ({
      ...row,
      objectType: getProp(row, 'objectType'),
      objectId: getProp(row, 'objectId'),
      objectName: getProp(row, 'objectName'),
      oldAmount: getProp(row, 'oldAmount'),
      createdAt: getProp(row, 'createdAt')
    })) as Activity[];
  },

  // 创建活动
  create: async (userId: string, activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newActivity = {
      ...activity,
      id,
      userId,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO activities (id, userId, action, objectType, objectId, objectName, amount, currency, oldAmount, delta, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newActivity.id, userId, newActivity.action, newActivity.objectType, newActivity.objectId, newActivity.objectName, newActivity.amount, newActivity.currency, newActivity.oldAmount, newActivity.delta, newActivity.notes, newActivity.createdAt]
    );

    return newActivity as unknown as Activity;
  }
};

// FIRE 配置相关操作
export const fireConfigRepository = {
  // 获取 FIRE 配置
  get: async (userId: string): Promise<FireConfig> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM fireConfig WHERE id = ? ORDER BY updatedAt DESC LIMIT 1', [userId]);
    if (!row) {
      return {
        id: userId,
        annualExpense: 120000,
        swr: 0.04,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }
    return {
      ...row,
      annualExpense: getProp(row, 'annualExpense'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt')
    } as FireConfig;
  },

  // 创建或更新 FIRE 配置
  upsert: async (userId: string, config: Omit<FireConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FireConfig> => {
    const existing = await fireConfigRepository.get(userId);
    const now = new Date().toISOString();
    const adapter = getAdapter();

    if (existing) {
      await adapter.run(
        `UPDATE fireConfig SET annualExpense = ?, swr = ?, updatedAt = ? WHERE id = ?`,
        [config.annualExpense, config.swr, now, userId]
      );

      return {
        ...existing,
        annualExpense: config.annualExpense,
        swr: config.swr,
        updatedAt: now
      };
    } else {
      const newConfig = {
        ...config,
        id: userId,
        createdAt: now,
        updatedAt: now
      };

      await adapter.run(
        `INSERT INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [newConfig.id, newConfig.annualExpense, newConfig.swr, newConfig.updatedAt, newConfig.createdAt]
      );

      return newConfig;
    }
  }
};

// 用户设置相关操作
export const userSettingsRepository = {
  // 获取用户设置
  get: async (userId: string): Promise<UserSettings> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM userSettings WHERE id = ? LIMIT 1', [userId]);
    if (!row) {
      return {
        id: userId,
        baseCurrency: 'CNY',
        privacyMode: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }
    return {
      id: row.id,
      baseCurrency: getProp(row, 'baseCurrency') || 'CNY',
      privacyMode: getProp(row, 'privacyMode') === 1,
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt')
    } as UserSettings;
  },

  // 更新用户设置
  update: async (userId: string, settings: Partial<UserSettings>): Promise<UserSettings> => {
    const adapter = getAdapter();
    const existingRow = await adapter.get('SELECT * FROM userSettings WHERE id = ?', [userId]);
    const now = new Date().toISOString();

    if (existingRow) {
      const updatedSettings = {
        ...existingRow,
        ...settings,
        baseCurrency: getProp(existingRow, 'baseCurrency') || 'CNY',
        privacyMode: getProp(existingRow, 'privacyMode') === 1,
        createdAt: getProp(existingRow, 'createdAt'),
        updatedAt: now
      };

      await adapter.run(
        `UPDATE userSettings SET baseCurrency = ?, privacyMode = ?, updatedAt = ? WHERE id = ?`,
        [updatedSettings.baseCurrency, updatedSettings.privacyMode ? 1 : 0, updatedSettings.updatedAt, userId]
      );
      
      return updatedSettings;
    } else {
      const defaultSettings = {
        id: userId,
        baseCurrency: 'CNY',
        privacyMode: false,
        createdAt: now,
        updatedAt: now
      };
      
      const newSettings = {
        ...defaultSettings,
        ...settings
      };

      await adapter.run(
        `INSERT INTO userSettings (id, baseCurrency, privacyMode, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [newSettings.id, newSettings.baseCurrency, newSettings.privacyMode ? 1 : 0, newSettings.updatedAt, newSettings.createdAt]
      );
      
      return newSettings;
    }
  }
};
