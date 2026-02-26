export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';
export type LiabilityType = 'credit_card' | 'mortgage' | 'car_loan' | 'consumer_loan' | 'other';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  currency: Currency;
  balance: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
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

// 负债类型常量
export const LiabilityType = {
  CREDIT_CARD: 'credit_card' as LiabilityType,
  MORTGAGE: 'mortgage' as LiabilityType,
  CAR_LOAN: 'car_loan' as LiabilityType,
  CONSUMER_LOAN: 'consumer_loan' as LiabilityType,
  OTHER: 'other' as LiabilityType,
} as const;

// 货币常量
export const Currency = {
  CNY: 'CNY' as Currency,
  USD: 'USD' as Currency,
  EUR: 'EUR' as Currency,
  JPY: 'JPY' as Currency,
  KRW: 'KRW' as Currency,
} as const;
