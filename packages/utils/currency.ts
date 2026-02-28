// 直接在文件中定义所需的类型
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';

// 汇率数据（示例，实际应用中可能需要从API获取）
const exchangeRates: Record<Currency, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 20.16,
  KRW: 183.57,
};

/**
 * 将金额从一种货币转换为另一种货币
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // 检查货币类型是否有效
  const fromRate = exchangeRates[fromCurrency as Currency];
  const toRate = exchangeRates[toCurrency as Currency];
  
  if (!fromRate || !toRate) {
    console.warn(`Invalid currency type: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  
  // 先转换为CNY
  const amountInCNY = amount / fromRate;
  // 再转换为目标货币
  return amountInCNY * toRate;
};

/**
 * 格式化大数显示（缩写）
 */
const formatLargeNumber = (num: number): string => {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 100000000) { // 亿
    return `${sign}${(absNum / 100000000).toFixed(2)}亿`;
  } else if (absNum >= 10000) { // 万
    return `${sign}${(absNum / 10000).toFixed(2)}万`;
  }
  
  return `${sign}${absNum.toFixed(2)}`;
};

/**
 * 格式化货币显示
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'CNY',
  options: Intl.NumberFormatOptions = {}
): string => {
  const symbol = getCurrencySymbol(currency);
  
  // 如果数字超过 1 万，使用缩写格式
  if (Math.abs(amount) >= 10000) {
    return `${symbol}${formatLargeNumber(amount)}`;
  }
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  return new Intl.NumberFormat('zh-CN', {
    ...defaultOptions,
    ...options,
  }).format(amount);
};

/**
 * 获取货币符号
 */
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    KRW: '₩',
  };
  
  return symbols[currency] || currency;
};

/**
 * 将所有资产转换为指定货币并求和
 */
export const sumAssetsByCurrency = (
  assets: Array<{ amount: number; currency: string }>,
  targetCurrency: string = 'CNY'
): number => {
  return assets.reduce((sum, asset) => {
    return sum + convertCurrency(asset.amount, asset.currency, targetCurrency);
  }, 0);
};

/**
 * 将所有负债转换为指定货币并求和
 */
export const sumLiabilitiesByCurrency = (
  liabilities: Array<{ amount: number; currency: string }>,
  targetCurrency: string = 'CNY'
): number => {
  return liabilities.reduce((sum, liability) => {
    return sum + convertCurrency(liability.amount, liability.currency, targetCurrency);
  }, 0);
};