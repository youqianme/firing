import { Asset, Liability, FireConfig, UserSettings } from '@firing/types';

export const mockAssets: Asset[] = [
  {
    id: 'demo-asset-1',
    name: '招商银行储蓄卡',
    type: 'CASH',
    currency: 'CNY',
    amount: 50000,
    includeInFire: true,
    valuationMethod: 'cost',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-asset-2',
    name: '腾讯控股',
    type: 'STOCK',
    currency: 'HKD',
    amount: 350000,
    quantity: 1000,
    unitPrice: 350,
    includeInFire: true,
    valuationMethod: 'market',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-asset-3',
    name: '自住房产',
    type: 'REAL_ESTATE',
    currency: 'CNY',
    amount: 5000000,
    includeInFire: false,
    valuationMethod: 'manual',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const mockLiabilities: Liability[] = [
  {
    id: 'demo-liability-1',
    name: '房贷',
    type: 'MORTGAGE',
    currency: 'CNY',
    balance: 2000000,
    interestRate: 3.8,
    startDate: '2020-01-01',
    endDate: '2050-01-01',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-liability-2',
    name: '花呗',
    type: 'CREDIT_CARD',
    currency: 'CNY',
    balance: 5000,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

export const mockFireConfig: FireConfig = {
  id: 'demo', // Using 'demo' as the ID for config/settings
  annualExpense: 200000,
  swr: 4.0,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

export const mockUserSettings: UserSettings = {
  id: 'demo',
  baseCurrency: 'CNY',
  privacyMode: false,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};
