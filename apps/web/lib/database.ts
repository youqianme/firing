import { DatabaseManager, DatabaseAdapter } from '@firing/data-access';
// import { WebDatabaseAdapter } from './database-adapter'; // 移除静态导入，改为动态导入
import { LibsqlDatabaseAdapter } from './libsql-adapter';
import { NeonDatabaseAdapter } from './neon-adapter';
import path from 'path';
import fs from 'fs';

// 全局单例缓存，防止热重载时重复创建连接
let adapter: DatabaseAdapter;
let dbManager: DatabaseManager;

// @ts-ignore
if (!global.dbManager) {
  // 1. 检查是否配置了 Neon / Postgres 环境变量 (Vercel Postgres)
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
  // 3. 默认使用本地 SQLite
  else {
    // 数据库路径
    const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');
    
    // 确保数据库目录存在
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    console.log('Using local SQLite database adapter');
    // 动态导入 WebDatabaseAdapter，避免在 Vercel 环境中加载 better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { WebDatabaseAdapter } = require('./database-adapter');
    adapter = new WebDatabaseAdapter(DB_PATH);
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
