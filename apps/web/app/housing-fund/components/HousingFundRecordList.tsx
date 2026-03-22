'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';
import { formatDate } from '@firing/utils';
import { HousingFundRecord, HousingFundRecordType } from '../../assets/types';

interface HousingFundRecordListProps {
  assetId: string;
  currency: string;
  onRefresh?: () => void;
}

export default function HousingFundRecordList({ assetId, currency, onRefresh }: HousingFundRecordListProps) {
  const [records, setRecords] = useState<HousingFundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载记录
  useEffect(() => {
    if (assetId) {
      loadRecords();
    }
  }, [assetId]);

  async function loadRecords() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/housing-fund/records?assetId=${assetId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load records');
      }

      const data = await response.json();
      // 按日期倒序排列
      const sortedRecords = Array.isArray(data) 
        ? data.sort((a: HousingFundRecord, b: HousingFundRecord) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        : [];
      setRecords(sortedRecords);
    } catch (err) {
      setError('加载记录失败');
      console.error('Failed to load records:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // 删除记录
  async function handleDelete(recordId: string) {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/housing-fund/records?id=${recordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 从列表中移除
        setRecords(prev => prev.filter(r => r.id !== recordId));
        // 通知父组件刷新
        onRefresh?.();
      } else {
        throw new Error('Failed to delete record');
      }
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('删除记录失败');
    }
  }

  // 获取类型显示文本
  function getTypeText(type: HousingFundRecordType): string {
    switch (type) {
      case 'deposit':
        return '到账';
      case 'withdraw':
        return '提取';
      case 'interest':
        return '利息';
      default:
        return type;
    }
  }

  // 获取类型样式
  function getTypeStyle(type: HousingFundRecordType): string {
    switch (type) {
      case 'deposit':
        return 'bg-green-50 text-green-700';
      case 'withdraw':
        return 'bg-red-50 text-red-700';
      case 'interest':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  }

  // 获取金额显示（到账/利息为正，提取为负）
  function getAmountDisplay(record: HousingFundRecord): string {
    const prefix = record.type === 'withdraw' ? '-' : '+';
    return `${prefix}${formatCurrency(record.amount, currency)}`;
  }

  // 获取金额样式
  function getAmountStyle(type: HousingFundRecordType): string {
    switch (type) {
      case 'deposit':
      case 'interest':
        return 'text-green-600';
      case 'withdraw':
        return 'text-red-600';
      default:
        return 'text-slate-900';
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button 
          onClick={loadRecords}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm">暂无变动记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 桌面端表格 */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  个人缴纳
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  单位缴纳
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  原因/备注
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {formatDate(record.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(record.type)}`}>
                      {getTypeText(record.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className={`text-sm font-medium ${getAmountStyle(record.type)}`}>
                      {getAmountDisplay(record)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-slate-600">
                      {record.personalAmount > 0 
                        ? formatCurrency(record.personalAmount, currency) 
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-slate-600">
                      {record.companyAmount > 0 
                        ? formatCurrency(record.companyAmount, currency) 
                        : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-slate-600 max-w-xs truncate">
                      {record.reason || record.notes || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
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

      {/* 移动端卡片视图 */}
      <div className="md:hidden space-y-3">
        {records.map((record) => (
          <div 
            key={record.id} 
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(record.type)}`}>
                  {getTypeText(record.type)}
                </span>
                <span className="text-sm text-slate-500">
                  {formatDate(record.date)}
                </span>
              </div>
              <div className={`text-lg font-bold ${getAmountStyle(record.type)}`}>
                {getAmountDisplay(record)}
              </div>
            </div>

            {/* 详细信息 */}
            {(record.personalAmount > 0 || record.companyAmount > 0) && (
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm bg-slate-50 p-2 rounded-lg">
                {record.personalAmount > 0 && (
                  <div className="text-slate-600">
                    个人: {formatCurrency(record.personalAmount, currency)}
                  </div>
                )}
                {record.companyAmount > 0 && (
                  <div className="text-slate-600">
                    单位: {formatCurrency(record.companyAmount, currency)}
                  </div>
                )}
              </div>
            )}

            {/* 原因/备注 */}
            {(record.reason || record.notes) && (
              <div className="text-sm text-slate-500 mb-3">
                {record.reason && <div>原因: {record.reason}</div>}
                {record.notes && <div>备注: {record.notes}</div>}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDelete(record.id)}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
