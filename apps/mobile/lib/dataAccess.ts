import { dbManager } from './db';
import {
  AssetRepository,
  LiabilityRepository,
  PaymentRepository,
  TransactionRepository,
  FireConfigRepository,
  UserSettingsRepository
} from '@firing/data-access';

// 创建仓库实例
const assetRepository = new AssetRepository(dbManager);
const liabilityRepository = new LiabilityRepository(dbManager);
const paymentRepository = new PaymentRepository(dbManager);
const transactionRepository = new TransactionRepository(dbManager);
const fireConfigRepository = new FireConfigRepository(dbManager);
const userSettingsRepository = new UserSettingsRepository(dbManager);

// 导出仓库实例
export {
  assetRepository,
  liabilityRepository,
  paymentRepository,
  transactionRepository,
  fireConfigRepository,
  userSettingsRepository
};