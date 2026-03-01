'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '@firing/utils';
import { formatDate } from '@firing/utils';
import { AssetType, TransactionType, type Asset, type Transaction, type Currency } from './types';

export default function TransactionsPage() {
  const { userId } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.TRANSFER);
  const [formData, setFormData] = useState({
    fromAssetId: '',
    toAssetId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 加载数据
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const headers = { 'x-user-id': userId };

    async function loadData() {
      try {
        setIsLoading(true);

        // 通过 API 获取交易和资产
        const [transactionsResponse, assetsResponse] = await Promise.all([
          fetch('/api/transactions', { signal, headers }),
          fetch('/api/assets', { signal, headers })
        ]);

        const loadedTransactions = await transactionsResponse.json();
        const loadedAssets = await assetsResponse.json();

        if (!signal.aborted) {
          setTransactions(Array.isArray(loadedTransactions) ? loadedTransactions : []);
          setAssets(Array.isArray(loadedAssets) ? loadedAssets : []);
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
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  }

  // 提交转账交易
  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const fromAsset = assets.find(a => a.id === formData.fromAssetId);
      const toAsset = assets.find(a => a.id === formData.toAssetId);

      if (!fromAsset || !toAsset) {
        alert('请选择转出和转入资产');
        return;
      }

      if (fromAsset.id === toAsset.id) {
        alert('转出和转入资产不能相同');
        return;
      }

      if (fromAsset.currency !== toAsset.currency) {
        alert('不同币种的资产暂不支持直接转账');
        return;
      }

      if (formData.amount <= 0) {
        alert('转账金额必须大于 0');
        return;
      }

      if (formData.amount > fromAsset.amount) {
        alert('转出金额不能大于资产余额');
        return;
      }

      // 通过 API 创建转账交易
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          type: TransactionType.TRANSFER,
          fromAssetId: formData.fromAssetId,
          toAssetId: formData.toAssetId,
          amount: formData.amount,
          currency: fromAsset.currency,
          date: formData.date,
          notes: formData.notes || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const { transaction, updatedFromAsset, updatedToAsset } = result;

        // 更新列表
        setTransactions(prev => [transaction, ...(Array.isArray(prev) ? prev : [])]);
        setAssets(prev => (Array.isArray(prev) ? prev : []).map(a => 
          a.id === updatedFromAsset.id ? updatedFromAsset :
          a.id === updatedToAsset.id ? updatedToAsset : a
        ));
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create transfer:', error);
    }
  }

  // 提交定期兑付交易
  async function handleRedeemSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const timeDepositAsset = assets.find(a => a.id === formData.fromAssetId);
      const cashAsset = assets.find(a => a.id === formData.toAssetId);

      if (!timeDepositAsset || !cashAsset) {
        alert('请选择定期存款和现金资产');
        return;
      }

      if (timeDepositAsset.type !== AssetType.TIME_DEPOSIT) {
        alert('请选择定期存款类型的资产');
        return;
      }

      if (cashAsset.type !== AssetType.CASH) {
        alert('请选择现金类型的资产');
        return;
      }

      if (timeDepositAsset.currency !== cashAsset.currency) {
        alert('不同币种的资产暂不支持直接兑付');
        return;
      }

      // 通过 API 创建定期兑付交易
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          type: TransactionType.REDEEM,
          fromAssetId: formData.fromAssetId,
          toAssetId: formData.toAssetId,
          amount: timeDepositAsset.amount,
          currency: timeDepositAsset.currency,
          date: formData.date,
          notes: formData.notes || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const { transaction, updatedCashAsset, deletedAssetId } = result;

        // 更新列表
        setTransactions(prev => [transaction, ...(Array.isArray(prev) ? prev : [])]);
        setAssets(prev => (Array.isArray(prev) ? prev : [])
          .filter(a => a.id !== deletedAssetId)
          .map(a => a.id === updatedCashAsset.id ? updatedCashAsset : a)
        );
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create redeem transaction:', error);
    }
  }

  // 重置表单
  function resetForm() {
    setFormData({
      fromAssetId: '',
      toAssetId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  // 删除交易
  async function handleDelete(transaction: Transaction) {
    if (confirm('确定要删除这条交易记录吗？此操作会回滚相关资产的余额。')) {
      try {
        // 通过 API 删除交易
        const response = await fetch(`/api/transactions/${transaction.id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': userId }
        });

        if (response.ok) {
          // 更新列表
          setTransactions(prev => prev.filter(t => t.id !== transaction.id));
          // 重新加载资产列表
          const assetsResponse = await fetch('/api/assets', {
            headers: { 'x-user-id': userId }
          });
          const loadedAssets = await assetsResponse.json();
          setAssets(Array.isArray(loadedAssets) ? loadedAssets : []);
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  }

  // 获取资产名称
  function getAssetName(assetId?: string): string {
    if (!assetId) return '外部';
    const asset = assets.find(a => a.id === assetId);
    return asset?.name || '未知资产';
  }

  // 获取资产余额
  function getAssetBalance(assetId?: string): number {
    if (!assetId) return 0;
    const asset = assets.find(a => a.id === assetId);
    return asset?.amount || 0;
  }

  // 获取资产币种
  function getAssetCurrency(assetId?: string): Currency {
    if (!assetId) return 'CNY';
    const asset = assets.find(a => a.id === assetId);
    return asset?.currency || 'CNY';
  }

  // 获取现金资产列表
  function getCashAssets(): Asset[] {
    return Array.isArray(assets) ? assets.filter(a => a.type === AssetType.CASH) : [];
  }

  // 获取定期存款资产列表
  function getTimeDepositAssets(): Asset[] {
    return Array.isArray(assets) ? assets.filter(a => a.type === AssetType.TIME_DEPOSIT || a.type === AssetType.TIME_DEPOSIT_ALT) : [];
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
          <h1 className="text-3xl font-bold text-slate-900">交易台账</h1>
          <button
            onClick={async () => {
              const assetsResponse = await fetch('/api/assets', {
                headers: { 'x-user-id': userId }
              });
              const loadedAssets = await assetsResponse.json();
              setAssets(Array.isArray(loadedAssets) ? loadedAssets : []);
            }}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            刷新
          </button>
        </div>

        {/* 交易类型切换 */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex border border-slate-200 rounded-lg overflow-hidden mb-6">
            <button
              onClick={() => setTransactionType(TransactionType.TRANSFER)}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${transactionType === TransactionType.TRANSFER ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              转账
            </button>
            <button
              onClick={() => setTransactionType(TransactionType.REDEEM)}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${transactionType === TransactionType.REDEEM ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              定期兑付
            </button>
          </div>

          {/* 转账表单 */}
          {transactionType === TransactionType.TRANSFER && (
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    转出资产
                  </label>
                  <select
                    name="fromAssetId"
                    value={formData.fromAssetId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCashAssets().map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({formatCurrency(asset.amount, asset.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    转入资产
                  </label>
                  <select
                    name="toAssetId"
                    value={formData.toAssetId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCashAssets().filter(a => a.id !== formData.fromAssetId).map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({formatCurrency(asset.amount, asset.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    转账金额
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
                  {formData.fromAssetId && (
                    <div className="text-sm text-slate-500 mt-1">
                      可用余额: {formatCurrency(getAssetBalance(formData.fromAssetId), getAssetCurrency(formData.fromAssetId))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    转账日期
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
              <div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          )}

          {/* 定期兑付表单 */}
          {transactionType === TransactionType.REDEEM && (
            <form onSubmit={handleRedeemSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    定期存款
                  </label>
                  <select
                    name="fromAssetId"
                    value={formData.fromAssetId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getTimeDepositAssets().map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({formatCurrency(asset.amount, asset.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    兑付到
                  </label>
                  <select
                    name="toAssetId"
                    value={formData.toAssetId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">请选择</option>
                    {getCashAssets().map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({formatCurrency(asset.amount, asset.currency)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    兑付日期
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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
              <div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  兑付
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 交易列表 - 桌面端表格 */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    摘要
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    分录
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === TransactionType.TRANSFER ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {transaction.type === TransactionType.TRANSFER ? '转账' : '定期兑付'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {transaction.notes || '无备注'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {transaction.fromAssetId && (
                          <div className="flex justify-between gap-4">
                            <div className="text-sm text-slate-500">
                              {getAssetName(transaction.fromAssetId)}
                            </div>
                            <div className="text-sm text-red-600 font-medium">
                              -{formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                          </div>
                        )}
                        {transaction.toAssetId && (
                          <div className="flex justify-between gap-4">
                            <div className="text-sm text-slate-500">
                              {getAssetName(transaction.toAssetId)}
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              +{formatCurrency(transaction.amount, transaction.currency)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(transaction)}
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

        {/* 交易列表 - 移动端卡片视图 */}
        <div className="md:hidden space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm text-slate-500">{formatDate(transaction.date)}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${transaction.type === TransactionType.TRANSFER ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {transaction.type === TransactionType.TRANSFER ? '转账' : '定期兑付'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(transaction)}
                  className="text-red-600 text-sm font-medium px-2 py-1 bg-red-50 rounded"
                >
                  删除
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg space-y-2 mb-3">
                {transaction.fromAssetId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{getAssetName(transaction.fromAssetId)}</span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                )}
                {transaction.fromAssetId && transaction.toAssetId && (
                  <div className="flex justify-center -my-1">
                    <span className="text-slate-400 text-xs">↓</span>
                  </div>
                )}
                {transaction.toAssetId && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{getAssetName(transaction.toAssetId)}</span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                )}
              </div>

              {transaction.notes && (
                <div className="text-sm text-slate-500 bg-white border border-slate-100 p-2 rounded">
                  备注: {transaction.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {transactions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无交易记录</h3>
            <p className="text-slate-500 mb-6">
              开始记录您的转账和定期兑付交易
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
