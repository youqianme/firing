import { format, parseISO, isValid } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date, formatString: string = 'yyyy-MM-dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '无效日期';
    }
    return format(dateObj, formatString, { locale: zhCN });
  } catch (error) {
    return '无效日期';
  }
};

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * 格式化相对时间
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '无效日期';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return '刚刚';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    return '无效日期';
  }
};

/**
 * 生成唯一ID（简单实现，实际应用中可能需要更复杂的方案）
 */
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

/**
 * 计算两个日期之间的天数差
 */
export const getDaysDiff = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    if (!isValid(start) || !isValid(end)) {
      return 0;
    }
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return 0;
  }
};

/**
 * 计算FIRE目标金额
 */
export const calculateFireTarget = (annualExpense: number, safeWithdrawalRate: number): number => {
  return annualExpense / (safeWithdrawalRate / 100);
};

/**
 * 计算FIRE进度百分比
 */
export const calculateFireProgress = (currentAssets: number, targetAssets: number): number => {
  if (targetAssets === 0) return 0;
  const progress = (currentAssets / targetAssets) * 100;
  return Math.min(progress, 100); // 最多100%
};

/**
 * 截断长字符串
 */
export const truncateString = (str: string, maxLength: number = 20): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * 格式化数字（添加千位分隔符）
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};
