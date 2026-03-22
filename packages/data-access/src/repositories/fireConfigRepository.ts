import { FireConfig, FireCalculation } from '@firing/types';
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
    const result = await adapter.get('SELECT * FROM fire_config WHERE id = ?', [userId]);
    return result ? this.mapToFireConfig(result) : null;
  }

  /**
   * 获取或创建默认FIRE配置
   * @param userId 用户ID
   * @returns FIRE配置对象
   */
  async getOrCreate(userId: string): Promise<FireConfig> {
    const existing = await this.get(userId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const defaultConfig: FireConfig = {
      id: userId,
      monthlyExpense: 10000,
      targetRetirementAsset: 0,
      birthDate: '1990-01-01',
      retirementAge: 60,
      updatedAt: now,
      createdAt: now
    };

    const adapter = this.dbManager.getAdapter();
    await adapter.run(
      `INSERT INTO fire_config (id, monthly_expense, target_retirement_asset, birth_date, retirement_age, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultConfig.id,
        defaultConfig.monthlyExpense,
        defaultConfig.targetRetirementAsset,
        defaultConfig.birthDate,
        defaultConfig.retirementAge,
        defaultConfig.updatedAt,
        defaultConfig.createdAt
      ]
    );

    return defaultConfig;
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
      `UPDATE fire_config SET 
        monthly_expense = ?, 
        target_retirement_asset = ?,
        birth_date = ?,
        retirement_age = ?,
        updated_at = ? 
       WHERE id = ?`,
      [
        updatedConfig.monthlyExpense,
        updatedConfig.targetRetirementAsset,
        updatedConfig.birthDate,
        updatedConfig.retirementAge,
        now,
        userId
      ]
    );

    return this.get(userId);
  }

  /**
   * 计算FIRE相关数据
   * @param config FIRE配置
   * @param currentFireAssets 当前FIRE资产
   * @returns FIRE计算结果
   */
  calculateFireMetrics(config: FireConfig, currentFireAssets: number): FireCalculation {
    // 计算距离退休的月数
    const monthsToRetirement = this.calculateMonthsToRetirement(config);

    // 计算退休前总共需要的资产
    // = 每月支出 × 距离退休月数 + 退休时希望剩余的资产
    const totalNeeded = config.monthlyExpense * monthsToRetirement + config.targetRetirementAsset;

    // 计算FIRE进度
    const fireProgress = totalNeeded > 0 ? Math.min(100, (currentFireAssets / totalNeeded) * 100) : 0;

    // 计算距离目标的差额
    const fireGap = totalNeeded - currentFireAssets;

    return {
      monthsToRetirement,
      totalNeeded,
      currentFireAssets,
      fireProgress,
      fireGap
    };
  }

  /**
   * 计算距离退休的月数
   * @param config FIRE配置
   * @returns 距离退休的月数
   */
  private calculateMonthsToRetirement(config: FireConfig): number {
    const birthDate = new Date(config.birthDate);
    const retirementDate = new Date(birthDate);
    retirementDate.setFullYear(birthDate.getFullYear() + config.retirementAge);

    const now = new Date();

    // 如果已经过了退休年龄，返回0
    if (now >= retirementDate) {
      return 0;
    }

    // 计算月数差
    const yearDiff = retirementDate.getFullYear() - now.getFullYear();
    const monthDiff = retirementDate.getMonth() - now.getMonth();

    return Math.max(0, yearDiff * 12 + monthDiff);
  }

  /**
   * 将数据库结果映射到FIRE配置对象
   * @param row 数据库行
   * @returns FIRE配置对象
   */
  private mapToFireConfig(row: any): FireConfig {
    return {
      id: row.id,
      monthlyExpense: row.monthly_expense,
      targetRetirementAsset: row.target_retirement_asset,
      birthDate: row.birth_date,
      retirementAge: row.retirement_age,
      updatedAt: row.updated_at,
      createdAt: row.created_at
    };
  }
}
