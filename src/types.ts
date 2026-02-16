export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export type AssetType = 'cash' | 'bank' | 'investment' | 'real_estate' | 'other';

export type LiabilityType = 'loan' | 'credit_card' | 'mortgage' | 'other';

export type TransactionType = 'transfer' | 'deposit' | 'withdraw' | 'repayment' | 'borrow' | 'time_deposit_redemption';

export type AccountType = 'bank' | 'investment' | 'cash' | 'other';

export type ValuationMethod = 'MANUAL' | 'MARKET' | 'FIXED';

export type ActivityAction = 'added' | 'updated' | 'deleted' | 'transferred' | 'repayment';

export type ObjectType = 'asset' | 'liability' | 'transaction' | 'account';

export type MarketDataSource = 'MANUAL' | 'AUTO';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currency: Currency;
  amount: number;
  includeInFire: boolean;
  accountId?: string;
  quantity?: number;
  unitPrice?: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  valuationMethod: ValuationMethod;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  currency: Currency;
  balance: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

export interface Payment {
  id: string;
  liabilityId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromAssetId?: string;
  toAssetId?: string;
  amount: number;
  currency: Currency;
  fee?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency?: Currency;
  createdAt: string;
  notes?: string;
}

export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  updatedAt: string;
  source: MarketDataSource;
}

export interface Activity {
  id: string;
  action: ActivityAction;
  objectType: ObjectType;
  objectId: string;
  objectName: string;
  amount: number;
  currency: Currency;
  oldAmount?: number;
  delta?: number;
  notes?: string;
  createdAt: string;
}

export interface FireConfig {
  id: string;
  annualExpense: number;
  swr: number;
  updatedAt: string;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  baseCurrency: Currency;
  privacyMode: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currency: Currency;
}

export interface FireProgress {
  currentFireAssets: number;
  targetFireAssets: number;
  progressPercentage: number;
}
