import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '有钱么 - 个人资产管理',
  description: '极简、高效、可追溯的个人资产管理体验',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* 导航栏 */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="text-xl font-bold text-slate-900">
                  有钱么
                </a>
                <div className="hidden md:ml-10 md:flex md:space-x-6">
                  <a href="/assets" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    资产
                  </a>
                  <a href="/liabilities" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    负债
                  </a>
                  <a href="/transactions" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    交易
                  </a>
                  <a href="/activity" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    时间轴
                  </a>
                  <a href="/earnings" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    收益
                  </a>
                  <a href="/accounts" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    账户
                  </a>
                  <a href="/market-data" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    市场
                  </a>
                  <a href="/fire" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    FIRE
                  </a>
                  <a href="/settings" className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md">
                    设置
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 主内容 */}
        {children}
        
        {/* 移动端底部导航 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20">
          <div className="flex justify-around items-center h-16">
            <a href="/" className="flex flex-col items-center justify-center text-sm text-slate-700 hover:text-blue-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>总览</span>
            </a>
            <a href="/assets" className="flex flex-col items-center justify-center text-sm text-slate-700 hover:text-blue-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>资产</span>
            </a>
            <a href="/liabilities" className="flex flex-col items-center justify-center text-sm text-slate-700 hover:text-blue-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>负债</span>
            </a>
            <a href="/transactions" className="flex flex-col items-center justify-center text-sm text-slate-700 hover:text-blue-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>交易</span>
            </a>
            <a href="/settings" className="flex flex-col items-center justify-center text-sm text-slate-700 hover:text-blue-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>设置</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
