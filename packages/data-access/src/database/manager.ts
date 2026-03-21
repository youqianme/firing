import { DatabaseAdapter } from './adapter';

/**
 * 数据库管理器，负责管理数据库连接
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private adapter: DatabaseAdapter;

  private constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  /**
   * 获取数据库管理器实例
   * @param adapter 数据库适配器
   * @returns 数据库管理器实例
   */
  public static getInstance(adapter: DatabaseAdapter): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager(adapter);
    }
    return DatabaseManager.instance;
  }

  /**
   * 获取数据库适配器
   * @returns 数据库适配器
   */
  public getAdapter(): DatabaseAdapter {
    return this.adapter;
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    await this.adapter.close();
  }
}
