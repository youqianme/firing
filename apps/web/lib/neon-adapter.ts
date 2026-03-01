import { Pool, PoolClient } from '@neondatabase/serverless';
import { DatabaseAdapter } from '@firing/data-access';

/**
 * Neon (Postgres) 数据库适配器，支持 Serverless 环境
 */
export class NeonDatabaseAdapter implements DatabaseAdapter {
  private pool: Pool;
  private client: PoolClient | null = null;
  private inTransaction: boolean = false;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  /**
   * 将 SQLite 风格的 SQL (使用 ?) 转换为 Postgres 风格 (使用 $1, $2...)
   * 同时为大小写敏感的标识符添加引号
   */
  private convertSql(sql: string): string {
    let index = 1;
    
    // 第一步：为所有包含大写字母的单词标识符添加双引号
    // 使用更全面的正则表达式，匹配所有包含大写字母的单词
    let converted = sql.replace(/\b([a-z]+[A-Z][a-zA-Z0-9]*)\b/g, (match) => {
      // 避免为 SQL 关键字添加引号
      const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'ORDER', 'BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'HAVING', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT', 'NULL', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CASCADE', 'CREATE', 'TABLE', 'IF', 'EXISTS', 'TEXT', 'DOUBLE', 'PRECISION', 'INTEGER', 'NOT', 'BEGIN', 'COMMIT', 'ROLLBACK', 'ALTER', 'ADD', 'COLUMN'];
      
      if (sqlKeywords.includes(match.toUpperCase())) {
        return match;
      }
      
      return `"${match}"`;
    });
    
    // 第二步：将参数占位符 ? 替换为 $1, $2...
    converted = converted.replace(/\?/g, () => `$${index++}`);
    
    return converted;
  }

  /**
   * 获取当前的数据库连接（事务中复用 Client，否则使用 Pool）
   */
  private async getQueryExecutor(): Promise<Pool | PoolClient> {
    if (this.inTransaction && this.client) {
      return this.client;
    }
    return this.pool;
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async execute(sql: string, params: any[] = []): Promise<any[]> {
    const executor = await this.getQueryExecutor();
    const convertedSql = this.convertSql(sql);
    try {
      const result = await executor.query(convertedSql, params);
      return result.rows;
    } catch (error) {
      console.error('Neon execute error:', error);
      throw error;
    }
  }

  /**
   * 执行 SQL 语句（不返回结果）
   * @param sql SQL 语句
   * @param params 语句参数
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    const executor = await this.getQueryExecutor();
    const convertedSql = this.convertSql(sql);
    try {
      await executor.query(convertedSql, params);
    } catch (error) {
      console.error('Neon run error:', error);
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
    const executor = await this.getQueryExecutor();
    const convertedSql = this.convertSql(sql);
    try {
      const result = await executor.query(convertedSql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Neon get error:', error);
      throw error;
    }
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    if (!this.inTransaction) {
      this.client = await this.pool.connect();
      await this.client.query('BEGIN');
      this.inTransaction = true;
    }
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    if (this.inTransaction && this.client) {
      try {
        await this.client.query('COMMIT');
      } finally {
        if (this.client) {
          this.client.release();
        }
        this.client = null;
        this.inTransaction = false;
      }
    }
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    if (this.inTransaction && this.client) {
      try {
        await this.client.query('ROLLBACK');
      } finally {
        if (this.client) {
          this.client.release();
        }
        this.client = null;
        this.inTransaction = false;
      }
    }
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.inTransaction && this.client) {
      try {
        await this.client.release();
      } catch (e) {
        // Ignore release error
      }
      this.client = null;
      this.inTransaction = false;
    }
    await this.pool.end();
  }
}
