'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';

// 直接在文件中定义所需的类型
export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW';

export default function EarningsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载收益数据
  useEffect(() => {
    loadEarningsData();
  }, [currentMonth]);

  // 生成当月日历数据
  function generateCalendarDays(year: number, month: number) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const calendarDays: (number | null)[] = [];

    // 填充月初空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);
    }

    // 填充当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return calendarDays;
  }

  // 加载收益数据
  async function loadEarningsData() {
    try {
      setIsLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // 通过 API 获取收益数据
      const response = await fetch(`/api/earnings?year=${year}&month=${month}`);
      const data = await response.json();
      
      // 转换日期格式
      const formattedData = data.map((item: any) => ({
        date: new Date(item.date),
        total: item.total,
        activity: item.activity,
        market: item.market,
        interest: item.interest
      }));
      
      setEarningsData(formattedData);
    } catch (error) {
      console.error('Failed to load earnings data:', error);
      // 加载失败时生成模拟数据
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const mockData = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const total = (Math.random() * 1000 - 200).toFixed(2);
        return {
          date: new Date(year, month, day),
          total: parseFloat(total),
          activity: parseFloat((Math.random() * 500).toFixed(2)),
          market: parseFloat((Math.random() * 300 - 100).toFixed(2)),
          interest: parseFloat((Math.random() * 100).toFixed(2))
        };
      });
      
      setEarningsData(mockData);
    } finally {
      setIsLoading(false);
    }
  }

  // 获取某天的收益数据
  function getDayEarnings(day: number) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return earningsData.find(item => {
      return item.date.getDate() === day &&
             item.date.getMonth() === month &&
             item.date.getFullYear() === year;
    });
  }

  // 计算收益颜色强度
  function getEarningsColor(total: number) {
    const absTotal = Math.abs(total);
    if (absTotal < 100) return 'bg-slate-100';
    if (absTotal < 300) return 'bg-slate-200';
    if (absTotal < 500) return 'bg-slate-300';
    if (total > 0) return 'bg-red-200';
    return 'bg-green-200';
  }

  // 上个月
  function prevMonth() {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }

  // 下个月
  function nextMonth() {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }

  // 选择日期
  function handleDateSelect(day: number) {
    if (!day) return;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    setSelectedDate(new Date(year, month, day));
  }

  // 获取选中日期的收益数据
  const selectedEarnings = selectedDate ? earningsData.find(item => {
    return item.date.getDate() === selectedDate.getDate() &&
           item.date.getMonth() === selectedDate.getMonth() &&
           item.date.getFullYear() === selectedDate.getFullYear();
  }) : null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const calendarDays = generateCalendarDays(year, month);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

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
          <h1 className="text-3xl font-bold text-slate-900">收益日历</h1>
        </div>

        {/* 日历卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          {/* 月份导航 */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevMonth}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              上个月
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {year}年 {monthNames[month]}
            </h2>
            <button
              onClick={nextMonth}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              下个月
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-16 bg-slate-50 rounded-lg"></div>;
              }
              
              const dayEarnings = getDayEarnings(day);
              const isSelected = selectedDate && selectedDate.getDate() === day;
              const earningsColor = dayEarnings ? getEarningsColor(dayEarnings.total) : 'bg-slate-50';
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  className={`h-16 rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all ${earningsColor} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <span className="text-sm font-medium text-slate-900">{day}</span>
                  {dayEarnings && (
                    <span className="text-xs font-medium mt-1">
                      {dayEarnings.total > 0 ? '+' : ''}{dayEarnings.total.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 收益详情 */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 收益详情
            </h2>
            
            {selectedEarnings ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">总收益</span>
                  <span className={`font-bold ${selectedEarnings.total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedEarnings.total > 0 ? '+' : ''}{formatCurrency(selectedEarnings.total, 'CNY')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">活动变动</span>
                  <span className={`font-medium ${selectedEarnings.activity > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedEarnings.activity > 0 ? '+' : ''}{formatCurrency(selectedEarnings.activity, 'CNY')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">市场收益</span>
                  <span className={`font-medium ${selectedEarnings.market > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedEarnings.market > 0 ? '+' : ''}{formatCurrency(selectedEarnings.market, 'CNY')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">利息收益</span>
                  <span className={`font-medium ${selectedEarnings.interest > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedEarnings.interest > 0 ? '+' : ''}{formatCurrency(selectedEarnings.interest, 'CNY')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                暂无该日期的收益数据
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
