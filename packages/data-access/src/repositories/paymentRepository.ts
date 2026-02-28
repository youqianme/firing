import { Payment } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 还款记录仓库，负责处理还款记录相关的数据访问操作
 */
export class PaymentRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取所有还款记录
   * @param userId 用户ID
   * @returns 还款记录列表
   */
  async getAll(userId: string): Promise<Payment[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return result.map(this.mapToPayment);
  }

  /**
   * 根据负债ID获取还款记录
   * @param userId 用户ID
   * @param liabilityId 负债ID
   * @returns 还款记录列表
   */
  async getByLiabilityId(userId: string, liabilityId: string): Promise<Payment[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM payments WHERE liabilityId = ? AND userId = ? ORDER BY date DESC', [liabilityId, userId]);
    return result.map(this.mapToPayment);
  }

  /**
   * 根据ID获取还款记录
   * @param userId 用户ID
   * @param id 还款记录ID
   * @returns 还款记录对象
   */
  async getById(userId: string, id: string): Promise<Payment | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM payments WHERE id = ? AND userId = ?', [id, userId]);
    return result ? this.mapToPayment(result) : null;
  }

  /**
   * 创建还款记录
   * @param userId 用户ID
   * @param payment 还款记录对象
   * @returns 创建的还款记录对象
   */
  async create(userId: string, payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      'INSERT INTO payments (id, userId, liabilityId, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, payment.liabilityId, payment.amount, payment.date, payment.notes, now]
    );

    return this.getById(userId, id) as Promise<Payment>;
  }

  /**
   * 删除还款记录
   * @param userId 用户ID
   * @param id 还款记录ID
   * @returns 是否删除成功
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM payments WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }

  /**
   * 将数据库结果映射到还款记录对象
   * @param row 数据库行
   * @returns 还款记录对象
   */
  private mapToPayment(row: any): Payment {
    return {
      id: row.id,
      liabilityId: row.liabilityId,
      amount: row.amount,
      date: row.date,
      notes: row.notes,
      createdAt: row.createdAt
    };
  }
}