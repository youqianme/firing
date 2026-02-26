export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';
export type Activity = {
  id: string;
  action: string;
  objectType: string;
  objectId: string;
  objectName: string;
  amount: number;
  currency: Currency;
  delta?: number;
  oldAmount?: number;
  notes?: string;
  createdAt: string;
};
