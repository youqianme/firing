'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import { formatCurrency } from '@firing/utils';
import { Asset } from '../../assets/types';
import { HousingFundRecord } from '../../assets/types';
import HousingFundRecordList from '../components/HousingFundRecordList';
import HousingFundRecordForm from '../components/HousingFundRecordForm';

// 扩展 Asset 类型，包含公积金特有字段
interface HousingFundAsset extends Asset {
  housingFundAccount?: string;
  housingFundCity?: string;
  housingFundBase?: number;
  housingFundPersonalRate?: number;
  housingFundCompanyRate?: number;
}

// 统计信息类型
interface Statistics {
  thisMonthDeposit: number;
  totalDeposit: number;
  totalWithdraw: number;
  totalMonths: number;
}

export default function HousingFundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useUser();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<HousingFundAsset | null>(null);
  const [records, setRecords] = useState<HousingFundRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // 加载资产信息和变动记录
  useEffect(() => {
    if (!userId || !assetId) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const headers = { 'x-user-id': userId };

    async function loadData() {
      try {
        setIsLoading(true);

        // 获取资产信息
        const assetResponse = await fetch(`/api/assets`, { signal, headers });
        const assets = await assetResponse.json();
        const foundAsset = assets.find((a: Asset) => a.id === assetId);
        
        if (foundAsset) {
          setAsset(foundAsset);
        }

        // 获取变动记录
        const recordsResponse = await fetch(`/api/housing-fund/records?assetId=${assetId}`, { signal });
        const recordsData = await recordsResponse.json();
        setRecords(Array.isArray(recordsData) ? recordsData : []);
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
  }, [userId, assetId]);

  // 计算统计信息
  const statistics: Statistics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let thisMonthDeposit = 0;
    let totalDeposit = 0;
    let totalWithdraw = 0;

    records.forEach(record => {
      const recordDate = new Date(record.date);
      
      if (record.type === 'deposit' || record.type === 'interest') {
        totalDeposit += record.amount;
        
        // 计算本月到账
        if (recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear) {
          thisMonthDeposit += record.amount;
        }
      } else if (record.type === 'withdraw') {
        totalWithdraw += record.amount;
      }
    });

    // 计算缴纳月数（根据最早的到账记录）
    const depositRecords = records.filter(r => r.type === 'deposit');
    let totalMonths = 0;
    if (depositRecords.length > 0) {
      const earliestDate = new Date(Math.min(...depositRecords.map(r => new Date(r.date).getTime())));
      const diffTime = now.getTime() - earliestDate.getTime();
      totalMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    }

    return {
      thisMonthDeposit,
      totalDeposit,
      totalWithdraw,
      totalMonths
    };
  }, [records]);

  // 刷新数据
  async function refreshData() {
    if (!userId || !assetId) return;

    try {
      const headers = { 'x-user-id': userId };
      
      // 刷新资产信息
      const assetResponse = await fetch(`/api/assets`, { headers });
      const assets = await assetResponse.json();
      const foundAsset = assets.find((a: Asset) => a.id === assetId);
      if (foundAsset) {
        setAsset(foundAsset);
      }

      // 刷新变动记录
      const recordsResponse = await fetch(`/api/housing-fund/records?assetId=${assetId}`);
      const recordsData = await recordsResponse.json();
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }

  // 处理添加记录成功
  function handleAddSuccess() {
    setShowAddForm(false);
    refreshData();
  }

  // 返回上一页
  function handleGoBack() {
    router.back();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">公积金账户不存在</h3>
          <p className="text-slate-500 mb-6">该公积金账户可能已被删除或无法访问</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏：返回按钮 + 账户名称 */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{asset.name}</h1>
            <p className="text-slate-500 mt-1">公积金账户详情</p>
          </div>
        </div>

        {/* 账户信息和统计信息卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 左侧：账户基本信息 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🏛️</span>
              账户信息
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">账户名称</span>
                <span className="font-medium text-slate-900">{asset.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">公积金账号</span>
                <span className="font-medium text-slate-900">
                  {asset.housingFundAccount || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">缴纳城市</span>
                <span className="font-medium text-slate-900">
                  {asset.housingFundCity || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">缴纳基数</span>
                <span className="font-medium text-slate-900">
                  {asset.housingFundBase ? formatCurrency(asset.housingFundBase, asset.currency) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">个人缴纳比例</span>
                <span className="font-medium text-slate-900">
                  {asset.housingFundPersonalRate ? `${asset.housingFundPersonalRate}%` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">单位缴纳比例</span>
                <span className="font-medium text-slate-900">
                  {asset.housingFundCompanyRate ? `${asset.housingFundCompanyRate}%` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500">当前余额</span>
                <span className="font-bold text-xl text-blue-600">
                  {formatCurrency(asset.amount, asset.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧：统计信息 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📊</span>
              统计信息
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* 本月到账金额 */}
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">本月到账</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(statistics.thisMonthDeposit, asset.currency)}
                </div>
              </div>

              {/* 累计缴纳金额 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">累计缴纳</div>
                <div className="text-xl font-bold text-blue-700">
                  {formatCurrency(statistics.totalDeposit, asset.currency)}
                </div>
              </div>

              {/* 累计提取金额 */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 mb-1">累计提取</div>
                <div className="text-xl font-bold text-red-700">
                  {formatCurrency(statistics.totalWithdraw, asset.currency)}
                </div>
              </div>

              {/* 缴纳月数 */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 mb-1">缴纳月数</div>
                <div className="text-xl font-bold text-purple-700">
                  {statistics.totalMonths} 个月
                </div>
              </div>
            </div>

            {/* 净缴纳金额 */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">净缴纳金额（累计缴纳 - 累计提取）</span>
                <span className={`font-bold text-lg ${
                  statistics.totalDeposit - statistics.totalWithdraw >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(statistics.totalDeposit - statistics.totalWithdraw, asset.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 添加记录表单（弹窗形式） */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">添加变动记录</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <HousingFundRecordForm
                  assetId={assetId}
                  currency={asset.currency}
                  onSuccess={handleAddSuccess}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 底部：变动记录列表 + 添加按钮 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <span className="text-xl mr-2">📋</span>
                变动记录
              </h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加记录
              </button>
            </div>
          </div>
          <div className="p-6">
            <HousingFundRecordList
              assetId={assetId}
              currency={asset.currency}
              onRefresh={refreshData}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
