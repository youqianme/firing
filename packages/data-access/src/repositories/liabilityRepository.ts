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
   * @returns 负债列表
   */
  async getAll(): Promise<Liability[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM liabilities ORDER BY createdAt DESC');
    return result.map(this.mapToLiability);
  }

  /**
   * 根据ID获取负债
   * @param id 负债ID
   * @returns 负债对象
   */
  async getById(id: string): Promise<Liability | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM liabilities WHERE id = ?', [id]);
    return result ? this.mapToLiability(result) : null;
  }

  /**
   * 创建负债
   * @param liability 负债对象
   * @returns 创建的负债对象
   */
  async create(liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>): Promise<Liability> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `liability_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      `INSERT INTO liabilities (
        id, name, type, currency, balance, interestRate, 
        startDate, endDate, updatedAt, createdAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, liability.name, liability.type, liability.currency, 
        liability.balance, liability.interestRate, liability.startDate, 
        liability.endDate, now, now, liability.notes
      ]
    );

    return this.getById(id);
  }

  /**
   * 更新负债
   * @param id 负债ID
   * @param liability 负债对象
   * @returns 更新后的负债对象
   */
  async update(id: string, liability: Partial<Liability>): Promise<Liability | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingLiability = await this.getById(id);
    if (!existingLiability) {
      return null;
    }

    const updatedLiability = { ...existingLiability, ...liability, updatedAt: now };

    await adapter.run(
      `UPDATE liabilities SET 
        name = ?, type = ?, currency = ?, balance = ?, interestRate = ?, 
        startDate = ?, endDate = ?, updatedAt = ?, notes = ? 
      WHERE id = ?`,
      [
        updatedLiability.name, updatedLiability.type, updatedLiability.currency, 
        updatedLiability.balance, updatedLiability.interestRate, 
        updatedLiability.startDate, updatedLiability.endDate, 
        now, updatedLiability.notes, id
      ]
    );

    return this.getById(id);
  }

  /**
   * 删除负债
   * @param id 负债ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM liabilities WHERE id = ?', [id]);
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