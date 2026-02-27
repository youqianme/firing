'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';
import { formatDate } from '@firing/utils';
import { Currency, LiabilityType, type Liability, type Payment } from './types';

export default function LiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: LiabilityType.CREDIT_CARD,
    currency: Currency.CNY,
    balance: 0,
    interestRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });
  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 加载数据
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 通过 API 获取负债和还款记录
        const [liabilitiesResponse, paymentsResponse] = await Promise.all([
          fetch('/api/liabilities'),
          fetch('/api/payments')
        ]);

        const loadedLiabilities = await liabilitiesResponse.json();
        const loadedPayments = await paymentsResponse.json();

        setLiabilities(loadedLiabilities);
        setPayments(loadedPayments);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 处理表单输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' || name === 'interestRate' ? parseFloat(value) || 0 : value
    }));
  }

  // 处理还款表单输入变化
  function handlePaymentInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  }

  // 处理负债类型变化
  function handleLiabilityTypeChange(type: LiabilityType) {
    setFormData(prev => ({
      ...prev,
      type
    }));
  }

  // 提交负债表单
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingLiability) {
        // 更新负债
        const response = await fetch(`/api/liabilities/${editingLiability.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const updatedLiability = await response.json();
          // 更新列表
          setLiabilities(prev => prev.map(l => l.id === updatedLiability.id ? updatedLiability : l));
          setEditingLiability(null);
          setIsAdding(false);
          resetForm();
        }
      } else {
        // 创建负债
        const response = await fetch('/api/liabilities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            type: formData.type,
            currency: formData.currency,
            balance: formData.balance,
            interestRate: formData.interestRate || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            notes: formData.notes || undefined
          }),
        });

        if (response.ok) {
          const newLiability = await response.json();
          // 更新列表
          setLiabilities(prev => [newLiability, ...prev]);
          setIsAdding(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save liability:', error);
    }
  }

  // 提交还款记录
  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedLiability) return;

    try {
      // 验证还款金额
      if (paymentFormData.amount <= 0) {
        alert('还款金额必须大于 0');
        return;
      }

      if (paymentFormData.amount > selectedLiability.balance) {
        if (!confirm('还款金额大于当前余额，确定要继续吗？')) {
          return;
        }
      }

      // 通过 API 创建还款记录
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liabilityId: selectedLiability.id,
          amount: paymentFormData.amount,
          date: paymentFormData.date,
          notes: paymentFormData.notes || undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const { payment, updatedLiability } = result;

        // 更新列表
        setPayments(prev => [payment, ...prev]);
        setLiabilities(prev => prev.map(l => l.id === updatedLiability.id ? updatedLiability : l));
        setIsRecordingPayment(false);
        setSelectedLiability(null);
        resetPaymentForm();
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  }

  // 重置表单
  function resetForm() {
    setFormData({
      name: '',
      type: LiabilityType.CREDIT_CARD,
      currency: Currency.CNY,
      balance: 0,
      interestRate: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    });
  }

  // 重置还款表单
  function resetPaymentForm() {
    setPaymentFormData({
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  }

  // 编辑负债
  function handleEdit(liability: Liability) {
    setEditingLiability(liability);
    setFormData({
      name: liability.name,
      type: liability.type,
      currency: liability.currency,
      balance: liability.balance,
      interestRate: liability.interestRate || 0,
      startDate: liability.startDate || new Date().toISOString().split('T')[0],
      endDate: liability.endDate || '',
      notes: liability.notes || ''
    });
    setIsAdding(true);
  }

  // 删除负债
  async function handleDelete(liability: Liability) {
    if (confirm(`确定要删除负债 "${liability.name}" 吗？`)) {
      try {
        // 通过 API 删除负债
        const response = await fetch(`/api/liabilities/${liability.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // 更新列表
          setLiabilities(prev => prev.filter(l => l.id !== liability.id));
        }
      } catch (error) {
        console.error('Failed to delete liability:', error);
      }
    }
  }

  // 记录还款
  function handleRecordPayment(liability: Liability) {
    setSelectedLiability(liability);
    setIsRecordingPayment(true);
  }

  // 获取负债的还款记录
  function getLiabilityPayments(liabilityId: string): Payment[] {
    return payments.filter(p => p.liabilityId === liabilityId);
  }

  // 计算负债的剩余天数
  function getDaysUntilEnd(endDate?: string) {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.max(0, end.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <h1 className="text-3xl font-bold text-slate-900">负债管理</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增负债
          </button>
        </div>

        {/* 新增/编辑负债表单 */}
        {isAdding && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {editingLiability ? '编辑负债' : '新增负债'}
            </h2>

            {/* 负债类型选择 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.values(LiabilityType).map((type) => (
                <button
                  key={type}
                  onClick={() => handleLiabilityTypeChange(type)}
                  className={`p-4 border rounded-lg flex flex-col items-center ${formData.type === type ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-lg mb-2">
                    {type === LiabilityType.CREDIT_CARD ? '💳' :
                     type === LiabilityType.MORTGAGE ? '🏠' :
                     type === LiabilityType.CAR_LOAN ? '🚗' :
                     type === LiabilityType.CONSUMER_LOAN ? '💸' : '📝'}
                  </span>
                  <span className="text-sm font-medium">
                    {type === LiabilityType.CREDIT_CARD ? '信用卡' :
                     type === LiabilityType.MORTGAGE ? '房贷' :
                     type === LiabilityType.CAR_LOAN ? '车贷' :
                     type === LiabilityType.CONSUMER_LOAN ? '消费贷' : '其他借款'}
                  </span>
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
                    {Object.values(Currency).map((currency) => (
                      <option key={currency} value={currency}>
                        {currency === Currency.CNY ? '人民币 (CNY)' :
                         currency === Currency.USD ? '美元 (USD)' : currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    当前余额
                  </label>
                  <input
                    type="number"
                    name="balance"
                    value={formData.balance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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
                  {editingLiability ? '保存修改' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingLiability(null);
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

        {/* 还款记录表单 */}
        {isRecordingPayment && selectedLiability && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              记录还款 - {selectedLiability.name}
            </h2>

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    还款金额
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentFormData.amount}
                    onChange={handlePaymentInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-sm text-slate-500 mt-1">
                    当前余额: {formatCurrency(selectedLiability.balance, selectedLiability.currency)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    还款日期
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={paymentFormData.date}
                    onChange={handlePaymentInputChange}
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
                  value={paymentFormData.notes}
                  onChange={handlePaymentInputChange}
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
                  保存还款
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingPayment(false);
                    setSelectedLiability(null);
                    resetPaymentForm();
                  }}
                  className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 负债列表 - 桌面端表格 */}
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
                    年化利率
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                    到期日
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                    余额
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {liabilities.map((liability) => {
                  const liabilityPayments = getLiabilityPayments(liability.id);
                  return (
                    <tr key={liability.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {liability.name}
                        </div>
                        {liabilityPayments.length > 0 && (
                          <div className="text-sm text-slate-500">
                            {liabilityPayments.length} 条还款记录
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                          {liability.type === LiabilityType.CREDIT_CARD ? '信用卡' :
                           liability.type === LiabilityType.MORTGAGE ? '房贷' :
                           liability.type === LiabilityType.CAR_LOAN ? '车贷' :
                           liability.type === LiabilityType.CONSUMER_LOAN ? '消费贷' : '其他借款'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {liability.interestRate ? `${liability.interestRate}%` : '无'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-500">
                          {liability.endDate ? (
                            <>
                              {formatDate(liability.endDate)}
                              <span className="ml-2 text-xs text-slate-400">
                                (剩余 {getDaysUntilEnd(liability.endDate)} 天)
                              </span>
                            </>
                          ) : (
                            '无'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-red-600">
                          {formatCurrency(liability.balance, liability.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRecordPayment(liability)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          还款
                        </button>
                        <button
                          onClick={() => handleEdit(liability)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(liability)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 负债列表 - 移动端卡片视图 */}
        <div className="md:hidden space-y-4">
          {liabilities.map((liability) => {
            const liabilityPayments = getLiabilityPayments(liability.id);
            return (
              <div key={liability.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{liability.name}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                      {liability.type === LiabilityType.CREDIT_CARD ? '信用卡' :
                       liability.type === LiabilityType.MORTGAGE ? '房贷' :
                       liability.type === LiabilityType.CAR_LOAN ? '车贷' :
                       liability.type === LiabilityType.CONSUMER_LOAN ? '消费贷' : '其他借款'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600 text-lg">
                      {formatCurrency(liability.balance, liability.currency)}
                    </div>
                    {liability.interestRate && (
                      <div className="text-sm text-slate-500 mt-1">
                        利率: {liability.interestRate}%
                      </div>
                    )}
                  </div>
                </div>

                {/* 额外信息 */}
                {(liability.endDate || liabilityPayments.length > 0) && (
                  <div className="mb-3 text-sm space-y-1 bg-slate-50 p-2 rounded-lg">
                    {liability.endDate && (
                      <div className="text-slate-500">
                        到期: {formatDate(liability.endDate)} ({getDaysUntilEnd(liability.endDate)}天)
                      </div>
                    )}
                    {liabilityPayments.length > 0 && (
                      <div className="text-slate-500">
                        已还款: {liabilityPayments.length} 次
                      </div>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleRecordPayment(liability)}
                    className="flex-1 py-2 text-green-600 font-medium bg-green-50 rounded-lg text-center active:bg-green-100"
                  >
                    还款
                  </button>
                  <button
                    onClick={() => handleEdit(liability)}
                    className="flex-1 py-2 text-blue-600 font-medium bg-blue-50 rounded-lg text-center active:bg-blue-100"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(liability)}
                    className="flex-1 py-2 text-red-600 font-medium bg-red-50 rounded-lg text-center active:bg-red-100"
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {liabilities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无负债</h3>
            <p className="text-slate-500 mb-6">
              点击上方「新增负债」按钮开始管理您的负债
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              新增负债
            </button>
          </div>
        )}

        {/* 还款记录列表 */}
        {payments.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">还款记录</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                      负债名称
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                      还款日期
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 uppercase tracking-wider">
                      还款金额
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 uppercase tracking-wider">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((payment) => {
                    const liability = liabilities.find(l => l.id === payment.liabilityId);
                    return (
                      <tr key={payment.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">
                            {liability?.name || '未知负债'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {formatDate(payment.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="font-medium text-green-600">
                            {liability ? formatCurrency(payment.amount, liability.currency) : payment.amount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {payment.notes || '无'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
