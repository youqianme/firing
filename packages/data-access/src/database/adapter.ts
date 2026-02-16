/**
 * 数据库适配器接口，用于处理不同平台的数据库差异
 */
export interface DatabaseAdapter {
  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  execute(sql: string, params?: any[]): Promise<any[]>;

  /**
   * 执行 SQL 语句（不返回结果）
   * @param sql SQL 语句
   * @param params 语句参数
   */
  run(sql: string, params?: any[]): Promise<void>;

  /**
   * 获取单个查询结果
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 单个查询结果
   */
  get(sql: string, params?: any[]): Promise<any | null>;

  /**
   * 开始事务
   */
  beginTransaction(): Promise<void>;

  /**
   * 提交事务
   */
  commit(): Promise<void>;

  /**
   * 回滚事务
   */
  rollback(): Promise<void>;

  /**
   * 关闭数据库连接
   */
  close(): Promise<void>;
}