// 资产类型
export interface Asset {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: number;
  includeInFire: boolean;
  accountId?: string;
  quantity?: number;
  unitPrice?: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  valuationMethod: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

// 负债类型
export interface Liability {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

// 还款记录类型
export interface Payment {
  id: string;
  liabilityId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// 交易类型
export interface Transaction {
  id: string;
  type: string;
  fromAssetId?: string;
  toAssetId?: string;
  amount: number;
  currency: string;
  fee?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// 账户类型
export interface Account {
  id: string;
  name: string;
  type: string;
  currency?: string;
  createdAt: string;
  notes?: string;
}

// 市场数据类型
export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  updatedAt: string;
  source: string;
}

// 活动类型
export interface Activity {
  id: string;
  action: string;
  objectType: string;
  objectId: string;
  objectName: string;
  amount: number;
  currency: string;
  oldAmount?: number;
  delta?: number;
  notes?: string;
  createdAt: string;
}

// FIRE配置类型
export interface FireConfig {
  id: string;
  annualExpense: number;
  swr: number;
  updatedAt: string;
  createdAt: string;
}

// 用户设置类型
export interface UserSettings {
  id: string;
  baseCurrency: string;
  privacyMode: boolean;
  updatedAt: string;
  createdAt: string;
}