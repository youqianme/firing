'use client';

import { useEffect, useState, useMemo } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from './context/UserContext';
import { convertCurrency, formatCurrency, Currency } from '@firing/utils';
import { formatDate } from '@firing/utils';
import { Asset, Liability, Activity, FireConfig } from '@firing/types';

export default function Home() {
  const { userId } = useUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fireConfig, setFireConfig] = useState<FireConfig | null>(null);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState<Currency>('CNY');
  const [isLoading, setIsLoading] = useState(true);
  const [missingRates, setMissingRates] = useState<string[]>([]);

  // 获取活动类型文本
  function getActivityActionText(action: string): string {
    const actionMap: Record<string, string> = {
      'CREATE': '创建',
      'UPDATE': '更新',
      'DELETE': '删除',
      'TRANSFER': '转账',
      'REPAYMENT': '还款',
      'REDEEM': '兑付'
    };
    return actionMap[action] || action;
  }

  // 获取 FIRE 里程碑
  function getFireMilestone(progress: number) {
    if (progress >= 100) return { title: '财务自由', description: '恭喜！您已达成 FIRE 目标，享受自由人生！', color: 'text-green-600', bg: 'bg-green-100' };
    if (progress >= 80) return { title: '最后冲刺', description: '胜利在望，财务自由近在咫尺！', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (progress >= 50) return { title: '半山腰', description: '已经完成一半了，继续保持！', color: 'text-indigo-600', bg: 'bg-indigo-100' };
    if (progress >= 25) return { title: '稳步积累', description: '积少成多，复利效应开始显现。', color: 'text-purple-600', bg: 'bg-purple-100' };
    return { title: '起步阶段', description: '千里之行，始于足下。', color: 'text-slate-600', bg: 'bg-slate-100' };
  }

  // 加载数据
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function loadData() {
      try {
        setIsLoading(true);

        // 获取用户设置（暂时使用默认值）
        const baseCurrency: Currency = 'CNY';
        setBaseCurrency(baseCurrency);

        const headers = { 'x-user-id': userId };

        // 获取资产和负债
        const [assetsResponse, liabilitiesResponse, activitiesResponse, fireConfigResponse] = await Promise.all([
          fetch('/api/assets', { signal, headers }),
          fetch('/api/liabilities', { signal, headers }),
          fetch('/api/activity', { signal, headers }),
          fetch('/api/fire', { signal, headers })
        ]);

        const loadedAssets = await assetsResponse.json();
        const loadedLiabilities = await liabilitiesResponse.json();
        const loadedActivities = await activitiesResponse.json();
        const loadedFireConfig = await fireConfigResponse.json();

        if (!signal.aborted) {
          setAssets(loadedAssets);
          setLiabilities(loadedLiabilities);
          setActivities(loadedActivities);
          setFireConfig(loadedFireConfig);

          // 计算核心指标
          calculateMetrics(loadedAssets, loadedLiabilities, baseCurrency);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load data:', error);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [userId]);

  // 计算核心指标
  function calculateMetrics(assets: Asset[], liabilities: Liability[], currency: Currency) {
    let totalAssetsValue = 0;
    let totalLiabilitiesValue = 0;

    // 计算总资产
    for (const asset of assets) {
      totalAssetsValue += convertCurrency(asset.amount, asset.currency, currency);
    }

    // 计算总负债
    for (const liability of liabilities) {
      const liabilityAmount = liability.balance || 0;
      totalLiabilitiesValue += convertCurrency(liabilityAmount, liability.currency, currency);
    }

    const netWorthValue = totalAssetsValue - totalLiabilitiesValue;

    setTotalAssets(totalAssetsValue);
    setTotalLiabilities(totalLiabilitiesValue);
    setNetWorth(netWorthValue);
  }

  // 检查缺失的汇率
  function checkMissingRates(assets: Asset[], liabilities: Liability[], currency: Currency) {
    const requiredRates = new Set<string>();

    // 检查资产币种
    for (const asset of assets) {
      if (asset.currency !== currency) {
        const rateSymbol = `${asset.currency}${currency}`;
        // 暂时跳过汇率检查，因为marketDataRepository还未实现
        // const rate = marketDataRepository.getBySymbol(rateSymbol);
        // if (!rate) {
        //   requiredRates.add(rateSymbol);
        // }
      }
    }

    // 检查负债币种
    for (const liability of liabilities) {
      if (liability.currency !== currency) {
        const rateSymbol = `${liability.currency}${currency}`;
        // 暂时跳过汇率检查，因为marketDataRepository还未实现
        // const rate = marketDataRepository.getBySymbol(rateSymbol);
        // if (!rate) {
        //   requiredRates.add(rateSymbol);
        // }
      }
    }

    setMissingRates(Array.from(requiredRates));
  }

  // 计算 FIRE 相关数据
  const fireMetrics = useMemo(() => {
    if (!fireConfig) return null;

    const target = fireConfig.annualExpense / fireConfig.swr;
    
    let current = 0;
    for (const asset of assets) {
      if (asset.includeInFire) {
        current += convertCurrency(asset.amount, asset.currency, baseCurrency);
      }
    }

    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const gap = target - current;

    return {
      target,
      current,
      progress,
      gap
    };
  }, [assets, fireConfig, baseCurrency]);

  // 生成趋势图数据
  const trendData = useMemo(() => {
    // 这里简化处理，实际应该从数据库获取历史数据
    const today = new Date();
    const data = [];

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // 模拟数据，实际应该从历史记录计算
      const value = netWorth * (0.9 + Math.random() * 0.2);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value
      });
    }

    return data;
  }, [netWorth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">总览</h1>
          <div className="flex items-center space-x-4">
            <a href="/fire" className="text-sm text-blue-600 hover:underline flex items-center">
              <span className="mr-1">🔥</span>
              FIRE 设置
            </a>
            <div className="text-sm text-slate-500">
              汇率: {baseCurrency === 'CNY' ? 'CNY' : 'USD'}
            </div>
            {missingRates.length > 0 && (
              <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                缺少汇率: {missingRates.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-2">总资产</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalAssets, baseCurrency)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-2">总负债</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities, baseCurrency)}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-2">净资产</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(netWorth, baseCurrency)}
            </div>
          </div>
        </div>

        {/* FIRE 进度卡片 */}
        {fireMetrics && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-50 -mr-8 -mt-8"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <span className="mr-2 text-2xl">🔥</span>
                  FIRE 进度
                </h2>
                <div className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                  目标: {formatCurrency(fireMetrics.target, baseCurrency)}
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getFireMilestone(fireMetrics.progress).bg} ${getFireMilestone(fireMetrics.progress).color}`}>
                      {getFireMilestone(fireMetrics.progress).title}
                    </span>
                    <span className="text-sm text-slate-500">
                      {getFireMilestone(fireMetrics.progress).description}
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    {fireMetrics.progress.toFixed(1)}%
                  </div>
                </div>
                
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${fireMetrics.progress}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/30 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">当前 FIRE 资产</div>
                  <div className="font-bold text-slate-900 text-lg">
                    {formatCurrency(fireMetrics.current, baseCurrency)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">年度支出</div>
                  <div className="font-bold text-slate-900 text-lg">
                    {formatCurrency(fireConfig?.annualExpense || 0, baseCurrency)}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">安全提取率</div>
                  <div className="font-bold text-slate-900 text-lg">
                    {((fireConfig?.swr || 0.04) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">距离目标</div>
                  <div className={`font-bold text-lg ${fireMetrics.gap > 0 ? 'text-slate-900' : 'text-green-600'}`}>
                    {fireMetrics.gap > 0 ? formatCurrency(fireMetrics.gap, baseCurrency) : '已达成'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 净资产趋势图 */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">净资产趋势</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(value) => formatCurrency(value, baseCurrency).replace(/[^0-9]/g, '')}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number, baseCurrency), '净资产']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 最近动态 */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">最近动态</h2>
          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              暂无动态，去新增一笔资产或负债吧
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-3 hover:bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-slate-900">
                      {activity.objectName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getActivityActionText(activity.action)}
                      • {formatDateTime(activity.createdAt)}
                    </div>
                  </div>
                  <div className={`font-medium ${activity.delta && activity.delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {activity.delta ? (
                      activity.delta > 0 ? `+${formatCurrency(activity.delta, activity.currency)}` : 
                      formatCurrency(Math.abs(activity.delta), activity.currency)
                    ) : (
                      formatCurrency(activity.amount, activity.currency)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 空状态引导 */}
        {assets.length === 0 && liabilities.length === 0 && (
          <div className="mt-8 bg-blue-50 rounded-xl p-8 border border-blue-100 text-center">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">欢迎使用有钱么</h3>
            <p className="text-blue-700 mb-6">开始管理您的资产和负债，获得清晰的财务全景</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/assets" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                添加资产
              </a>
              <a href="/liabilities" className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                添加负债
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 格式化日期时间
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}