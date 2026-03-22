export type AccountType = 'broker' | 'bank' | 'cash' | 'housing_fund' | 'other';
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency?: Currency;
  notes?: string;
  createdAt: string;
}
