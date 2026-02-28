import { Liability } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 负债仓库，负责处理负债相关的数据访问操作
 */
export class LiabilityRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取所有负债
   * @param userId 用户ID
   * @returns 负债列表
   */
  async getAll(userId: string): Promise<Liability[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM liabilities WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return result.map(this.mapToLiability);
  }

  /**
   * 根据ID获取负债
   * @param userId 用户ID
   * @param id 负债ID
   * @returns 负债对象
   */
  async getById(userId: string, id: string): Promise<Liability | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM liabilities WHERE id = ? AND userId = ?', [id, userId]);
    return result ? this.mapToLiability(result) : null;
  }

  /**
   * 创建负债
   * @param userId 用户ID
   * @param liability 负债对象
   * @returns 创建的负债对象
   */
  async create(userId: string, liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Liability> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `liability_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      `INSERT INTO liabilities (
        id, userId, name, type, currency, balance, interestRate, 
        startDate, endDate, updatedAt, createdAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, liability.name, liability.type, liability.currency, 
        liability.balance, liability.interestRate, liability.startDate, 
        liability.endDate, now, now, liability.notes
      ]
    );

    return this.getById(userId, id) as Promise<Liability>;
  }

  /**
   * 更新负债
   * @param userId 用户ID
   * @param id 负债ID
   * @param liability 负债对象
   * @returns 更新后的负债对象
   */
  async update(userId: string, id: string, liability: Partial<Liability>): Promise<Liability | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingLiability = await this.getById(userId, id);
    if (!existingLiability) {
      return null;
    }

    const updatedLiability = { ...existingLiability, ...liability, updatedAt: now };

    await adapter.run(
      `UPDATE liabilities SET 
        name = ?, type = ?, currency = ?, balance = ?, interestRate = ?, 
        startDate = ?, endDate = ?, updatedAt = ?, notes = ? 
      WHERE id = ? AND userId = ?`,
      [
        updatedLiability.name, updatedLiability.type, updatedLiability.currency, 
        updatedLiability.balance, updatedLiability.interestRate, 
        updatedLiability.startDate, updatedLiability.endDate, 
        now, updatedLiability.notes, id, userId
      ]
    );

    return this.getById(userId, id);
  }

  /**
   * 删除负债
   * @param userId 用户ID
   * @param id 负债ID
   * @returns 是否删除成功
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM liabilities WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }

  /**
   * 将数据库结果映射到负债对象
   * @param row 数据库行
   * @returns 负债对象
   */
  private mapToLiability(row: any): Liability {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      currency: row.currency,
      balance: row.balance,
      interestRate: row.interestRate,
      startDate: row.startDate,
      endDate: row.endDate,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      notes: row.notes
    };
  }
}