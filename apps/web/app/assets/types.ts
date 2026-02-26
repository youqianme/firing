export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';
export type AssetType = 'cash' | 'bank' | 'time_deposit' | 'investment' | 'commodity' | 'real_estate' | 'other';
export type InvestmentSubType = 'stock' | 'fund' | 'gold' | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  subType?: InvestmentSubType;
  currency: Currency;
  amount: number;
  includeInFire: boolean;
  accountId?: string;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  valuationMethod: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}
