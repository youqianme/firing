'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { formatCurrency } from '@firing/utils';
import { formatDateTime } from '@firing/utils';
import { Currency, type Activity } from './types';

export default function ActivityPage() {
  const { userId } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ASSET' | 'LIABILITY' | 'TRANSACTION'>('ALL');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  // 加载数据
  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchActivities() {
      try {
        setIsLoading(true);

        // 通过 API 获取活动数据
        const response = await fetch(`/api/activity?filter=${filter}&page=${page}&pageSize=${pageSize}`, {
          signal,
          headers: { 'x-user-id': userId }
        });
        const loadedActivities = await response.json();
        const safeActivities = Array.isArray(loadedActivities) ? loadedActivities : [];

        if (!signal.aborted) {
          if (page === 1) {
            setActivities(safeActivities);
          } else {
            setActivities(prev => [...(Array.isArray(prev) ? prev : []), ...safeActivities]);
          }
          setHasMore(safeActivities.length === pageSize);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load activities:', error);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchActivities();

    return () => {
      controller.abort();
    };
  }, [filter, page, userId]);

  // 处理筛选变化
  function handleFilterChange(newFilter: typeof filter) {
    if (filter !== newFilter) {
      setFilter(newFilter);
      setPage(1);
      setActivities([]); // 可选：清空列表以显示加载状态
    }
  }

  // 加载更多
  function loadMore() {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }

  // 获取动作文本
  function getActionText(action: string): string {
    switch (action) {
      case 'CREATE': return '创建';
      case 'UPDATE': return '更新';
      case 'DELETE': return '删除';
      case 'TRANSFER': return '转账';
      case 'PAYMENT': return '还款';
      case 'REDEEM': return '兑付';
      default: return action;
    }
  }

  // 获取对象类型文本
  function getObjectTypeText(objectType: string): string {
    switch (objectType) {
      case 'ASSET': return '资产';
      case 'LIABILITY': return '负债';
      case 'TRANSACTION': return '交易';
      default: return objectType;
    }
  }

  // 获取动作图标
  function getActionIcon(action: string): string {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '❌';
      case 'TRANSFER': return '🔄';
      case 'PAYMENT': return '💳';
      case 'REDEEM': return '📅';
      default: return '📝';
    }
  }

  // 获取金额颜色
  function getAmountColor(delta?: number): string {
    if (delta === undefined) return 'text-slate-900';
    return delta > 0 ? 'text-red-600' : 'text-green-600';
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
          <h1 className="text-3xl font-bold text-slate-900">时间轴</h1>
        </div>

        {/* 筛选器 */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('ALL')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange('ASSET')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'ASSET' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            资产
          </button>
          <button
            onClick={() => handleFilterChange('LIABILITY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'LIABILITY' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            负债
          </button>
          <button
            onClick={() => handleFilterChange('TRANSACTION')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'TRANSACTION' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            交易
          </button>
        </div>

        {/* 时间轴列表 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无活动记录</h3>
              <p className="text-slate-500 mb-6">
                开始管理您的资产和负债，活动记录将显示在这里
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start">
                    {/* 图标 */}
                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">{getActionIcon(activity.action)}</span>
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {activity.objectName}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {getActionText(activity.action)} {getObjectTypeText(activity.objectType)}
                            {activity.notes ? ` • ${activity.notes}` : ''}
                          </p>
                        </div>
                        <div className={`font-medium ${getAmountColor(activity.delta)}`}>
                          {activity.delta ? (
                            activity.delta > 0 ? `+${formatCurrency(activity.delta, activity.currency)}` : 
                            formatCurrency(Math.abs(activity.delta), activity.currency)
                          ) : (
                            formatCurrency(activity.amount, activity.currency)
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDateTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* 金额对比（仅更新操作） */}
                  {activity.oldAmount !== undefined && (
                    <div className="mt-4 pl-16">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">变更前:</span>
                        <span className="text-slate-900">{formatCurrency(activity.oldAmount, activity.currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-slate-500">变更后:</span>
                        <span className="text-slate-900">{formatCurrency(activity.amount, activity.currency)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {hasMore && activities.length > 0 && (
            <div className="text-center py-6">
              <button
                onClick={loadMore}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                加载更多
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
