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
  FireMember,
  UserSettings
} from '@firing/types';

// 获取数据库适配器
const getAdapter = () => dbManager.getAdapter();

// ==================== 转换函数 ====================

// 资产转换函数
const toAsset = (row: any): Asset => ({
  id: row.id,
  name: row.name,
  type: row.type,
  subType: row.sub_type,
  currency: row.currency,
  amount: row.amount,
  includeInFire: row.include_in_fire === 1,
  accountId: row.account_id,
  quantity: row.quantity,
  unitPrice: row.unit_price,
  interestRate: row.interest_rate,
  startDate: row.start_date,
  endDate: row.end_date,
  valuationMethod: row.valuation_method,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  notes: row.notes,
});

// 负债转换函数
const toLiability = (row: any): Liability => ({
  id: row.id,
  name: row.name,
  type: row.type,
  currency: row.currency,
  balance: row.balance,
  interestRate: row.interest_rate,
  startDate: row.start_date,
  endDate: row.end_date,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
  notes: row.notes,
});

// 还款记录转换函数
const toPayment = (row: any): Payment => ({
  id: row.id,
  liabilityId: row.liability_id,
  amount: row.amount,
  date: row.date,
  notes: row.notes,
  createdAt: row.created_at,
});

// 交易转换函数
const toTransaction = (row: any): Transaction => ({
  id: row.id,
  type: row.type,
  fromAssetId: row.from_asset_id,
  toAssetId: row.to_asset_id,
  amount: row.amount,
  currency: row.currency,
  fee: row.fee,
  date: row.date,
  notes: row.notes,
  createdAt: row.created_at,
});

// 账户转换函数
const toAccount = (row: any): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  currency: row.currency,
  createdAt: row.created_at,
  notes: row.notes,
});

// 市场数据转换函数
const toMarketData = (row: any): MarketData => ({
  id: row.id,
  symbol: row.symbol,
  price: row.price,
  updatedAt: row.updated_at,
  source: row.source,
});

// 活动转换函数
const toActivity = (row: any): Activity => ({
  id: row.id,
  action: row.action,
  objectType: row.object_type,
  objectId: row.object_id,
  objectName: row.object_name,
  amount: row.amount,
  currency: row.currency,
  oldAmount: row.old_amount,
  delta: row.delta,
  notes: row.notes,
  createdAt: row.created_at,
});

// FIRE成员转换函数
const toFireMember = (row: any): FireMember => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  gender: row.gender,
  birthDate: row.birth_date,
  retirementAge: row.retirement_age,
  monthlyExpense: row.monthly_expense,
  targetRetirementAsset: row.target_retirement_asset,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
});

// 用户设置转换函数
const toUserSettings = (row: any): UserSettings => ({
  id: row.id,
  baseCurrency: row.base_currency || 'CNY',
  privacyMode: row.privacy_mode === 1,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
});

// ==================== 资产相关操作 ====================

export const assetRepository = {
  // 获取所有资产
  getAll: async (userId: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    return rows.map(toAsset);
  },

  // 根据 ID 获取资产
  getById: async (userId: string, id: string): Promise<Asset | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    return row ? toAsset(row) : undefined;
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
      `INSERT INTO assets (id, user_id, name, type, sub_type, currency, amount, include_in_fire, account_id, quantity, unit_price, interest_rate, start_date, end_date, valuation_method, updated_at, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newAsset.id, userId, newAsset.name, newAsset.type, newAsset.subType, newAsset.currency, newAsset.amount, newAsset.includeInFire ? 1 : 0, newAsset.accountId, newAsset.quantity, newAsset.unitPrice, newAsset.interestRate, newAsset.startDate, newAsset.endDate, newAsset.valuationMethod, newAsset.updatedAt, newAsset.createdAt, newAsset.notes]
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
      `UPDATE assets SET name = ?, type = ?, sub_type = ?, currency = ?, amount = ?, include_in_fire = ?, account_id = ?, quantity = ?, unit_price = ?, interest_rate = ?, start_date = ?, end_date = ?, valuation_method = ?, updated_at = ?, notes = ? WHERE id = ? AND user_id = ?`,
      [updatedAsset.name, updatedAsset.type, updatedAsset.subType, updatedAsset.currency, updatedAsset.amount, updatedAsset.includeInFire ? 1 : 0, updatedAsset.accountId, updatedAsset.quantity, updatedAsset.unitPrice, updatedAsset.interestRate, updatedAsset.startDate, updatedAsset.endDate, updatedAsset.valuationMethod, updatedAsset.updatedAt, updatedAsset.notes, id, userId]
    );

    return updatedAsset;
  },

  // 删除资产
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  },

  // 根据类型获取资产
  getByType: async (userId: string, type: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE type = ? AND user_id = ? ORDER BY updated_at DESC', [type, userId]);
    return rows.map(toAsset);
  },

  // 根据账户获取资产
  getByAccountId: async (userId: string, accountId: string): Promise<Asset[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM assets WHERE account_id = ? AND user_id = ? ORDER BY updated_at DESC', [accountId, userId]);
    return rows.map(toAsset);
  }
};

// ==================== 负债相关操作 ====================

export const liabilityRepository = {
  // 获取所有负债
  getAll: async (userId: string): Promise<Liability[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM liabilities WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    return rows.map(toLiability);
  },

  // 根据 ID 获取负债
  getById: async (userId: string, id: string): Promise<Liability | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM liabilities WHERE id = ? AND user_id = ?', [id, userId]);
    return row ? toLiability(row) : undefined;
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
      `INSERT INTO liabilities (id, user_id, name, type, currency, balance, interest_rate, start_date, end_date, updated_at, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      `UPDATE liabilities SET name = ?, type = ?, currency = ?, balance = ?, interest_rate = ?, start_date = ?, end_date = ?, updated_at = ?, notes = ? WHERE id = ? AND user_id = ?`,
      [updatedLiability.name, updatedLiability.type, updatedLiability.currency, updatedLiability.balance, updatedLiability.interestRate, updatedLiability.startDate, updatedLiability.endDate, updatedLiability.updatedAt, updatedLiability.notes, id, userId]
    );

    return updatedLiability;
  },

  // 删除负债
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM liabilities WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

// ==================== 还款记录相关操作 ====================

export const paymentRepository = {
  // 获取所有还款记录
  getAll: async (userId: string): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments WHERE user_id = ? ORDER BY date DESC', [userId]);
    return rows.map(toPayment);
  },

  // 根据负债 ID 获取还款记录
  getByLiabilityId: async (userId: string, liabilityId: string): Promise<Payment[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM payments WHERE liability_id = ? AND user_id = ? ORDER BY date DESC', [liabilityId, userId]);
    return rows.map(toPayment);
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
      `INSERT INTO payments (id, user_id, liability_id, amount, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newPayment.id, userId, newPayment.liabilityId, newPayment.amount, newPayment.date, newPayment.notes, newPayment.createdAt]
    );

    return newPayment as unknown as Payment;
  },

  // 删除还款记录
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM payments WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

// ==================== 交易相关操作 ====================

export const transactionRepository = {
  // 获取所有交易
  getAll: async (userId: string): Promise<Transaction[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);
    return rows.map(toTransaction);
  },

  // 根据 ID 获取交易
  getById: async (userId: string, id: string): Promise<Transaction | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    return row ? toTransaction(row) : undefined;
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
      `INSERT INTO transactions (id, user_id, type, from_asset_id, to_asset_id, amount, currency, fee, date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTransaction.id, userId, newTransaction.type, newTransaction.fromAssetId, newTransaction.toAssetId, newTransaction.amount, newTransaction.currency, newTransaction.fee || 0, newTransaction.date, newTransaction.notes, newTransaction.createdAt]
    );

    return newTransaction as unknown as Transaction;
  },

  // 删除交易
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

// ==================== 账户相关操作 ====================

export const accountRepository = {
  // 获取所有账户
  getAll: async (userId: string): Promise<Account[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(toAccount);
  },

  // 根据 ID 获取账户
  getById: async (userId: string, id: string): Promise<Account | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    return row ? toAccount(row) : undefined;
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
      `INSERT INTO accounts (id, user_id, name, type, currency, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
      `UPDATE accounts SET name = ?, type = ?, currency = ?, notes = ? WHERE id = ? AND user_id = ?`,
      [updatedAccount.name, updatedAccount.type, updatedAccount.currency, updatedAccount.notes, id, userId]
    );

    return updatedAccount;
  },

  // 删除账户
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

// ==================== 市场数据相关操作 ====================

export const marketDataRepository = {
  // 获取所有市场数据
  getAll: async (): Promise<MarketData[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM market_data ORDER BY symbol', []);
    return rows.map(toMarketData);
  },

  // 根据符号获取市场数据
  getBySymbol: async (symbol: string): Promise<MarketData | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM market_data WHERE symbol = ?', [symbol]);
    return row ? toMarketData(row) : undefined;
  },

  // 创建或更新市场数据
  upsert: async (symbol: string, price: number, source: 'MANUAL' | 'AUTO' = 'MANUAL'): Promise<MarketData> => {
    const existing = await marketDataRepository.getBySymbol(symbol);
    const now = new Date().toISOString();
    const adapter = getAdapter();

    if (existing) {
      await adapter.run(
        `UPDATE market_data SET price = ?, updated_at = ?, source = ? WHERE symbol = ?`,
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
        `INSERT INTO market_data (id, symbol, price, updated_at, source) VALUES (?, ?, ?, ?, ?)`,
        [newMarketData.id, newMarketData.symbol, newMarketData.price, newMarketData.updatedAt, newMarketData.source]
      );

      return newMarketData as unknown as MarketData;
    }
  }
};

// ==================== 活动相关操作 ====================

export const activityRepository = {
  // 获取所有活动
  getAll: async (userId: string, limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
    return rows.map(toActivity);
  },

  // 根据对象类型获取活动
  getByObjectType: async (userId: string, objectType: string, limit: number = 50, offset: number = 0): Promise<Activity[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM activities WHERE object_type = ? AND user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [objectType, userId, limit, offset]);
    return rows.map(toActivity);
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
      `INSERT INTO activities (id, user_id, action, object_type, object_id, object_name, amount, currency, old_amount, delta, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newActivity.id, userId, newActivity.action, newActivity.objectType, newActivity.objectId, newActivity.objectName, newActivity.amount, newActivity.currency, newActivity.oldAmount, newActivity.delta, newActivity.notes, newActivity.createdAt]
    );

    return newActivity as unknown as Activity;
  }
};

// ==================== FIRE 成员相关操作 ====================

export const fireMemberRepository = {
  // 获取所有 FIRE 成员
  getAll: async (userId: string): Promise<FireMember[]> => {
    const adapter = getAdapter();
    const rows = await adapter.execute('SELECT * FROM fire_members WHERE user_id = ? ORDER BY created_at ASC', [userId]);
    return rows.map(toFireMember);
  },

  // 根据 ID 获取 FIRE 成员
  getById: async (userId: string, id: string): Promise<FireMember | undefined> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM fire_members WHERE id = ? AND user_id = ?', [id, userId]);
    return row ? toFireMember(row) : undefined;
  },

  // 创建 FIRE 成员
  create: async (userId: string, member: Omit<FireMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FireMember> => {
    const id = generateId().toString();
    const now = new Date().toISOString();
    const newMember = {
      ...member,
      id,
      userId,
      createdAt: now,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `INSERT INTO fire_members (id, user_id, name, gender, birth_date, retirement_age, monthly_expense, target_retirement_asset, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newMember.id, userId, newMember.name, newMember.gender, newMember.birthDate, newMember.retirementAge, newMember.monthlyExpense, newMember.targetRetirementAsset, newMember.updatedAt, newMember.createdAt]
    );

    return newMember as unknown as FireMember;
  },

  // 更新 FIRE 成员
  update: async (userId: string, id: string, member: Partial<FireMember>): Promise<FireMember | undefined> => {
    const existing = await fireMemberRepository.getById(userId, id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const updatedMember = {
      ...existing,
      ...member,
      updatedAt: now
    };

    const adapter = getAdapter();
    await adapter.run(
      `UPDATE fire_members SET name = ?, gender = ?, birth_date = ?, retirement_age = ?, monthly_expense = ?, target_retirement_asset = ?, updated_at = ? WHERE id = ? AND user_id = ?`,
      [updatedMember.name, updatedMember.gender, updatedMember.birthDate, updatedMember.retirementAge, updatedMember.monthlyExpense, updatedMember.targetRetirementAsset, updatedMember.updatedAt, id, userId]
    );

    return updatedMember;
  },

  // 删除 FIRE 成员
  delete: async (userId: string, id: string): Promise<boolean> => {
    const adapter = getAdapter();
    await adapter.run('DELETE FROM fire_members WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
};

// ==================== 用户设置相关操作 ====================

export const userSettingsRepository = {
  // 获取用户设置
  get: async (userId: string): Promise<UserSettings> => {
    const adapter = getAdapter();
    const row = await adapter.get('SELECT * FROM user_settings WHERE id = ? LIMIT 1', [userId]);
    if (!row) {
      return {
        id: userId,
        baseCurrency: 'CNY',
        privacyMode: false,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }
    return toUserSettings(row);
  },

  // 更新用户设置
  update: async (userId: string, settings: Partial<UserSettings>): Promise<UserSettings> => {
    const adapter = getAdapter();
    const existingRow = await adapter.get('SELECT * FROM user_settings WHERE id = ?', [userId]);
    const now = new Date().toISOString();

    if (existingRow) {
      const existing = toUserSettings(existingRow);
      const updatedSettings = {
        ...existing,
        ...settings,
        updatedAt: now
      };

      await adapter.run(
        `UPDATE user_settings SET base_currency = ?, privacy_mode = ?, updated_at = ? WHERE id = ?`,
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
        `INSERT INTO user_settings (id, base_currency, privacy_mode, updated_at, created_at) VALUES (?, ?, ?, ?, ?)`,
        [newSettings.id, newSettings.baseCurrency, newSettings.privacyMode ? 1 : 0, newSettings.updatedAt, newSettings.createdAt]
      );
      
      return newSettings;
    }
  }
};
