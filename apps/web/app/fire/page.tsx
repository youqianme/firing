'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';
import { useUser } from '../context/UserContext';

export default function FirePage() {
  const { userId } = useUser();
  const [fireConfig, setFireConfig] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    annualExpense: 0,
    swr: 4
  });

  // 加载数据
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  // 加载数据
  async function loadData() {
    try {
      setIsLoading(true);

      const headers = { 'x-user-id': userId };

      // 通过 API 获取 FIRE 配置
      const configResponse = await fetch('/api/fire', { headers });
      const loadedConfig = await configResponse.json();
      setFireConfig(loadedConfig);

      if (loadedConfig) {
        setFormData({
          annualExpense: loadedConfig.annualExpense,
          swr: loadedConfig.swr * 100 // 转换为百分比
        });
      }

      // 通过 API 获取资产
      const assetsResponse = await fetch('/api/assets', { headers });
      const loadedAssets = await assetsResponse.json();
      setAssets(Array.isArray(loadedAssets) ? loadedAssets : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 处理表单输入变化
  function handleInputChange(e: any) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  }

  // 提交 FIRE 配置
  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      if (formData.annualExpense <= 0) {
        alert('年支出必须大于 0');
        return;
      }

      if (formData.swr <= 0 || formData.swr > 20) {
        alert('安全提取率必须在 0-20% 之间');
        return;
      }

      // 通过 API 保存配置
      const response = await fetch('/api/fire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          annualExpense: formData.annualExpense,
          swr: formData.swr / 100 // 转换为小数
        }),
      });

      const updatedConfig = await response.json();
      setFireConfig(updatedConfig);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save FIRE config:', error);
    }
  }

  // 计算 FIRE 目标资产
  function calculateFireTarget(): number {
    if (!fireConfig) return 0;
    return fireConfig.annualExpense / fireConfig.swr;
  }

  // 计算当前 FIRE 资产
  function calculateCurrentFireAssets(): number {
    let total = 0;
    const safeAssets = Array.isArray(assets) ? assets : [];
    for (const asset of safeAssets) {
      if (asset.includeInFire) {
        total += asset.amount;
      }
    }
    return total;
  }

  // 计算 FIRE 进度
  function calculateFireProgress(): number {
    const target = calculateFireTarget();
    if (target === 0) return 0;
    const current = calculateCurrentFireAssets();
    return Math.min(100, (current / target) * 100);
  }

  // 计算距离目标的差额
  function calculateFireGap(): number {
    const target = calculateFireTarget();
    const current = calculateCurrentFireAssets();
    return target - current;
  }

  // 获取计入 FIRE 的资产列表
  function getFireIncludedAssets(): any[] {
    const safeAssets = Array.isArray(assets) ? assets : [];
    return safeAssets.filter(asset => asset.includeInFire);
  }

  // 获取未计入 FIRE 的资产列表
  function getFireExcludedAssets(): any[] {
    const safeAssets = Array.isArray(assets) ? assets : [];
    return safeAssets.filter(asset => !asset.includeInFire);
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

  const fireTarget = calculateFireTarget();
  const currentFireAssets = calculateCurrentFireAssets();
  const fireProgress = calculateFireProgress();
  const fireGap = calculateFireGap();
  const fireIncludedAssets = getFireIncludedAssets();
  const fireExcludedAssets = getFireExcludedAssets();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">FIRE 目标</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {isEditing ? '取消' : '编辑设置'}
          </button>
        </div>

        {/* FIRE 进度卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">FIRE 进度</h2>
              <p className="text-4xl font-bold text-blue-600">
                {fireProgress.toFixed(1)}%
              </p>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              目标: {formatCurrency(fireTarget / 10000, 'CNY')} 万
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-slate-200 rounded-full h-4 mb-8">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${fireProgress}%` }}
            ></div>
          </div>

          {/* 指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">当前 FIRE 资产</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(currentFireAssets, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">年度支出</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(fireConfig?.annualExpense || 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">距离目标</h3>
              <p className={`text-2xl font-bold ${fireGap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {fireGap > 0 ? `+${formatCurrency(fireGap, 'CNY')}` : formatCurrency(Math.abs(fireGap), 'CNY')}
              </p>
            </div>
          </div>
        </div>

        {/* FIRE 配置表单 */}
        {isEditing && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">FIRE 设置</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    年度支出 (元)
                  </label>
                  <input
                    type="number"
                    name="annualExpense"
                    value={formData.annualExpense}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    安全提取率 (%)
                  </label>
                  <input
                    type="number"
                    name="swr"
                    value={formData.swr}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    step="0.1"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-sm text-slate-500 mt-1">
                    默认值: 4%
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  保存设置
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FIRE 资产明细 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">FIRE 资产明细</h2>
          </div>

          {/* 计入 FIRE 的资产 */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4">计入 FIRE 的资产</h3>
            {fireIncludedAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                暂无计入 FIRE 的资产
              </div>
            ) : (
              <div className="space-y-4">
                {fireIncludedAssets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{asset.name}</h4>
                      <p className="text-sm text-slate-500">{asset.type}</p>
                    </div>
                    <div className="font-medium text-slate-900">
                      {formatCurrency(asset.amount, asset.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 未计入 FIRE 的资产 */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">未计入 FIRE 的资产</h3>
            {fireExcludedAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                暂无未计入 FIRE 的资产
              </div>
            ) : (
              <div className="space-y-4">
                {fireExcludedAssets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{asset.name}</h4>
                      <p className="text-sm text-slate-500">{asset.type}</p>
                    </div>
                    <div className="font-medium text-slate-900">
                      {formatCurrency(asset.amount, asset.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-100">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">关于 FIRE</h3>
          <p className="text-yellow-700 mb-4">
            FIRE (Financial Independence, Retire Early) 是一种生活方式，通过积累足够的资产，
            使其产生的被动收入能够覆盖生活支出，从而实现财务自由和提前退休。
          </p>
          <p className="text-yellow-700">
            计算公式: 目标资产 = 年支出 / 安全提取率 (通常为 4%)
          </p>
        </div>
      </main>
    </div>
  );
}
