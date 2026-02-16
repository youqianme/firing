import { DatabaseManager } from '@firing/data-access';
import { MobileDatabaseAdapter } from './database-adapter';

const DATABASE_NAME = 'youqianme.db';

// 创建数据库适配器
const adapter = new MobileDatabaseAdapter(DATABASE_NAME);

// 创建数据库管理器
const dbManager = DatabaseManager.getInstance(adapter);

// 初始化数据库
export const initDatabase = async () => {
  await dbManager.initialize();
};

// 导出数据库管理器
export { dbManager };