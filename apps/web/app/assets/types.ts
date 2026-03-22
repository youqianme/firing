export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';
export type AssetType = 'cash' | 'bank' | 'time_deposit' | 'investment' | 'commodity' | 'real_estate' | 'housing_fund' | 'other';
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

export type HousingFundRecordType = 'deposit' | 'withdraw' | 'interest';

export interface HousingFundRecord {
  id: string;
  assetId: string;
  type: HousingFundRecordType;
  amount: number;
  personalAmount: number;
  companyAmount: number;
  date: string;
  reason?: string;
  notes?: string;
  createdAt: string;
}
