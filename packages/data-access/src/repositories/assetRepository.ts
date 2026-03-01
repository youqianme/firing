import { Asset } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 资产仓库，负责处理资产相关的数据访问操作
 */
export class AssetRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取所有资产
   * @param userId 用户ID
   * @returns 资产列表
   */
  async getAll(userId: string): Promise<Asset[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM assets WHERE userId = ? ORDER BY createdAt DESC', [userId]);
    return result.map(this.mapToAsset);
  }

  /**
   * 根据ID获取资产
   * @param userId 用户ID
   * @param id 资产ID
   * @returns 资产对象
   */
  async getById(userId: string, id: string): Promise<Asset | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM assets WHERE id = ? AND userId = ?', [id, userId]);
    return result ? this.mapToAsset(result) : null;
  }

  /**
   * 创建资产
   * @param userId 用户ID
   * @param asset 资产对象
   * @returns 创建的资产对象
   */
  async create(userId: string, asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asset> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `asset_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      `INSERT INTO assets (
        id, userId, name, type, currency, amount, includeInFire, accountId, 
        quantity, unitPrice, interestRate, startDate, endDate, 
        valuationMethod, updatedAt, createdAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, asset.name, asset.type, asset.currency, asset.amount, 
        asset.includeInFire ? 1 : 0, asset.accountId, asset.quantity, 
        asset.unitPrice, asset.interestRate, asset.startDate, asset.endDate, 
        asset.valuationMethod, now, now, asset.notes
      ]
    );

    return this.getById(userId, id) as Promise<Asset>;
  }

  /**
   * 更新资产
   * @param userId 用户ID
   * @param id 资产ID
   * @param asset 资产对象
   * @returns 更新后的资产对象
   */
  async update(userId: string, id: string, asset: Partial<Asset>): Promise<Asset | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingAsset = await this.getById(userId, id);
    if (!existingAsset) {
      return null;
    }

    const updatedAsset = { ...existingAsset, ...asset, updatedAt: now };

    await adapter.run(
      `UPDATE assets SET 
        name = ?, type = ?, currency = ?, amount = ?, includeInFire = ?, 
        accountId = ?, quantity = ?, unitPrice = ?, interestRate = ?, 
        startDate = ?, endDate = ?, valuationMethod = ?, updatedAt = ?, notes = ? 
      WHERE id = ? AND userId = ?`,
      [
        updatedAsset.name, updatedAsset.type, updatedAsset.currency, 
        updatedAsset.amount, updatedAsset.includeInFire ? 1 : 0, 
        updatedAsset.accountId, updatedAsset.quantity, updatedAsset.unitPrice, 
        updatedAsset.interestRate, updatedAsset.startDate, updatedAsset.endDate, 
        updatedAsset.valuationMethod, now, updatedAsset.notes, id, userId
      ]
    );

    return this.getById(userId, id);
  }

  /**
   * 删除资产
   * @param userId 用户ID
   * @param id 资产ID
   * @returns 是否删除成功
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM assets WHERE id = ? AND userId = ?', [id, userId]);
    return true;
  }

  /**
   * 获取包含在FIRE计算中的资产
   * @param userId 用户ID
   * @returns 资产列表
   */
  async getFireAssets(userId: string): Promise<Asset[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute('SELECT * FROM assets WHERE includeInFire = 1 AND userId = ? ORDER BY createdAt DESC', [userId]);
    return result.map(this.mapToAsset);
  }

  /**
   * 将数据库结果映射到资产对象
   * @param row 数据库行
   * @returns 资产对象
   */
  private mapToAsset(row: any): Asset {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      currency: row.currency,
      amount: row.amount,
      includeInFire: row.includeInFire === 1,
      accountId: row.accountId,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      interestRate: row.interestRate,
      startDate: row.startDate,
      endDate: row.endDate,
      valuationMethod: row.valuationMethod,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      notes: row.notes
    };
  }
}