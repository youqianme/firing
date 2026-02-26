'use client';

import { useEffect, useState } from 'react';
import { AccountType, Currency, type Account } from './types';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other' as AccountType,
    currency: 'CNY' as Currency,
    notes: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // 加载账户数据
  useEffect(() => {
    loadAccounts();
  }, []);

  // 加载账户数据
  async function loadAccounts() {
    try {
      const response = await fetch('/api/accounts');
      const loadedAccounts = await response.json();
      setAccounts(loadedAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  }

  // 处理表单输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  // 重置表单
  function resetForm() {
    setFormData({
      name: '',
      type: 'other',
      currency: 'CNY',
      notes: ''
    });
    setEditingId(null);
  }

  // 新增账户
  function handleAddAccount() {
    resetForm();
    setIsEditing(true);
  }

  // 编辑账户
  function handleEditAccount(account: Account) {
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency || 'CNY',
      notes: account.notes || ''
    });
    setEditingId(account.id);
    setIsEditing(true);
  }

  // 保存账户
  async function saveAccount() {
    try {
      if (!formData.name.trim()) {
        setMessage('账户名称不能为空');
        setTimeout(() => setMessage(''), 2000);
        return;
      }

      const accountData = {
        name: formData.name,
        type: formData.type,
        currency: formData.currency,
        notes: formData.notes
      };

      if (editingId) {
        // 更新现有账户
        const response = await fetch(`/api/accounts/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        });

        if (response.ok) {
          const updatedAccount = await response.json();
          const updatedAccounts = accounts.map(account =>
            account.id === editingId ? updatedAccount : account
          );
          setAccounts(updatedAccounts);
          setMessage('账户更新成功');
        } else {
          throw new Error('Failed to update account');
        }
      } else {
        // 创建新账户
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        });

        if (response.ok) {
          const newAccount = await response.json();
          setAccounts([...accounts, newAccount]);
          setMessage('账户创建成功');
        } else {
          throw new Error('Failed to create account');
        }
      }

      setTimeout(() => setMessage(''), 2000);
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save account:', error);
      setMessage('保存失败');
      setTimeout(() => setMessage(''), 2000);
    }
  }

  // 删除账户
  async function handleDeleteAccount(id: string) {
    if (window.confirm('确定要删除这个账户吗？')) {
      try {
        const response = await fetch(`/api/accounts/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          const filteredAccounts = accounts.filter(account => account.id !== id);
          setAccounts(filteredAccounts);
          setMessage('账户删除成功');
          setTimeout(() => setMessage(''), 2000);
        } else {
          throw new Error('Failed to delete account');
        }
      } catch (error) {
        console.error('Failed to delete account:', error);
        setMessage('删除失败');
        setTimeout(() => setMessage(''), 2000);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">账户管理</h1>
          <button
            onClick={handleAddAccount}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增账户
          </button>
        </div>

        {/* 账户表单 */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {editingId ? '编辑账户' : '新增账户'}
            </h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
            
            <div className="space-y-4">
              {/* 账户名称 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  账户名称 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 账户类型 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  账户类型
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="broker">券商</option>
                  <option value="bank">银行卡</option>
                  <option value="cash">现金</option>
                  <option value="other">其他</option>
                </select>
              </div>

              {/* 币种 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  币种
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CNY">人民币 (CNY)</option>
                  <option value="USD">美元 (USD)</option>
                  <option value="EUR">欧元 (EUR)</option>
                  <option value="JPY">日元 (JPY)</option>
                  <option value="KRW">韩元 (KRW)</option>
                </select>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            {/* 按钮 */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveAccount}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* 账户列表 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">账户列表</h2>
          </div>
          
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              暂无账户，点击上方「新增账户」按钮开始管理
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {accounts.map((account) => (
                <div key={account.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900">{account.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-slate-500">
                          类型: {account.type === 'broker' ? '券商' : account.type === 'bank' ? '银行卡' : account.type === 'cash' ? '现金' : '其他'}
                        </span>
                        {account.currency && (
                          <span className="text-sm text-slate-500">
                            币种: {account.currency}
                          </span>
                        )}
                      </div>
                      {account.notes && (
                        <p className="text-sm text-slate-500 mt-2">
                          备注: {account.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAccount(account)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
