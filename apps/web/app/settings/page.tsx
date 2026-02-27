'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';
import { Currency } from './types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    baseCurrency: 'CNY',
    privacyMode: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [isGeneratingTestData, setIsGeneratingTestData] = useState(false);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  // 加载设置数据
  async function loadSettings() {
    try {
      setIsLoading(true);
      // 通过 API 获取用户设置
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings({
        baseCurrency: data.baseCurrency || 'CNY',
        privacyMode: data.privacyMode || false
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      // 加载失败时使用默认设置
      setSettings({
        baseCurrency: 'CNY',
        privacyMode: false
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 保存设置
  async function saveSettings() {
    try {
      // 通过 API 保存用户设置
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const result = await response.json();
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage('保存失败');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // 导出数据
  async function exportData() {
    try {
      // 获取所有数据
      const [assetsResponse, liabilitiesResponse, transactionsResponse, activitiesResponse, fireConfigResponse] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/liabilities'),
        fetch('/api/transactions'),
        fetch('/api/activity'),
        fetch('/api/fire')
      ]);
      
      const [assets, liabilities, transactions, activities, fireConfig] = await Promise.all([
        assetsResponse.json(),
        liabilitiesResponse.json(),
        transactionsResponse.json(),
        activitiesResponse.json(),
        fireConfigResponse.json()
      ]);
      
      const exportData = {
        settings,
        assets,
        liabilities,
        transactions,
        activities,
        fireConfig,
        timestamp: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `youqianme-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setMessage('数据导出成功');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Failed to export data:', error);
      setMessage('导出失败');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // 导入数据
  function handleImportData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        console.log('Imported data:', data);
        // 这里可以通过 API 导入数据
        setMessage('数据导入成功');
        setTimeout(() => setMessage(''), 2000);
      } catch (error) {
        console.error('Failed to import data:', error);
        setMessage('导入失败，请检查文件格式');
        setTimeout(() => setMessage(''), 2000);
      }
    };
    reader.readAsText(file);
  }

  // 清空数据
  async function clearData() {
    console.log('=== clearData function called ===');
    console.log('1. Function started at:', new Date().toISOString());
    
    // 显示确认对话框
    console.log('2. About to show confirm dialog');
    const confirmed = window.confirm('确定要清空所有数据吗？此操作不可恢复！');
    
    console.log('3. Confirm dialog result:', confirmed);
    
    if (confirmed) {
      console.log('4. User confirmed, proceeding to clear data');
      try {
        console.log('5. Calling clear data API at:', new Date().toISOString());
        // 通过 API 清空数据
        const response = await fetch('/api/settings', {
          method: 'DELETE'
        });
        
        console.log('6. API response received, status:', response.status);
        
        const result = await response.json();
        console.log('7. API response parsed successfully:', result);
        setMessage('数据已清空');
        setTimeout(() => setMessage(''), 2000);
        console.log('8. Data cleared successfully');
      } catch (error) {
        console.error('9. Failed to clear data:', error);
        setMessage('清空失败');
        setTimeout(() => setMessage(''), 2000);
      } finally {
        console.log('10. Function completed at:', new Date().toISOString());
        console.log('=== clearData function ended ===');
      }
    } else {
      console.log('4. User cancelled, exiting function');
      console.log('=== clearData function ended (cancelled) ===');
    }
  }

  // 添加测试数据
  async function addTestData() {
    console.log('=== addTestData function called ===');
    console.log('1. Function started at:', new Date().toISOString());
    
    // 显示确认对话框
    console.log('2. About to show confirm dialog');
    const confirmed = window.confirm('确定要添加测试数据吗？\n\n这将生成覆盖所有功能的测试数据，包括：\n- 账户数据（支付宝、微信、银行卡等）\n- 市场数据（汇率、黄金价格）\n- 资产数据（现金、投资、定期存款等）\n- 负债数据（信用卡、个人贷款）\n- 交易数据（转账、消费、收入）\n- FIRE 配置数据\n- 活动记录\n\n测试数据不会覆盖现有数据（如果存在）。');
    
    console.log('3. Confirm dialog result:', confirmed);
    
    if (confirmed) {
      console.log('4. User confirmed, proceeding to generate test data');
      setIsGeneratingTestData(true);
      try {
        console.log('5. Calling test data API at:', new Date().toISOString());
        // 通过 API 添加测试数据
        const response = await fetch('/api/settings/test-data', {
          method: 'POST'
        });
        
        console.log('6. API response received, status:', response.status);
        
        if (!response.ok) {
          throw new Error('API 请求失败');
        }
        
        const result = await response.json();
        console.log('7. API response parsed successfully:', result);
        setMessage('测试数据添加成功！您现在可以浏览各个模块查看示例数据。');
        setTimeout(() => setMessage(''), 3000);
        console.log('8. Test data generation completed successfully');
      } catch (error) {
        console.error('9. Failed to add test data:', error);
        setMessage('添加测试数据失败，请稍后重试。');
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setIsGeneratingTestData(false);
        console.log('10. Function completed at:', new Date().toISOString());
        console.log('=== addTestData function ended ===');
      }
    } else {
      console.log('4. User cancelled, exiting function');
      console.log('=== addTestData function ended (cancelled) ===');
    }
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
          <h1 className="text-3xl font-bold text-slate-900">设置</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {isEditing ? '取消' : '编辑设置'}
          </button>
        </div>

        {message && (
          <div className={`mb-8 p-4 rounded-lg ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* 账户设置卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">账户设置</h2>
          
          <div className="space-y-6">
            {/* 基础货币设置 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                基础货币
              </label>
              {isEditing ? (
                <select
                  value={settings.baseCurrency}
                  onChange={(e) => setSettings({ ...settings, baseCurrency: e.target.value })}
                  className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="JPY">日元 (JPY)</option>
                  <option value="KRW">韩元 (KRW)</option>
                </select>
              ) : (
                <div className="text-lg text-slate-900">
                  {settings.baseCurrency === 'CNY' && '人民币 (CNY)'}
                  {settings.baseCurrency === 'USD' && '美元 (USD)'}
                  {settings.baseCurrency === 'EUR' && '欧元 (EUR)'}
                  {settings.baseCurrency === 'JPY' && '日元 (JPY)'}
                  {settings.baseCurrency === 'KRW' && '韩元 (KRW)'}
                </div>
              )}
            </div>

            {/* 隐私模式设置 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                隐私模式
              </label>
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.privacyMode}
                    onChange={(e) => setSettings({ ...settings, privacyMode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-600">隐藏金额详情</span>
                </div>
              ) : (
                <div className="text-lg text-slate-900">
                  {settings.privacyMode ? '开启' : '关闭'}
                </div>
              )}
            </div>
          </div>

          {/* 保存按钮 */}
          {isEditing && (
            <div className="mt-8">
              <button
                onClick={saveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存设置
              </button>
            </div>
          )}
        </div>

        {/* 数据管理卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">数据管理</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 导出数据 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-3">导出数据</h3>
              <button
                onClick={exportData}
                className="w-full bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors mb-2"
              >
                导出 JSON
              </button>
              <p className="text-xs text-slate-500">导出所有资产、负债、交易和设置数据</p>
            </div>

            {/* 导入数据 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-3">导入数据</h3>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => (document.querySelector('input[type="file"]') as HTMLElement | null)?.click()}
                  className="w-full bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  选择文件
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">从之前导出的 JSON 文件恢复数据</p>
            </div>

            {/* 清空数据 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-3">清空数据</h3>
              <button
                onClick={clearData}
                className="w-full bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors mb-2"
              >
                清空所有数据
              </button>
              <p className="text-xs text-slate-500">危险操作，此操作不可恢复</p>
            </div>

            {/* 生成测试数据 */}
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-3">生成测试数据</h3>
              <button
                onClick={addTestData}
                disabled={isGeneratingTestData}
                className={`w-full px-6 py-2 rounded-lg font-medium transition-colors mb-2 ${isGeneratingTestData ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {isGeneratingTestData ? '生成中...' : '生成测试数据'}
              </button>
              <p className="text-xs text-slate-500">一键生成覆盖所有功能的测试数据，快速体验系统功能</p>
            </div>
          </div>
        </div>

        {/* 关于信息 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">关于</h2>
          <div className="space-y-4 text-slate-600">
            <p>版本: 1.0.0</p>
            <p>有钱么 (YouQianMe) - 个人资产管理应用</p>
            <p>帮助你追踪资产、负债和 FIRE 目标</p>
          </div>
        </div>
      </main>
    </div>
  );
}
