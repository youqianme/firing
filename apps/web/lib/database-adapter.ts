import Database from 'better-sqlite3';
import { DatabaseAdapter } from '@firing/data-access';

/**
 * Web 端数据库适配器，使用 better-sqlite3
 */
export class WebDatabaseAdapter implements DatabaseAdapter {
  private db: Database.Database;
  private inTransaction: boolean = false;

  constructor(dbPath: string) {
    this.db = new Database(dbPath, {
      fileMustExist: false,
      timeout: 5000,
      verbose: null // 禁用冗余日志
    });
    
    // 只在连接建立时配置一次
    try {
      // 启用 WAL 模式以提高并发性能并减少文件锁定冲突
      this.db.pragma('journal_mode = WAL');
      // 调整同步模式为 NORMAL，在保证基本安全的前提下减少磁盘 I/O
      this.db.pragma('synchronous = NORMAL');
    } catch (error) {
      console.warn('Failed to set PRAGMA:', error);
    }
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async execute(sql: string, params?: any[]): Promise<any[]> {
    const statement = this.db.prepare(sql);
    return params ? statement.all(...params) : statement.all();
  }

  /**
   * 执行 SQL 语句（不返回结果）
   * @param sql SQL 语句
   * @param params 语句参数
   */
  async run(sql: string, params?: any[]): Promise<void> {
    const statement = this.db.prepare(sql);
    params ? statement.run(...params) : statement.run();
  }

  /**
   * 获取单个查询结果
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 单个查询结果
   */
  async get(sql: string, params?: any[]): Promise<any | null> {
    const statement = this.db.prepare(sql);
    const result = params ? statement.get(...params) : statement.get();
    return result || null;
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    if (!this.inTransaction) {
      this.db.exec('BEGIN TRANSACTION');
      this.inTransaction = true;
    }
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (this.inTransaction) {
      this.db.exec('COMMIT');
      this.inTransaction = false;
    }
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (this.inTransaction) {
      this.db.exec('ROLLBACK');
      this.inTransaction = false;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    this.db.close();
  }
}