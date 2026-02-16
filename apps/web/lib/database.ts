import { DatabaseManager } from '@firing/data-access';
import { WebDatabaseAdapter } from './database-adapter';

// 数据库路径
const DB_PATH = './dev.db';

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