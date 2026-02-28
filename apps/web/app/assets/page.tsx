'use client';

import { useEffect, useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { convertCurrency, formatCurrency } from '@firing/utils';
import { formatDate } from '@firing/utils';
import { Currency, AssetType, InvestmentSubType, type Asset } from './types';

export default function AssetsPage() {
  const { userId } = useUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as AssetType,
    subType: 'stock' as InvestmentSubType | undefined,
    currency: 'CNY' as Currency,
    amount: 0,
    includeInFire: true,
    accountId: '',
    interestRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  // 加载数据
  useEffect(() => {
    if (!userId) return;

    // 组件挂载后立即设置isAdding状态为false
    setIsAdding(false);

    const controller = new AbortController();
    const signal = controller.signal;
    const headers = { 'x-user-id': userId };

    async function loadData() {
      try {
        setIsLoading(true);

        // 获取资产和账户
        const [assetsResponse, accountsResponse] = await Promise.all([
          fetch('/api/assets', { signal, headers }),
          fetch('/api/accounts', { signal, headers })
        ]);

        const loadedAssets = await assetsResponse.json();
        const loadedAccounts = await accountsResponse.json();

        if (!signal.aborted) {
          setAssets(loadedAssets);
          setAccounts(loadedAccounts);
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

  // 处理表单输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'interestRate' ? parseFloat(value) || 0 : value
    }));

    // 自动计算到期日（定期存款）
    if (name === 'type' && value === 'bank') {
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }

  // 处理资产类型变化
  function handleAssetTypeChange(type: AssetType, subType?: InvestmentSubType) {
    setFormData(prev => ({
      ...prev,
      type,
      subType: type === 'investment' ? (subType || 'stock') : undefined,
      includeInFire: type === 'real_estate' || type === 'other' ? false : true
    }));
  }

  // 提交表单
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingAsset) {
        // 更新资产
        const updatedAssetData = {
          name: formData.name,
          type: formData.type,
          subType: formData.type === 'investment' ? formData.subType : undefined,
          currency: formData.currency,
          amount: formData.amount,
          includeInFire: formData.includeInFire,
          accountId: formData.accountId || undefined,
          interestRate: formData.type === 'bank' ? formData.interestRate : undefined,
          startDate: formData.type === 'bank' ? formData.startDate : undefined,
          endDate: formData.type === 'bank' ? formData.endDate : undefined,
          valuationMethod: 'MANUAL',
          notes: formData.notes || undefined
        };

        const response = await fetch(`/api/assets/${editingAsset.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(updatedAssetData),
        });

        if (response.ok) {
          const updatedAsset = await response.json();
          // 更新列表
          setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
          setEditingAsset(null);
          setIsAdding(false);
          resetForm();
        } else {
          throw new Error('Failed to update asset');
        }
      } else {
        // 创建资产
        const newAssetData = {
          name: formData.name,
          type: formData.type,
          subType: formData.type === 'investment' ? formData.subType : undefined,
          currency: formData.currency,
          amount: formData.amount,
          includeInFire: formData.includeInFire,
          accountId: formData.accountId || undefined,
          interestRate: formData.type === 'bank' ? formData.interestRate : undefined,
          startDate: formData.type === 'bank' ? formData.startDate : undefined,
          endDate: formData.type === 'bank' ? formData.endDate : undefined,
          valuationMethod: 'MANUAL',
          notes: formData.notes || undefined
        };

        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId
          },
          body: JSON.stringify(newAssetData),
        });

        if (response.ok) {
          const newAsset = await response.json();
          // 更新列表
          setAssets(prev => [newAsset, ...prev]);
          setIsAdding(false);
          resetForm();
        } else {
          throw new Error('Failed to create asset');
        }
      }
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  }

  // 重置表单
  function resetForm() {
    setFormData({
      name: '',
      type: 'cash' as AssetType,
      subType: 'stock' as InvestmentSubType,
      currency: 'CNY' as Currency,
      amount: 0,
      includeInFire: true,
      accountId: '',
      interestRate: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    });
  }

  // 编辑资产
  function handleEdit(asset: Asset) {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      subType: asset.subType || 'stock',
      currency: asset.currency,
      amount: asset.amount,
      includeInFire: asset.includeInFire,
      accountId: asset.accountId || '',
      interestRate: asset.interestRate || 0,
      startDate: asset.startDate || new Date().toISOString().split('T')[0],
      endDate: asset.endDate || '',
      notes: asset.notes || ''
    });
    // 直接设置isAdding为true
    setIsAdding(true);
  }

  // 删除资产
  async function handleDelete(asset: Asset) {
    if (confirm(`确定要删除资产 "${asset.name}" 吗？`)) {
      try {
        // 通过 API 删除资产
        const response = await fetch(`/api/assets/${asset.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': userId }
        });

        if (response.ok) {
          // 更新列表
          setAssets(prev => prev.filter(a => a.id !== asset.id));
        } else {
          throw new Error('Failed to delete asset');
        }
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  }

  // 计算定期存款的到期天数
  function getDaysUntilMaturity(endDate?: string) {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.max(0, end.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // 计算定期存款的利息
  function calculateInterest(principal: number, interestRate?: number, startDate?: string, endDate?: string) {
    if (!interestRate || !startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
    
    const interest = principal * (interestRate / 100) * diffYears;
    return interest;
  }

  // 获取账户名称
  function getAccountName(accountId?: string) {
    if (!accountId) return '未指定';
    const account = accounts.find(a => a.id === accountId);
    return account?.name || '未指定';
  }

  // 过滤资产
  const filteredAssets = useMemo(() => {
    switch (activeFilter) {
      case 'cash':
        return assets.filter(asset => asset.type === 'cash');
      case 'bank':
        return assets.filter(asset => asset.type === 'bank');
      case 'investment':
        return assets.filter(asset => asset.type === 'investment');
      case 'real_estate':
        return assets.filter(asset => asset.type === 'real_estate');
      case 'other':
        return assets.filter(asset => asset.type === 'other');
      default:
        return assets;
    }
  }, [assets, activeFilter]);

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
          <h1 className="text-3xl font-bold text-slate-900">资产管理</h1>
          <button
            onClick={() => {
              // 直接设置isAdding为true
              setIsAdding(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增资产
          </button>
        </div>

        {/* 资产类型筛选 */}
        {!isAdding && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                全部资产
              </button>
              <button 
                onClick={() => setActiveFilter('cash')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'cash' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                现金
              </button>
              <button 
                onClick={() => setActiveFilter('bank')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'bank' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                定期
              </button>
              <button 
                onClick={() => setActiveFilter('investment')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'investment' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                投资
              </button>
              <button 
                onClick={() => setActiveFilter('real_estate')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'real_estate' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                房产
              </button>
              <button 
                onClick={() => setActiveFilter('other')}
                className={`px-4 py-2 rounded-lg ${activeFilter === 'other' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                其他
              </button>
            </div>
          </div>
        )}

        {/* 新增/编辑资产表单 */}
        {isAdding && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {editingAsset ? '编辑资产' : '新增资产'}
            </h2>

            {/* 资产类型选择 */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {[
                { type: 'cash' as AssetType, icon: '💵', label: '现金' },
                { type: 'bank' as AssetType, icon: '📅', label: '定期' },
                { type: 'investment' as AssetType, subType: 'stock' as InvestmentSubType, icon: '📈', label: '股票' },
                { type: 'investment' as AssetType, subType: 'fund' as InvestmentSubType, icon: '💰', label: '基金' },
                { type: 'investment' as AssetType, subType: 'gold' as InvestmentSubType, icon: '🥇', label: '黄金' },
                { type: 'real_estate' as AssetType, icon: '🏠', label: '房产' },
                { type: 'other' as AssetType, icon: '🚗', label: '车辆' },
                { type: 'other' as AssetType, icon: '💎', label: '奢侈品' }
              ].map(({ type, subType, icon, label }) => (
                <button
                  key={type + label}
                  onClick={() => handleAssetTypeChange(type, subType)}
                  className={`p-4 border rounded-lg flex flex-col items-center ${formData.type === type && (type !== 'investment' || formData.subType === subType) ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-lg mb-2">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    币种
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CNY">人民币 (CNY)</option>
                    <option value="USD">美元 (USD)</option>
                    <option value="EUR">欧元 (EUR)</option>
                    <option value="JPY">日元 (JPY)</option>
                    <option value="KRW">韩元 (KRW)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    金额
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    关联账户
                  </label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">未指定</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 定期存款专属字段 */}
              {formData.type === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      年化利率 (%)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      value={formData.interestRate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      起息日
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      到期日
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* FIRE 设置 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="includeInFire"
                  checked={formData.includeInFire}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeInFire: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-700">
                  计入 FIRE 资产
                </label>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              {/* 提交按钮 */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingAsset ? '保存修改' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAsset(null);
                    resetForm();
                  }}
                  className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 资产列表 - 桌面端表格 */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    账户
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {asset.name}
                      </div>
                      {asset.type === 'bank' && asset.endDate && (
                        <div className="text-sm text-slate-500">
                          到期日: {formatDate(asset.endDate)} • 剩余 {getDaysUntilMaturity(asset.endDate)} 天
                        </div>
                      )}
                      {asset.type === 'bank' && asset.interestRate && asset.startDate && asset.endDate && (
                        <div className="text-sm text-green-600">
                          预计利息: {formatCurrency(calculateInterest(asset.amount, asset.interestRate, asset.startDate, asset.endDate), asset.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {asset.type === 'cash' ? '现金' :
                         asset.type === 'bank' || asset.type === 'time_deposit' ? '定期' :
                         asset.type === 'investment' || asset.type === 'commodity' ? 
                           (asset.subType === 'stock' ? '股票' :
                            asset.subType === 'fund' ? '基金' :
                            asset.subType === 'gold' ? '黄金' : '投资') :
                         asset.type === 'real_estate' ? '房产' :
                         asset.type === 'other' ? '其他' : asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {getAccountName(asset.accountId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-medium text-slate-900">
                        {formatCurrency(asset.amount, asset.currency)}
                      </div>
                      {asset.includeInFire && (
                        <div className="text-sm text-green-600">
                          计入 FIRE
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(asset)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(asset)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 资产列表 - 移动端卡片视图 */}
        <div className="md:hidden space-y-4">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-slate-900 text-lg">{asset.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{getAccountName(asset.accountId)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-lg">
                    {formatCurrency(asset.amount, asset.currency)}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {asset.type === 'cash' ? '现金' :
                     asset.type === 'bank' || asset.type === 'time_deposit' ? '定期' :
                     asset.type === 'investment' || asset.type === 'commodity' ? 
                       (asset.subType === 'stock' ? '股票' :
                        asset.subType === 'fund' ? '基金' :
                        asset.subType === 'gold' ? '黄金' : '投资') :
                     asset.type === 'real_estate' ? '房产' :
                     asset.type === 'other' ? '其他' : asset.type}
                  </span>
                </div>
              </div>
              
              {/* 额外信息 */}
              {(asset.includeInFire || (asset.type === 'bank' && asset.endDate)) && (
                <div className="mb-3 text-sm space-y-1 bg-slate-50 p-2 rounded-lg">
                  {asset.includeInFire && (
                    <div className="text-green-600 flex items-center">
                      <span className="mr-1">🔥</span> 计入 FIRE
                    </div>
                  )}
                  {asset.type === 'bank' && asset.endDate && (
                    <div className="text-slate-500">
                      到期: {formatDate(asset.endDate)} ({getDaysUntilMaturity(asset.endDate)}天)
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleEdit(asset)}
                  className="flex-1 py-2 text-blue-600 font-medium bg-blue-50 rounded-lg text-center active:bg-blue-100"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(asset)}
                  className="flex-1 py-2 text-red-600 font-medium bg-red-50 rounded-lg text-center active:bg-red-100"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {assets.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无资产</h3>
            <p className="text-slate-500 mb-6">
              点击上方「新增资产」按钮开始管理您的资产
            </p>
            <button
              onClick={() => {
                // 直接设置isAdding为true
                setIsAdding(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              新增资产
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
