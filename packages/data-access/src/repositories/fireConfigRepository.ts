import { FireConfig } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * FIRE配置仓库，负责处理FIRE配置相关的数据访问操作
 */
export class FireConfigRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取FIRE配置
   * @param userId 用户ID
   * @returns FIRE配置对象
   */
  async get(userId: string): Promise<FireConfig | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM fireConfig WHERE id = ?', [userId]);
    return result ? this.mapToFireConfig(result) : null;
  }

  /**
   * 更新FIRE配置
   * @param userId 用户ID
   * @param config FIRE配置对象
   * @returns 更新后的FIRE配置对象
   */
  async update(userId: string, config: Partial<FireConfig>): Promise<FireConfig | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingConfig = await this.get(userId);
    if (!existingConfig) {
      return null;
    }

    const updatedConfig = { ...existingConfig, ...config, updatedAt: now };

    await adapter.run(
      'UPDATE fireConfig SET annualExpense = ?, swr = ?, updatedAt = ? WHERE id = ?',
      [updatedConfig.annualExpense, updatedConfig.swr, now, userId]
    );

    return this.get(userId);
  }

  /**
   * 将数据库结果映射到FIRE配置对象
   * @param row 数据库行
   * @returns FIRE配置对象
   */
  private mapToFireConfig(row: any): FireConfig {
    return {
      id: row.id,
      annualExpense: row.annualExpense,
      swr: row.swr,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt
    };
  }
}