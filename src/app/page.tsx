'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/helpers';
import { Asset, Liability, Activity, Currency } from '../types';

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
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

  // 加载数据
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 获取用户设置（暂时使用默认值）
        const baseCurrency: Currency = 'CNY';
        setBaseCurrency(baseCurrency);

        // 获取资产和负债
        const [assetsResponse, liabilitiesResponse, activitiesResponse] = await Promise.all([
          fetch('/api/assets'),
          fetch('/api/liabilities'),
          fetch('/api/activity')
        ]);

        const loadedAssets = await assetsResponse.json();
        const loadedLiabilities = await liabilitiesResponse.json();
        const loadedActivities = await activitiesResponse.json();

        setAssets(loadedAssets);
        setLiabilities(loadedLiabilities);
        setActivities(loadedActivities);

        // 计算核心指标
        calculateMetrics(loadedAssets, loadedLiabilities, baseCurrency);

        // 检查缺失的汇率（暂时跳过）
        // checkMissingRates(loadedAssets, loadedLiabilities, baseCurrency);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

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

  // 生成趋势图数据
  function generateTrendData() {
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
  }

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

        {/* 净资产趋势图 */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">净资产趋势</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateTrendData()}>
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