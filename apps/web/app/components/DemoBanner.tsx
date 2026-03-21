'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useSidebar } from '../context/SidebarContext';

export function DemoBanner() {
  const { isDemo, isLoading: isUserLoading, initDemo, resetDemo, clearData } = useUser();
  const { isCollapsed } = useSidebar();
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [leftOffset, setLeftOffset] = useState('0px');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) {
        setLeftOffset(isCollapsed ? '64px' : '256px');
      } else {
        setLeftOffset('0px');
      }
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setLeftOffset(isCollapsed ? '64px' : '256px');
      } else {
        setLeftOffset('0px');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]);

  // 检查是否有数据
  useEffect(() => {
    const checkData = async () => {
      try {
        const response = await fetch('/api/assets');
        const data = await response.json();
        setHasData(data.assets && data.assets.length > 0);
      } catch {
        setHasData(false);
      }
    };
    if (isDemo) {
      checkData();
    }
  }, [isDemo]);

  // 加载中或不是游客模式时不显示
  if (isUserLoading || !isDemo) return null;

  const handleInit = async () => {
    try {
      setIsLoading(true);
      await initDemo();
    } catch (error) {
      console.error('Init demo failed:', error);
    } finally {
      setIsLoading(false);
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
      <div
        className="fixed bottom-0 right-0 bg-slate-100 border-t border-slate-200 text-slate-600 px-4 py-2 z-15 transition-all duration-300"
        style={{ left: leftOffset }}
      >
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-500">游客模式</span>
          </div>
          <div className="flex items-center space-x-3">
            {hasData ? (
              <>
                <button
                  onClick={handleClear}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  清空
                </button>
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  重置
                </button>
              </>
            ) : (
              <button
                onClick={handleInit}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                填充演示数据
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
