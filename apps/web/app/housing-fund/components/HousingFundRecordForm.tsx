'use client';

import { useState } from 'react';
import { HousingFundRecordType } from '../../assets/types';

interface HousingFundRecordFormProps {
  assetId: string;
  currency: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type RecordType = 'deposit' | 'withdraw';

export default function HousingFundRecordForm({ assetId, currency, onSuccess, onCancel }: HousingFundRecordFormProps) {
  const [recordType, setRecordType] = useState<RecordType>('deposit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 到账记录表单数据
  const [depositForm, setDepositForm] = useState({
    date: new Date().toISOString().split('T')[0],
    personalAmount: '',
    companyAmount: '',
    notes: ''
  });

  // 提取记录表单数据
  const [withdrawForm, setWithdrawForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    reason: '',
    notes: ''
  });

  // 处理到账表单输入变化
  function handleDepositInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setDepositForm(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  // 处理提取表单输入变化
  function handleWithdrawInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setWithdrawForm(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  // 验证到账表单
  function validateDepositForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!depositForm.date) {
      newErrors.date = '请选择日期';
    }
    
    const personalAmount = parseFloat(depositForm.personalAmount);
    const companyAmount = parseFloat(depositForm.companyAmount);
    
    if (isNaN(personalAmount) || personalAmount < 0) {
      newErrors.personalAmount = '个人缴纳金额不能为负数';
    }
    
    if (isNaN(companyAmount) || companyAmount < 0) {
      newErrors.companyAmount = '单位缴纳金额不能为负数';
    }
    
    if (personalAmount === 0 && companyAmount === 0) {
      newErrors.personalAmount = '个人缴纳和单位缴纳金额不能同时为0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // 验证提取表单
  function validateWithdrawForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!withdrawForm.date) {
      newErrors.date = '请选择日期';
    }
    
    const amount = parseFloat(withdrawForm.amount);
    
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = '提取金额必须大于0';
    }
    
    if (!withdrawForm.reason.trim()) {
      newErrors.reason = '请输入提取原因';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // 提交到账记录
  async function submitDeposit() {
    if (!validateDepositForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const personalAmount = parseFloat(depositForm.personalAmount) || 0;
      const companyAmount = parseFloat(depositForm.companyAmount) || 0;
      const totalAmount = personalAmount + companyAmount;

      const response = await fetch('/api/housing-fund/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          type: 'deposit' as HousingFundRecordType,
          amount: totalAmount,
          personalAmount,
          companyAmount,
          date: depositForm.date,
          notes: depositForm.notes || undefined
        }),
      });

      if (response.ok) {
        // 重置表单
        setDepositForm({
          date: new Date().toISOString().split('T')[0],
          personalAmount: '',
          companyAmount: '',
          notes: ''
        });
        onSuccess?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create record');
      }
    } catch (err) {
      console.error('Failed to create deposit record:', err);
      alert('创建到账记录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  // 提交提取记录
  async function submitWithdraw() {
    if (!validateWithdrawForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amount = parseFloat(withdrawForm.amount) || 0;

      const response = await fetch('/api/housing-fund/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId,
          type: 'withdraw' as HousingFundRecordType,
          amount,
          personalAmount: 0,
          companyAmount: 0,
          date: withdrawForm.date,
          reason: withdrawForm.reason,
          notes: withdrawForm.notes || undefined
        }),
      });

      if (response.ok) {
        // 重置表单
        setWithdrawForm({
          date: new Date().toISOString().split('T')[0],
          amount: '',
          reason: '',
          notes: ''
        });
        onSuccess?.();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create record');
      }
    } catch (err) {
      console.error('Failed to create withdraw record:', err);
      alert('创建提取记录失败');
    } finally {
      setIsSubmitting(false);
    }
  }

  // 处理表单提交
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recordType === 'deposit') {
      submitDeposit();
    } else {
      submitWithdraw();
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        添加变动记录
      </h2>

      {/* 记录类型选择 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setRecordType('deposit')}
          className={`p-4 border rounded-lg flex flex-col items-center transition-colors ${
            recordType === 'deposit' 
              ? 'border-green-600 bg-green-50' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-2xl mb-2">💰</span>
          <span className="text-sm font-medium">到账记录</span>
        </button>
        <button
          type="button"
          onClick={() => setRecordType('withdraw')}
          className={`p-4 border rounded-lg flex flex-col items-center transition-colors ${
            recordType === 'withdraw' 
              ? 'border-red-600 bg-red-50' 
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-2xl mb-2">💸</span>
          <span className="text-sm font-medium">提取记录</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {recordType === 'deposit' ? (
          // 到账记录表单
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  到账日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={depositForm.date}
                  onChange={handleDepositInputChange}
                  required
                  className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  个人缴纳金额 ({currency})
                </label>
                <input
                  type="number"
                  name="personalAmount"
                  value={depositForm.personalAmount}
                  onChange={handleDepositInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.personalAmount ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.personalAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  单位缴纳金额 ({currency})
                </label>
                <input
                  type="number"
                  name="companyAmount"
                  value={depositForm.companyAmount}
                  onChange={handleDepositInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.companyAmount ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.companyAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyAmount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  合计到账金额
                </label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium">
                  {((parseFloat(depositForm.personalAmount) || 0) + (parseFloat(depositForm.companyAmount) || 0)).toFixed(2)} {currency}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                备注
              </label>
              <textarea
                name="notes"
                value={depositForm.notes}
                onChange={handleDepositInputChange}
                rows={3}
                placeholder="可选：添加备注信息"
                className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </>
        ) : (
          // 提取记录表单
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  提取日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={withdrawForm.date}
                  onChange={handleWithdrawInputChange}
                  required
                  className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  提取金额 ({currency}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={withdrawForm.amount}
                  onChange={handleWithdrawInputChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                提取原因 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                value={withdrawForm.reason}
                onChange={handleWithdrawInputChange}
                placeholder="例如：购房、租房、装修等"
                required
                className={`w-full px-4 py-2 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                备注
              </label>
              <textarea
                name="notes"
                value={withdrawForm.notes}
                onChange={handleWithdrawInputChange}
                rows={3}
                placeholder="可选：添加备注信息"
                className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </>
        )}

        {/* 提交按钮 */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
