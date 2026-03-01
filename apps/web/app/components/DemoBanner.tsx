'use client';

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

export function DemoBanner() {
  const { isDemo, resetDemo, clearData, register } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  if (!isDemo) return null;

  const handleRegister = async () => {
    const username = prompt('请输入用户名以注册账户（模拟注册）：');
    if (username) {
      await register(username);
    }
  };

  const handleReset = async () => {
    if (window.confirm('确定要重置为演示数据吗？这将覆盖当前所有数据！')) {
      try {
        setIsLoading(true);
        await resetDemo();
      } catch (error) {
        console.error('Reset failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClear = async () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      try {
        setIsLoading(true);
        await clearData();
      } catch (error) {
        console.error('Clear failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
            <p className="text-slate-700 font-medium">正在处理数据...</p>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-200 text-yellow-800 px-4 py-3 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">游客模式</span>
            <span className="hidden md:inline ml-2 text-sm text-yellow-700">您正在使用临时游客账户，注册后可永久保存数据。</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleClear}
              disabled={isLoading}
              className="text-sm font-medium hover:text-yellow-900 underline disabled:opacity-50"
            >
              清空数据
            </button>
            <button 
              onClick={handleReset}
              disabled={isLoading}
              className="text-sm font-medium hover:text-yellow-900 underline disabled:opacity-50"
            >
              填充演示数据
            </button>
            <button 
              onClick={handleRegister}
              disabled={isLoading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              注册账户
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
