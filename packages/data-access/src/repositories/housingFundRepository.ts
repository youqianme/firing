import { DatabaseManager } from '../database/manager';

export type HousingFundRecordType = 'deposit' | 'withdraw' | 'interest';

export interface HousingFundRecord {
  id: string;
  assetId: string;
  type: HousingFundRecordType;
  amount: number;
  personalAmount: number;
  companyAmount: number;
  date: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}

/**
 * 公积金记录仓库，负责处理公积金记录相关的数据访问操作
 */
export class HousingFundRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取某个资产的所有公积金记录
   * @param userId 用户ID
   * @param assetId 资产ID
   * @returns 公积金记录列表
   */
  async getAllByAssetId(userId: string, assetId: string): Promise<HousingFundRecord[]> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.execute(
      'SELECT * FROM housing_fund_records WHERE assetId = ? ORDER BY date DESC',
      [assetId]
    );
    return result.map(this.mapToHousingFundRecord);
  }

  /**
   * 根据ID获取记录
   * @param userId 用户ID
   * @param id 记录ID
   * @returns 公积金记录对象
   */
  async getById(userId: string, id: string): Promise<HousingFundRecord | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get(
      'SELECT * FROM housing_fund_records WHERE id = ?',
      [id]
    );
    return result ? this.mapToHousingFundRecord(result) : null;
  }

  /**
   * 创建记录
   * @param userId 用户ID
   * @param record 公积金记录对象
   * @returns 创建的公积金记录对象
   */
  async create(
    userId: string,
    record: Omit<HousingFundRecord, 'id' | 'createdAt'>
  ): Promise<HousingFundRecord> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();
    const id = `hf_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await adapter.run(
      `INSERT INTO housing_fund_records (
        id, assetId, type, amount, personalAmount, companyAmount, date, reason, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        record.assetId,
        record.type,
        record.amount,
        record.personalAmount,
        record.companyAmount,
        record.date,
        record.reason || null,
        record.notes || null,
        now
      ]
    );

    return this.getById(userId, id) as Promise<HousingFundRecord>;
  }

  /**
   * 更新记录
   * @param userId 用户ID
   * @param id 记录ID
   * @param record 公积金记录对象
   * @returns 更新后的公积金记录对象
   */
  async update(
    userId: string,
    id: string,
    record: Partial<HousingFundRecord>
  ): Promise<HousingFundRecord | null> {
    const adapter = this.dbManager.getAdapter();

    const existingRecord = await this.getById(userId, id);
    if (!existingRecord) {
      return null;
    }

    const updatedRecord = { ...existingRecord, ...record };

    await adapter.run(
      `UPDATE housing_fund_records SET 
        assetId = ?, type = ?, amount = ?, personalAmount = ?, companyAmount = ?, 
        date = ?, reason = ?, notes = ?
      WHERE id = ?`,
      [
        updatedRecord.assetId,
        updatedRecord.type,
        updatedRecord.amount,
        updatedRecord.personalAmount,
        updatedRecord.companyAmount,
        updatedRecord.date,
        updatedRecord.reason || null,
        updatedRecord.notes || null,
        id
      ]
    );

    return this.getById(userId, id);
  }

  /**
   * 删除记录
   * @param userId 用户ID
   * @param id 记录ID
   * @returns 是否删除成功
   */
  async delete(userId: string, id: string): Promise<boolean> {
    const adapter = this.dbManager.getAdapter();
    await adapter.run('DELETE FROM housing_fund_records WHERE id = ?', [id]);
    return true;
  }

  /**
   * 计算某个公积金资产的当前余额
   * @param userId 用户ID
   * @param assetId 资产ID
   * @returns 当前余额
   */
  async getBalanceByAssetId(userId: string, assetId: string): Promise<number> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get(
      `SELECT 
        SUM(CASE 
          WHEN type = 'deposit' OR type = 'interest' THEN amount 
          WHEN type = 'withdraw' THEN -amount 
          ELSE 0 
        END) as balance
      FROM housing_fund_records 
      WHERE assetId = ?`,
      [assetId]
    );
    return result?.balance || 0;
  }

  /**
   * 获取某月到账金额
   * @param userId 用户ID
   * @param assetId 资产ID
   * @param year 年份
   * @param month 月份
   * @returns 当月到账金额
   */
  async getMonthlyDeposit(
    userId: string,
    assetId: string,
    year: number,
    month: number
  ): Promise<number> {
    const adapter = this.dbManager.getAdapter();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const result = await adapter.get(
      `SELECT 
        SUM(CASE 
          WHEN type = 'deposit' THEN amount 
          ELSE 0 
        END) as depositAmount
      FROM housing_fund_records 
      WHERE assetId = ? AND date >= ? AND date < ?`,
      [assetId, startDate, endDate]
    );
    return result?.depositAmount || 0;
  }

  /**
   * 将数据库结果映射到公积金记录对象
   * @param row 数据库行
   * @returns 公积金记录对象
   */
  private mapToHousingFundRecord(row: any): HousingFundRecord {
    return {
      id: row.id,
      assetId: row.assetId,
      type: row.type as HousingFundRecordType,
      amount: row.amount,
      personalAmount: row.personalAmount,
      companyAmount: row.companyAmount,
      date: row.date,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.createdAt
    };
  }
}
