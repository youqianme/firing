import { initializeDatabase, dbManager } from '../../../../lib/database';

// 初始化数据库
initializeDatabase();

// 生成测试数据
export async function POST() {
  try {
    const adapter = dbManager.getAdapter();
    
    // 开始事务
    await adapter.beginTransaction();
    
    try {
      // 1. 生成账户数据
      const accounts = [
        { id: 'acc-1', name: '支付宝', type: 'digital' },
        { id: 'acc-2', name: '微信', type: 'digital' },
        { id: 'acc-3', name: '银行卡', type: 'bank' },
        { id: 'acc-4', name: '投资账户', type: 'investment' }
      ];
      
      for (const account of accounts) {
        await adapter.run(
          `INSERT OR REPLACE INTO accounts (id, name, type, currency, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?)`,
          [account.id, account.name, account.type, 'CNY', new Date().toISOString(), null]
        );
      }
      
      // 2. 生成市场数据
      const marketData = [
        { id: 'md-1', symbol: 'USD-CNY', price: 7.2, updatedAt: new Date().toISOString(), source: 'manual' },
        { id: 'md-2', symbol: 'EUR-CNY', price: 7.8, updatedAt: new Date().toISOString(), source: 'manual' },
        { id: 'md-3', symbol: 'GOLD-CNY', price: 420, updatedAt: new Date().toISOString(), source: 'manual' }
      ];
      
      for (const data of marketData) {
        await adapter.run(
          `INSERT OR REPLACE INTO marketData (id, symbol, price, updatedAt, source) VALUES (?, ?, ?, ?, ?)`,
          [data.id, data.symbol, data.price, data.updatedAt, data.source]
        );
      }
      
      // 3. 生成资产数据
      const assets = [
        { id: 'asset-1', name: '支付宝余额', type: 'cash', currency: 'CNY', amount: 10000, accountId: 'acc-1', includeInFire: 1, valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'asset-2', name: '微信余额', type: 'cash', currency: 'CNY', amount: 5000, accountId: 'acc-2', includeInFire: 1, valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'asset-3', name: '银行卡存款', type: 'cash', currency: 'CNY', amount: 50000, accountId: 'acc-3', includeInFire: 1, valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'asset-4', name: '股票投资', type: 'investment', currency: 'CNY', amount: 30000, accountId: 'acc-4', includeInFire: 1, valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'asset-5', name: '定期存款', type: 'bank', currency: 'CNY', amount: 20000, accountId: 'acc-3', includeInFire: 1, interestRate: 2.5, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'asset-6', name: '黄金', type: 'investment', currency: 'CNY', amount: 50, accountId: 'acc-4', includeInFire: 1, valuationMethod: 'cost', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      
      for (const asset of assets) {
        await adapter.run(
          `INSERT OR REPLACE INTO assets (id, name, type, currency, amount, includeInFire, accountId, quantity, unitPrice, interestRate, startDate, endDate, valuationMethod, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [asset.id, asset.name, asset.type, asset.currency, asset.amount, asset.includeInFire, asset.accountId, null, null, asset.interestRate || null, asset.startDate || null, asset.endDate || null, asset.valuationMethod, asset.updatedAt, asset.createdAt, null]
        );
      }
      
      // 4. 生成负债数据
      const liabilities = [
        { id: 'liab-1', name: '信用卡', type: 'credit_card', currency: 'CNY', balance: 5000, interestRate: 0.05, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'liab-2', name: '个人贷款', type: 'personal_loan', currency: 'CNY', balance: 20000, interestRate: 0.03, startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      
      for (const liability of liabilities) {
        await adapter.run(
          `INSERT OR REPLACE INTO liabilities (id, name, type, currency, balance, interestRate, startDate, endDate, updatedAt, createdAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [liability.id, liability.name, liability.type, liability.currency, liability.balance, liability.interestRate, liability.startDate, liability.endDate, liability.updatedAt, liability.createdAt, null]
        );
      }
      
      // 5. 生成交易数据
      const transactions = [
        {
          id: 'tx-1',
          type: 'transfer',
          fromAssetId: 'asset-1',
          toAssetId: 'asset-2',
          amount: 1000,
          currency: 'CNY',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '支付宝转微信'
        },
        {
          id: 'tx-2',
          type: 'expense',
          fromAssetId: 'asset-2',
          toAssetId: null,
          amount: 500,
          currency: 'CNY',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '购物'
        },
        {
          id: 'tx-3',
          type: 'income',
          fromAssetId: null,
          toAssetId: 'asset-3',
          amount: 10000,
          currency: 'CNY',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '工资'
        }
      ];
      
      for (const transaction of transactions) {
        await adapter.run(
          `INSERT OR REPLACE INTO transactions (id, type, fromAssetId, toAssetId, amount, currency, fee, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [transaction.id, transaction.type, transaction.fromAssetId, transaction.toAssetId, transaction.amount, transaction.currency, null, transaction.date, transaction.notes, new Date().toISOString()]
        );
      }
      
      // 6. 生成 FIRE 配置数据
      await adapter.run(
        `INSERT OR REPLACE INTO fireConfig (id, annualExpense, swr, updatedAt, createdAt) VALUES (?, ?, ?, ?, ?)`,
        ['default', 120000, 0.04, new Date().toISOString(), new Date().toISOString()]
      );
      
      // 7. 生成活动记录
      const activities = [
        {
          id: 'act-1',
          action: 'CREATE',
          objectType: 'asset',
          objectId: 'asset-1',
          objectName: '支付宝余额',
          amount: 10000,
          currency: 'CNY',
          oldAmount: null,
          delta: 10000,
          notes: '创建资产',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act-2',
          action: 'UPDATE',
          objectType: 'asset',
          objectId: 'asset-1',
          objectName: '支付宝余额',
          amount: 9000,
          currency: 'CNY',
          oldAmount: 10000,
          delta: -1000,
          notes: '转账到微信',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'act-3',
          action: 'CREATE',
          objectType: 'liability',
          objectId: 'liab-1',
          objectName: '信用卡',
          amount: 5000,
          currency: 'CNY',
          oldAmount: null,
          delta: 5000,
          notes: '创建负债',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      for (const activity of activities) {
        await adapter.run(
          `INSERT OR REPLACE INTO activities (id, action, objectType, objectId, objectName, amount, currency, oldAmount, delta, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [activity.id, activity.action, activity.objectType, activity.objectId, activity.objectName, activity.amount, activity.currency, activity.oldAmount, activity.delta, activity.notes, activity.createdAt]
        );
      }
      
      // 提交事务
      await adapter.commit();
      
      return new Response(JSON.stringify({ message: 'Test data generated successfully' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // 回滚事务
      await adapter.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Failed to generate test data:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate test data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
