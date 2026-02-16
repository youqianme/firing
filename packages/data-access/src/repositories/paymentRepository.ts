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
   * @returns 还款记录列表
   */
  async getAll(): Promise<Payment[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM payments ORDER BY createdAt DESC');
    return result.map(this.mapToPayment);
  }

  /**
   * 根据负债ID获取还款记录
   * @param liabilityId 负债ID
   * @returns 还款记录列表
   */
  async getByLiabilityId(liabilityId: string): Promise<Payment[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM payments WHERE liabilityId = ? ORDER BY date DESC', [liabilityId]);
    return result.map(this.mapToPayment);
  }

  /**
   * 根据ID获取还款记录
   * @param id 还款记录ID
   * @returns 还款记录对象
   */
  async getById(id: string): Promise<Payment | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM payments WHERE id = ?', [id]);
    return result ? this.mapToPayment(result) : null;
  }

  /**
   * 创建还款记录
   * @param payment 还款记录对象
   * @returns 创建的还款记录对象
   */
  async create(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      'INSERT INTO payments (id, liabilityId, amount, date, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, payment.liabilityId, payment.amount, payment.date, payment.notes, now]
    );

    return this.getById(id);
  }

  /**
   * 删除还款记录
   * @param id 还款记录ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM payments WHERE id = ?', [id]);
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