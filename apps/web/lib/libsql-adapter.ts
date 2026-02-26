import { createClient, Client, Transaction } from '@libsql/client';
import { DatabaseAdapter } from '@firing/data-access';

/**
 * LibSQL (Turso) 数据库适配器，支持 Serverless 环境
 */
export class LibsqlDatabaseAdapter implements DatabaseAdapter {
  private client: Client;
  private transaction: Transaction | null = null;

  constructor(url: string, authToken?: string) {
    this.client = createClient({
      url,
      authToken,
    });
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async execute(sql: string, params: any[] = []): Promise<any[]> {
    const target = this.transaction || this.client;
    try {
      const result = await target.execute({ sql, args: params });
      return result.rows;
    } catch (error) {
      console.error('LibSQL execute error:', error);
      throw error;
    }
  }

  /**
   * 执行 SQL 语句（不返回结果）
   * @param sql SQL 语句
   * @param params 语句参数
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    const target = this.transaction || this.client;
    try {
      await target.execute({ sql, args: params });
    } catch (error) {
      console.error('LibSQL run error:', error);
      throw error;
    }
  }

  /**
   * 获取单个查询结果
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 单个查询结果
   */
  async get(sql: string, params: any[] = []): Promise<any | null> {
    const target = this.transaction || this.client;
    try {
      const result = await target.execute({ sql, args: params });
      return result.rows[0] || null;
    } catch (error) {
      console.error('LibSQL get error:', error);
      throw error;
    }
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    if (!this.transaction) {
      this.transaction = await this.client.transaction('write');
    }
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (this.transaction) {
      await this.transaction.commit();
      this.transaction = null;
    }
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (this.transaction) {
      await this.transaction.rollback();
      this.transaction = null;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.transaction) {
      try {
        await this.transaction.close();
      } catch (e) {
        // Ignore close error
      }
      this.transaction = null;
    }
    this.client.close();
  }
}
