'use client';

import { useEffect, useState } from 'react';

// 直接在文件中定义所需的类型
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export default function MarketDataPage() {
  const [marketData, setMarketData] = useState({
    usdToCny: 7.20,
    hkdToCny: 0.92,
    goldPriceCny: 480.00
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // 加载市场数据
  useEffect(() => {
    loadMarketData();
  }, []);

  // 加载市场数据
  async function loadMarketData() {
    try {
      // 通过 API 获取市场数据
      const response = await fetch('/api/market-data');
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.error('Failed to load market data:', error);
      // 加载失败时使用默认值
      setMarketData({
        usdToCny: 7.20,
        hkdToCny: 0.92,
        goldPriceCny: 480.00
      });
    }
  }

  // 保存市场数据
  async function saveMarketData() {
    try {
      // 通过 API 保存市场数据
      const response = await fetch('/api/market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      });
      
      const result = await response.json();
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 2000);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save market data:', error);
      setMessage('保存失败');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // 处理输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setMarketData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">市场数据</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {isEditing ? '取消' : '编辑数据'}
          </button>
        </div>

        {/* 市场数据卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">汇率与价格</h2>
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          
          <div className="space-y-6">
            {/* USD/CNY */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                USD/CNY 汇率
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="usdToCny"
                  value={marketData.usdToCny}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-slate-900">
                  {marketData.usdToCny.toFixed(2)}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-1">1 美元 = {marketData.usdToCny.toFixed(2)} 人民币</p>
            </div>

            {/* HKD/CNY */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                HKD/CNY 汇率
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="hkdToCny"
                  value={marketData.hkdToCny}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-slate-900">
                  {marketData.hkdToCny.toFixed(2)}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-1">1 港币 = {marketData.hkdToCny.toFixed(2)} 人民币</p>
            </div>

            {/* 黄金价格 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                黄金价格 (CNY/克)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="goldPriceCny"
                  value={marketData.goldPriceCny}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="text-lg font-medium text-slate-900">
                  {marketData.goldPriceCny.toFixed(2)}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-1">每克黄金价格（人民币）</p>
            </div>
          </div>

          {/* 保存按钮 */}
          {isEditing && (
            <div className="mt-8">
              <button
                onClick={saveMarketData}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存数据
              </button>
            </div>
          )}
        </div>

        {/* 说明信息 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">说明</h2>
          <div className="space-y-4 text-slate-600">
            <p>• 市场数据用于多币种资产的折算和实物资产的估值</p>
            <p>• 当系统检测到缺失数据时，会在总览页面显示提示</p>
            <p>• 建议定期更新汇率数据以确保折算准确性</p>
            <p>• 当前版本采用手动维护方式，未来可能支持自动更新</p>
          </div>
        </div>
      </main>
    </div>
  );
}
