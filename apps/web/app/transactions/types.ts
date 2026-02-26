export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';
export type AssetType = 'cash' | 'bank' | 'time_deposit' | 'investment' | 'commodity' | 'real_estate' | 'other';
export type TransactionType = 'transfer' | 'redeem';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currency: Currency;
  amount: number;
  includeInFire: boolean;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromAssetId?: string;
  toAssetId?: string;
  amount: number;
  currency: Currency;
  date: string;
  notes?: string;
  createdAt: string;
}

// 资产类型常量
export const AssetType = {
  CASH: 'cash' as AssetType,
  TIME_DEPOSIT: 'bank' as AssetType,
  TIME_DEPOSIT_ALT: 'time_deposit' as AssetType,
  STOCK: 'investment' as AssetType,
  FUND: 'investment' as AssetType,
  GOLD: 'investment' as AssetType,
  COMMODITY: 'commodity' as AssetType,
  REAL_ESTATE: 'real_estate' as AssetType,
  VEHICLE: 'other' as AssetType,
  LUXURY: 'other' as AssetType,
} as const;

// 交易类型常量
export const TransactionType = {
  TRANSFER: 'transfer' as TransactionType,
  REDEEM: 'redeem' as TransactionType,
} as const;
