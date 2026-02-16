import { Transaction } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 交易仓库，负责处理交易相关的数据访问操作
 */
export class TransactionRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取所有交易
   * @returns 交易列表
   */
  async getAll(): Promise<Transaction[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM transactions ORDER BY date DESC');
    return result.map(this.mapToTransaction);
  }

  /**
   * 根据ID获取交易
   * @param id 交易ID
   * @returns 交易对象
   */
  async getById(id: string): Promise<Transaction | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM transactions WHERE id = ?', [id]);
    return result ? this.mapToTransaction(result) : null;
  }

  /**
   * 创建交易
   * @param transaction 交易对象
   * @returns 创建的交易对象
   */
  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `transaction_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      `INSERT INTO transactions (
        id, type, fromAssetId, toAssetId, amount, currency, 
        fee, date, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, transaction.type, transaction.fromAssetId, transaction.toAssetId, 
        transaction.amount, transaction.currency, transaction.fee, 
        transaction.date, transaction.notes, now
      ]
    );

    return this.getById(id);
  }

  /**
   * 删除交易
   * @param id 交易ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM transactions WHERE id = ?', [id]);
    return true;
  }

  /**
   * 将数据库结果映射到交易对象
   * @param row 数据库行
   * @returns 交易对象
   */
  private mapToTransaction(row: any): Transaction {
    return {
      id: row.id,
      type: row.type,
      fromAssetId: row.fromAssetId,
      toAssetId: row.toAssetId,
      amount: row.amount,
      currency: row.currency,
      fee: row.fee,
      date: row.date,
      notes: row.notes,
      createdAt: row.createdAt
    };
  }
}