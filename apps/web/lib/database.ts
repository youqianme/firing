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

// 创建数据库适配器
const adapter = new WebDatabaseAdapter(DB_PATH);

// 创建数据库管理器
const dbManager = DatabaseManager.getInstance(adapter);

// 初始化数据库
export const initializeDatabase = async () => {
  await dbManager.initialize();
};

// 导出数据库管理器
export { dbManager };