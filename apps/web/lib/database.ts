import { DatabaseManager, DatabaseAdapter } from '@firing/data-access';
import { LibsqlDatabaseAdapter } from './libsql-adapter';
import { NeonDatabaseAdapter } from './neon-adapter';

// 全局单例缓存，防止热重载时重复创建连接
let adapter: DatabaseAdapter;
let dbManager: DatabaseManager;

// @ts-ignore
if (!global.dbManager) {
  // 1. 优先使用 Neon / Postgres (默认选项)
  if (process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL) {
    const connectionString = process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || '';
    console.log('Using Neon (Postgres) database adapter');
    adapter = new NeonDatabaseAdapter(connectionString);
  }
  // 2. 检查是否配置了 LibSQL/Turso 环境变量
  else if (process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL) {
    const url = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL || '';
    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;
    console.log('Using LibSQL/Turso database adapter');
    adapter = new LibsqlDatabaseAdapter(url, authToken);
  } 
  // 3. 如果都没有配置，抛出错误
  else {
    throw new Error('No database configuration found. Please set POSTGRES_URL or NEON_DATABASE_URL or TURSO_DATABASE_URL');
  }

  // 创建数据库管理器
  dbManager = DatabaseManager.getInstance(adapter);
  // @ts-ignore
  global.dbManager = dbManager;
} else {
  // @ts-ignore
  dbManager = global.dbManager;
}

// 初始化数据库
export const initializeDatabase = async () => {
  await dbManager.initialize();
};

// 导出数据库管理器
export { dbManager };
