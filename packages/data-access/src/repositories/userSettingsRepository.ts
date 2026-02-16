import { UserSettings } from '@firing/types';
import { DatabaseManager } from '../database/manager';

/**
 * 用户设置仓库，负责处理用户设置相关的数据访问操作
 */
export class UserSettingsRepository {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  /**
   * 获取默认用户设置
   * @returns 用户设置对象
   */
  async getDefault(): Promise<UserSettings | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM userSettings WHERE id = ?', ['default']);
    return result ? this.mapToUserSettings(result) : null;
  }

  /**
   * 更新用户设置
   * @param settings 用户设置对象
   * @returns 更新后的用户设置对象
   */
  async update(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingSettings = await this.getDefault();
    if (!existingSettings) {
      return null;
    }

    const updatedSettings = { ...existingSettings, ...settings, updatedAt: now };

    await adapter.run(
      'UPDATE userSettings SET baseCurrency = ?, privacyMode = ?, updatedAt = ? WHERE id = ?',
      [updatedSettings.baseCurrency, updatedSettings.privacyMode ? 1 : 0, now, 'default']
    );

    return this.getDefault();
  }

  /**
   * 将数据库结果映射到用户设置对象
   * @param row 数据库行
   * @returns 用户设置对象
   */
  private mapToUserSettings(row: any): UserSettings {
    return {
      id: row.id,
      baseCurrency: row.baseCurrency,
      privacyMode: row.privacyMode === 1,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt
    };
  }
}