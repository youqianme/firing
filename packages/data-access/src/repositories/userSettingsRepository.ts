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
   * 获取用户设置
   * @param userId 用户ID
   * @returns 用户设置对象
   */
  async get(userId: string): Promise<UserSettings | null> {
    const adapter = this.dbManager.getAdapter();
    const result = await adapter.get('SELECT * FROM userSettings WHERE id = ?', [userId]);
    return result ? this.mapToUserSettings(result) : null;
  }

  /**
   * 更新用户设置
   * @param userId 用户ID
   * @param settings 用户设置对象
   * @returns 更新后的用户设置对象
   */
  async update(userId: string, settings: Partial<UserSettings>): Promise<UserSettings | null> {
    const adapter = this.dbManager.getAdapter();
    const now = new Date().toISOString();

    const existingSettings = await this.get(userId);
    
    // 如果不存在，则创建默认设置
    if (!existingSettings) {
      // 如果没有找到现有设置，我们应该插入一条新记录
      // 这里假设如果只是部分更新，我们需要先有默认值
      // 但实际上通常 update 应该是在已有记录的基础上
      // 不过对于 userSettings，如果不存在，我们可以视为初始化
      // 简单起见，如果不存在，我们先尝试插入
      
      // 注意：这里可能需要根据具体业务逻辑调整。
      // 如果设计是必须先有记录，则这里应该返回 null 或抛错。
      // 但通常用户第一次访问时可能没有设置。
      
      // 让我们先按照 update 的语义，如果不存在则无法更新。
      // 但是为了方便，如果不存在，我们可以尝试插入。
      // 但由于 settings 是 Partial，我们可能缺少必要字段。
      
      // 根据之前的逻辑：
      // const existingSettings = await this.getDefault();
      // if (!existingSettings) { return null; }
      
      // 如果数据库里没有 'default' 记录，之前的代码也会返回 null。
      // 所以这里如果 userId 对应的记录不存在，我们也返回 null。
      // 除非调用方负责先创建。
      
      // 考虑到通常 UserSettings 是随用户创建而初始化的，
      // 这里我们保持原样：如果不存在则返回 null。
      // 或者，我们假设调用方会确保用户存在。
      
      // 实际上，如果用户刚注册，可能没有 settings 记录。
      // 之前的代码是查 'default'，这暗示全系统只有一份配置？
      // 不，之前的代码是把 id 硬编码为 'default'。
      // 现在我们要改成每个用户一份。
      
      return null;
    }

    const updatedSettings = { ...existingSettings, ...settings, updatedAt: now };

    await adapter.run(
      'UPDATE userSettings SET baseCurrency = ?, privacyMode = ?, updatedAt = ? WHERE id = ?',
      [updatedSettings.baseCurrency, updatedSettings.privacyMode ? 1 : 0, now, userId]
    );

    return this.get(userId);
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