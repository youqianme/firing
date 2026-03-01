import { Asset, Liability, FireConfig, UserSettings, Account, Transaction, Payment, MarketData } from '@firing/types';

// 生成日期
const generateDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockAccounts: Account[] = [
  { id: 'demo-account-1', name: '招商银行储蓄账户', type: 'SAVINGS', currency: 'CNY', createdAt: generateDate(365), notes: '主要储蓄账户' },
  { id: 'demo-account-2', name: '富途牛牛股票账户', type: 'BROKERAGE', currency: 'HKD', createdAt: generateDate(180), notes: '港股投资账户' },
  { id: 'demo-account-3', name: '支付宝余额', type: 'E_WALLET', currency: 'CNY', createdAt: generateDate(90), notes: '日常零花钱' }
];

export const mockAssets: Asset[] = [
  {
    id: 'demo-asset-1',
    name: '招商银行储蓄卡',
    type: 'CASH',
    currency: 'CNY',
    amount: 85000,
    includeInFire: true,
    accountId: 'demo-account-1',
    valuationMethod: 'cost',
    updatedAt: generateDate(1),
    createdAt: generateDate(365),
    notes: '紧急备用金和日常资金'
  },
  {
    id: 'demo-asset-2',
    name: '腾讯控股',
    type: 'STOCK',
    currency: 'HKD',
    amount: 420000,
    accountId: 'demo-account-2',
    quantity: 1000,
    unitPrice: 420,
    includeInFire: true,
    valuationMethod: 'market',
    updatedAt: generateDate(1),
    createdAt: generateDate(180),
    notes: '长期持有科技股'
  },
  {
    id: 'demo-asset-3',
    name: '阿里巴巴',
    type: 'STOCK',
    currency: 'HKD',
    amount: 180000,
    accountId: 'demo-account-2',
    quantity: 500,
    unitPrice: 360,
    includeInFire: true,
    valuationMethod: 'market',
    updatedAt: generateDate(1),
    createdAt: generateDate(150),
    notes: '电商龙头'
  },
  {
    id: 'demo-asset-4',
    name: '沪深300指数基金',
    type: 'FUND',
    currency: 'CNY',
    amount: 250000,
    accountId: 'demo-account-1',
    quantity: 10000,
    unitPrice: 25,
    includeInFire: true,
    valuationMethod: 'market',
    updatedAt: generateDate(1),
    createdAt: generateDate(200),
    notes: '宽基指数定投'
  },
  {
    id: 'demo-asset-5',
    name: '3年期定期存款',
    type: 'FIXED_INCOME',
    currency: 'CNY',
    amount: 200000,
    accountId: 'demo-account-1',
    interestRate: 2.65,
    startDate: generateDate(365),
    endDate: generateDate(-730),
    includeInFire: true,
    valuationMethod: 'cost',
    updatedAt: generateDate(1),
    createdAt: generateDate(365),
    notes: '稳健收益'
  },
  {
    id: 'demo-asset-6',
    name: '自住房产',
    type: 'REAL_ESTATE',
    currency: 'CNY',
    amount: 5500000,
    includeInFire: false,
    valuationMethod: 'manual',
    updatedAt: generateDate(1),
    createdAt: generateDate(730),
    notes: '自住，不计入FIRE计算'
  },
  {
    id: 'demo-asset-7',
    name: '支付宝余额',
    type: 'CASH',
    currency: 'CNY',
    amount: 12500,
    includeInFire: true,
    accountId: 'demo-account-3',
    valuationMethod: 'cost',
    updatedAt: generateDate(1),
    createdAt: generateDate(90),
    notes: '日常消费资金'
  }
];

export const mockLiabilities: Liability[] = [
  {
    id: 'demo-liability-1',
    name: '个人住房贷款',
    type: 'MORTGAGE',
    currency: 'CNY',
    balance: 1850000,
    interestRate: 3.8,
    startDate: generateDate(730),
    endDate: generateDate(-10950),
    updatedAt: generateDate(1),
    createdAt: generateDate(730),
    notes: '30年等额本息'
  },
  {
    id: 'demo-liability-2',
    name: '花呗',
    type: 'CREDIT_CARD',
    currency: 'CNY',
    balance: 3200,
    updatedAt: generateDate(1),
    createdAt: generateDate(180),
    notes: '本月账单'
  },
  {
    id: 'demo-liability-3',
    name: '招商银行信用卡',
    type: 'CREDIT_CARD',
    currency: 'CNY',
    balance: 8500,
    interestRate: 18.25,
    updatedAt: generateDate(1),
    createdAt: generateDate(365),
    notes: '主要消费卡'
  },
  {
    id: 'demo-liability-4',
    name: '汽车贷款',
    type: 'LOAN',
    currency: 'CNY',
    balance: 85000,
    interestRate: 4.5,
    startDate: generateDate(365),
    endDate: generateDate(-1095),
    updatedAt: generateDate(1),
    createdAt: generateDate(365),
    notes: '3年期车贷'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'demo-trans-1',
    type: 'TRANSFER',
    fromAssetId: 'demo-asset-7',
    toAssetId: 'demo-asset-1',
    amount: 5000,
    currency: 'CNY',
    date: generateDate(7),
    createdAt: generateDate(7),
    notes: '支付宝转招行'
  },
  {
    id: 'demo-trans-2',
    type: 'BUY',
    toAssetId: 'demo-asset-4',
    amount: 50000,
    currency: 'CNY',
    date: generateDate(30),
    createdAt: generateDate(30),
    notes: '定投沪深300'
  },
  {
    id: 'demo-trans-3',
    type: 'BUY',
    toAssetId: 'demo-asset-3',
    amount: 36000,
    currency: 'HKD',
    fee: 36,
    date: generateDate(60),
    createdAt: generateDate(60),
    notes: '买入阿里巴巴'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'demo-payment-1',
    liabilityId: 'demo-liability-1',
    amount: 9500,
    date: generateDate(15),
    createdAt: generateDate(15),
    notes: '房贷月供'
  },
  {
    id: 'demo-payment-2',
    liabilityId: 'demo-liability-4',
    amount: 3500,
    date: generateDate(10),
    createdAt: generateDate(10),
    notes: '车贷月供'
  }
];

export const mockMarketData: MarketData[] = [
  { id: 'demo-market-1', symbol: 'HKDCNY', price: 0.92, updatedAt: generateDate(1), source: 'MANUAL' },
  { id: 'demo-market-2', symbol: 'USDCNY', price: 7.24, updatedAt: generateDate(1), source: 'MANUAL' },
  { id: 'demo-market-3', symbol: 'EURCNY', price: 7.85, updatedAt: generateDate(1), source: 'MANUAL' }
];

export const mockFireConfig: FireConfig = {
  id: 'demo',
  annualExpense: 180000,
  swr: 4.0,
  updatedAt: generateDate(1),
  createdAt: generateDate(365),
};

export const mockUserSettings: UserSettings = {
  id: 'demo',
  baseCurrency: 'CNY',
  privacyMode: false,
  updatedAt: generateDate(1),
  createdAt: generateDate(365),
};
