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
  getAll: async (): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets ORDER BY updatedAt DESC');
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
  getById: async (id: string): Promise<Asset | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM assets WHERE id = ?', [id]);
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
  create: async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newAsset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO assets (id, name, type, currency, amount, includeInFire, accountId, quantity, unitPrice, interestRate, startDate, endDate, valuationMethod, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newAsset.id, newAsset.name, newAsset.type, newAsset.currency, newAsset.amount, newAsset.includeInFire ? 1 : 0, newAsset.accountId, newAsset.quantity, newAsset.unitPrice, newAsset.interestRate, newAsset.startDate, newAsset.endDate, newAsset.valuationMethod, newAsset.updatedAt, newAsset.createdAt, newAsset.notes]
    );

    return newAsset;
  },

  // 更新资产
  update: async (id: string, asset: Partial<Asset>): Promise<Asset | undefined> => {
    const existing = await assetRepository.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedAsset = {
      ...existing,
      ...asset,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE assets SET name = ?, type = ?, currency = ?, amount = ?, includeInFire = ?, accountId = ?, quantity = ?, unitPrice = ?, interestRate = ?, startDate = ?, endDate = ?, valuationMethod = ?, updatedAt = ?, notes = ? WHERE id = ?`,
      [updatedAsset.name, updatedAsset.type, updatedAsset.currency, updatedAsset.amount, updatedAsset.includeInFire ? 1 : 0, updatedAsset.accountId, updatedAsset.quantity, updatedAsset.unitPrice, updatedAsset.interestRate, updatedAsset.startDate, updatedAsset.endDate, updatedAsset.valuationMethod, updatedAsset.updatedAt, updatedAsset.notes, id]
    );

    return updatedAsset;
  },

  // 删除资产
  delete: async (id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM assets WHERE id = ?', [id]);
    return true;
  },

  // 根据类型获取资产
  getByType: async (type: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE type = ? ORDER BY updatedAt DESC', [type]);
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
  getByAccountId: async (accountId: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE accountId = ? ORDER BY updatedAt DESC', [accountId]);
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
  getAll: async (): Promise<Liability[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM liabilities ORDER BY updatedAt DESC');
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
  getById: async (id: string): Promise<Liability | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM liabilities WHERE id = ?', [id]);
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
  create: async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Liability> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newLiability = {
      ...liability,
      id,
      createdAt: now,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO liabilities (id, name, type, currency, balance, interestRate, startDate, endDate, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newLiability.id, newLiability.name, newLiability.type, newLiability.currency, newLiability.balance, newLiability.interestRate, newLiability.startDate, newLiability.endDate, newLiability.updatedAt, newLiability.createdAt, newLiability.notes]
    );

    return newLiability;
  },

  // 更新负债
  update: async (id: string, liability: Partial<Liability>): Promise<Liability | undefined> => {
    const existing = await liabilityRepository.getById(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedLiability = {
      ...existing,
      ...liability,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE liabilities SET name = ?, type = ?, currency = ?, balance = ?, interestRate = ?, startDate = ?, endDate = ?, updatedAt = ?, notes = ? WHERE id = ?`,
      [updatedLiability.name, updatedLiability.type, updatedLiability.currency, updatedLiability.balance, updatedLiability.interestRate, updatedLiability.startDate, updatedLiability.endDate, updatedLiability.updatedAt, updatedLiability.notes, id]
    );

    return updatedLiability;
  },

  // 删除负债
  delete: async (id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM liabilities WHERE id = ?', [id]);
    return true;
  }
};

// 还款记录相关操作
export const paymentRepository = {
  // 获取所有还款记录
  getAll: async (): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments ORDER BY date DESC');
    return rows.map(row => ({
      ...row,
      liabilityId: getProp(row, 'liabilityId'),
      createdAt: getProp(row, 'createdAt')
    })) as Payment[];
  },

  // 根据负债 ID 获取还款记录
  getByLiabilityId: async (liabilityId: string): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments WHERE liabilityId = ? ORDER BY date DESC', [liabilityId]);
    return rows.map(row => ({
      ...row,
      liabilityId: getProp(row, 'liabilityId'),
      createdAt: getProp(row, 'createdAt')
    })) as Payment[];
  },

  // 创建还款记录
  create: async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newPayment = {
      ...payment,
      id,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO payments (id, liabilityId, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [newPayment.id, newPayment.liabilityId, newPayment.amount, newPayment.date, newPayment.notes, newPayment.createdAt]
    );

    return newPayment;
  },

  // 删除还款记录
  delete: async (id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM payments WHERE id = ?', [id]);
    return true;
  }
};

// 交易相关操作
export const transactionRepository = {
  // 获取所有交易
  getAll: async (): Promise<Transaction[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM transactions ORDER BY date DESC');
    return rows.map(row => ({
      ...row,
      fromAssetId: getProp(row, 'fromAssetId'),
      toAssetId: getProp(row, 'toAssetId'),
      createdAt: getProp(row, 'createdAt')
    })) as Transaction[];
  },

  // 根据 ID 获取交易
  getById: async (id: string): Promise<Transaction | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!row) return undefined;
    return {
      ...row,
      fromAssetId: getProp(row, 'fromAssetId'),
      toAssetId: getProp(row, 'toAssetId'),
      createdAt: getProp(row, 'createdAt')
    } as Transaction;
  },

  // 创建交易
  create: async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newTransaction = {
      ...transaction,
      id,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO transactions (id, type, fromAssetId, toAssetId, amount, currency, fee, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTransaction.id, newTransaction.type, newTransaction.fromAssetId, newTransaction.toAssetId, newTransaction.amount, newTransaction.currency, newTransaction.fee || 0, newTransaction.date, newTransaction.notes, newTransaction.createdAt]
    );

    return newTransaction;
  },

  // 删除交易
  delete: async (id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM transactions WHERE id = ?', [id]);
    return true;
  }
};

// 账户相关操作
export const accountRepository = {
  // 获取所有账户
  getAll: async (): Promise<Account[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM accounts ORDER BY createdAt DESC');
    return rows.map(row => ({
      ...row,
      createdAt: getProp(row, 'createdAt')
    })) as Account[];
  },

  // 根据 ID 获取账户
  getById: async (id: string): Promise<Account | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM accounts WHERE id = ?', [id]);
    if (!row) return undefined;
    return {
      ...row,
      createdAt: getProp(row, 'createdAt')
    } as Account;
  },

  // 创建账户
  create: async (account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newAccount = {
      ...account,
      id,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO accounts (id, name, type, currency, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [newAccount.id, newAccount.name, newAccount.type, newAccount.currency, newAccount.createdAt, newAccount.notes]
    );

    return newAccount;
  },

  // 更新账户
  update: async (id: string, account: Partial<Account>): Promise<Account | undefined> => {
    const existing = await accountRepository.getById(id);
    if (!existing) return undefined;

    const updatedAccount = {
      ...existing,
      ...account
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE accounts SET name = ?, type = ?, currency = ?, notes = ? WHERE id = ?`,
      [updatedAccount.name, updatedAccount.type, updatedAccount.currency, updatedAccount.notes, id]
    );

    return updatedAccount;
  },

  // 删除账户
  delete: async (id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM accounts WHERE id = ?', [id]);
    return true;
  }
};

// 市场数据相关操作
export const marketDataRepository = {
  // 获取所有市场数据
  getAll: async (): Promise<MarketData[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM marketData ORDER BY symbol');
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

      return newMarketData;
    }
  }
};

// 时间轴相关操作
export const activityRepository = {
  // 获取所有活动
  getAll: async (limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
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
  getByObjectType: async (objectType: string, limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities WHERE objectType = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [objectType, limit, offset]);
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
  create: async (activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newActivity = {
      ...activity,
      id,
      createdAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO activities (id, action, objectType, objectId, objectName, amount, currency, oldAmount, delta, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newActivity.id, newActivity.action, newActivity.objectType, newActivity.objectId, newActivity.objectName, newActivity.amount, newActivity.currency, newActivity.oldAmount, newActivity.delta, newActivity.notes, newActivity.createdAt]
    );

    return newActivity;
  }
};

// FIRE 配置相关操作
export const fireConfigRepository = {
  // 获取 FIRE 配置
  get: async (): Promise<FireConfig | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM fireConfig ORDER BY updatedAt DESC LIMIT 1');
    if (!row) return undefined;
    return {
      ...row,
      annualExpense: getProp(row, 'annualExpense'),
      updatedAt: getProp(row, 'updatedAt'),
      createdAt: getProp(row, 'createdAt')
    } as FireConfig;
  },

  // 创建或更新 FIRE 配置
  upsert: async (config: Omit<FireConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FireConfig> => {
    const existing = await fireConfigRepository.get();
    const now = new Date().toISOString();
    const adapter = getAdapter();

    if (existing) {
      await adapter.run(
        `UPDATE fireConfig SET annualExpense = ?, swr = ?, updatedAt = ? WHERE id = ?`,
        [config.annualExpense, config.swr, now, existing.id]
      );

      return {
        ...existing,
        annualExpense: config.annualExpense,
        swr: config.swr,
        updatedAt: now
      };
    } else {
      const id = generateId().toString();
      const newConfig = {
        ...config,
        id,
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
  get: async (): Promise<UserSettings> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM userSettings LIMIT 1');
    if (!row) {
      return {
        id: 'default',
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
  update: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const existing = await userSettingsRepository.get();
    const now = new Date().toISOString();
    const adapter = getAdapter();

    const updatedSettings = {
      ...existing,
      ...settings,
      updatedAt: now
    };

    await adapter.run(
      `UPDATE userSettings SET baseCurrency = ?, privacyMode = ?, updatedAt = ? WHERE id = ?`,
      [updatedSettings.baseCurrency, updatedSettings.privacyMode ? 1 : 0, updatedSettings.updatedAt, updatedSettings.id]
    );

    return updatedSettings;
  }
};
