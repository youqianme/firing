import { DatabaseManager } from '@firing/data-access';
import { WebDatabaseAdapter } from './database-adapter';
import path from 'path';
import fs from 'fs';

// 数据库路径
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');

// 确保数据库目录存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 全局单例缓存，防止热重载时重复创建连接
let adapter: WebDatabaseAdapter;
let dbManager: DatabaseManager;

// @ts-ignore
if (!global.dbManager) {
  // 创建数据库适配器
  adapter = new WebDatabaseAdapter(DB_PATH);
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