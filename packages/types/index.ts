// 资产类型
export interface Asset {
  id: string;
  name: string;
  type: string;
  subType?: string;
  currency: string;
  amount: number;
  includeInFire: boolean;
  accountId?: string;
  quantity?: number;
  unitPrice?: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  valuationMethod: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

// 负债类型
export interface Liability {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
  interestRate?: number;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  createdAt: string;
  notes?: string;
}

// 还款记录类型
export interface Payment {
  id: string;
  liabilityId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// 交易类型
export interface Transaction {
  id: string;
  type: string;
  fromAssetId?: string;
  toAssetId?: string;
  amount: number;
  currency: string;
  fee?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// 账户类型
export interface Account {
  id: string;
  name: string;
  type: string;
  currency?: string;
  createdAt: string;
  notes?: string;
}

// 市场数据类型
export interface MarketData {
  id: string;
  symbol: string;
  price: number;
  updatedAt: string;
  source: 'MANUAL' | 'AUTO';
}

// 活动类型
export interface Activity {
  id: string;
  action: string;
  objectType: string;
  objectId: string;
  objectName: string;
  amount: number;
  currency: string;
  oldAmount?: number;
  delta?: number;
  notes?: string;
  createdAt: string;
}

// FIRE成员类型（支持家庭多成员）
export interface FireMember {
  id: string;
  userId: string;              // 所属用户
  name: string;                // 成员姓名
  gender: 'male' | 'female';   // 性别
  birthDate: string;           // 出生日期
  retirementAge: number;       // 退休年龄（根据性别自动估算，但可手动修改）
  monthlyExpense: number;      // 每月支出
  targetRetirementAsset: number; // 退休时目标资产
  updatedAt: string;
  createdAt: string;
}

// FIRE成员计算结果
export interface FireMemberCalculation {
  memberId: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  retirementAge: number;       // 根据性别自动计算的退休年龄
  monthsToRetirement: number;  // 距离退休月数
  monthlyExpense: number;
  targetRetirementAsset: number;
  personalTotalNeeded: number; // 个人所需 = 月支出 × 距离退休月数 + 退休目标资产
}

// FIRE家庭计算结果
export interface FireCalculation {
  members: FireMemberCalculation[];  // 各成员计算结果
  totalMonthlyExpense: number;       // 家庭月支出总计
  totalNeeded: number;               // 家庭总需求
  currentFireAssets: number;         // 当前FIRE资产
  totalLiabilities: number;          // 总负债
  netWorth: number;                  // 净资产 = 资产 - 负债
  fireProgress: number;              // 总体进度（基于净资产）
  fireGap: number;                   // 距离目标差额
}

// 用户设置类型
export interface UserSettings {
  id: string;
  baseCurrency: string;
  privacyMode: boolean;
  updatedAt: string;
  createdAt: string;
}
