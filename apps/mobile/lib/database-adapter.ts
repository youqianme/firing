import * as SQLite from 'expo-sqlite';
import { DatabaseAdapter } from '@firing/data-access';

/**
 * 移动端数据库适配器，使用 expo-sqlite
 */
export class MobileDatabaseAdapter implements DatabaseAdapter {
  private db: SQLite.SQLiteDatabaseSync;

  constructor(dbName: string) {
    this.db = SQLite.openDatabaseSync(dbName);
  }

  /**
   * 执行 SQL 查询
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async execute(sql: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params || [],
            (_, { rows }) => {
              const result = [];
              for (let i = 0; i < rows.length; i++) {
                result.push(rows.item(i));
              }
              resolve(result);
            },
            (_, error) => {
              console.error('Error executing SQL:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }

  /**
   * 执行 SQL 语句（不返回结果）
   * @param sql SQL 语句
   * @param params 语句参数
   */
  async run(sql: string, params?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params || [],
            () => {
              resolve(void 0);
            },
            (_, error) => {
              console.error('Error executing SQL:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }

  /**
   * 获取单个查询结果
   * @param sql SQL 查询语句
   * @param params 查询参数
   * @returns 单个查询结果
   */
  async get(sql: string, params?: any[]): Promise<any | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          tx.executeSql(
            sql,
            params || [],
            (_, { rows }) => {
              resolve(rows.length > 0 ? rows.item(0) : null);
            },
            (_, error) => {
              console.error('Error executing SQL:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }

  /**
   * 开始事务
   */
  async beginTransaction(): Promise<void> {
    // expo-sqlite 的事务是通过 transaction 方法自动管理的
    // 这里不需要额外实现
  }

  /**
   * 提交事务
   */
  async commit(): Promise<void> {
    // expo-sqlite 的事务是通过 transaction 方法自动管理的
    // 这里不需要额外实现
  }

  /**
   * 回滚事务
   */
  async rollback(): Promise<void> {
    // expo-sqlite 的事务是通过 transaction 方法自动管理的
    // 这里不需要额外实现
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    // expo-sqlite 不需要显式关闭连接
  }
}