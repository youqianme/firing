'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@firing/utils';
import { useUser } from '../context/UserContext';
import { FireMember, FireCalculation } from '@firing/types';

// 根据性别获取默认退休年龄
function getDefaultRetirementAge(gender: 'male' | 'female'): number {
  return gender === 'male' ? 60 : 55;
}

export default function FirePage() {
  const { userId } = useUser();
  const [members, setMembers] = useState<FireMember[]>([]);
  const [calculation, setCalculation] = useState<FireCalculation | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMember, setEditingMember] = useState<FireMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    birthDate: '',
    retirementAge: 60,
    monthlyExpense: 0,
    targetRetirementAsset: 0
  });
  const [showHelp, setShowHelp] = useState(false);

  // 加载数据
  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  // 加载数据
  async function loadData() {
    try {
      setIsLoading(true);
      const headers = { 'x-user-id': userId };

      // 获取 FIRE 数据和成员
      const fireResponse = await fetch('/api/fire', { headers });
      const fireData = await fireResponse.json();

      if (fireData.members) {
        setMembers(fireData.members);
      }
      if (fireData.calculation) {
        setCalculation(fireData.calculation);
      }

      // 获取资产
      const assetsResponse = await fetch('/api/assets', { headers });
      const loadedAssets = await assetsResponse.json();
      setAssets(Array.isArray(loadedAssets) ? loadedAssets : []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 处理表单输入变化
  function handleInputChange(e: any) {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      };
      
      // 如果修改了性别，自动更新退休年龄（但允许用户后续手动修改）
      if (name === 'gender' && !editingMember) {
        newData.retirementAge = getDefaultRetirementAge(value as 'male' | 'female');
      }
      
      return newData;
    });
  }

  // 打开添加成员表单
  function openAddForm() {
    setEditingMember(null);
    setFormData({
      name: '',
      gender: 'male',
      birthDate: '',
      retirementAge: 60,
      monthlyExpense: 10000,
      targetRetirementAsset: 0
    });
    setIsEditing(true);
  }

  // 打开编辑成员表单
  function openEditForm(member: FireMember) {
    setEditingMember(member);
    setFormData({
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate,
      retirementAge: member.retirementAge,
      monthlyExpense: member.monthlyExpense,
      targetRetirementAsset: member.targetRetirementAsset
    });
    setIsEditing(true);
  }

  // 提交表单
  async function handleSubmit(e: any) {
    e.preventDefault();

    try {
      if (!formData.name || !formData.birthDate) {
        alert('请填写完整信息');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId
      };

      if (editingMember) {
        // 更新成员
        const response = await fetch('/api/fire', {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            id: editingMember.id,
            ...formData
          }),
        });
        const data = await response.json();
        if (data.members) setMembers(data.members);
        if (data.calculation) setCalculation(data.calculation);
      } else {
        // 创建成员
        const response = await fetch('/api/fire', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.members) setMembers(data.members);
        if (data.calculation) setCalculation(data.calculation);
      }

      setIsEditing(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Failed to save member:', error);
    }
  }

  // 删除成员
  async function handleDelete(memberId: string) {
    if (!confirm('确定要删除这个成员吗？')) return;

    try {
      const response = await fetch(`/api/fire?id=${memberId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });

      const data = await response.json();
      if (response.ok) {
        if (data.members) setMembers(data.members);
        if (data.calculation) setCalculation(data.calculation);
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  }

  // 获取计入 FIRE 的资产列表
  function getFireIncludedAssets(): any[] {
    const safeAssets = Array.isArray(assets) ? assets : [];
    return safeAssets.filter(asset => asset.includeInFire);
  }

  // 格式化月数为年月
  function formatMonths(months: number): string {
    if (months <= 0) return '已退休';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0 && remainingMonths > 0) {
      return `${years}年${remainingMonths}个月`;
    } else if (years > 0) {
      return `${years}年`;
    } else {
      return `${remainingMonths}个月`;
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

  const fireIncludedAssets = getFireIncludedAssets();

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="container mx-auto px-4 py-8">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">FIRE 目标</h1>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
              title="计算说明"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          </div>
          <button
            onClick={openAddForm}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            添加成员
          </button>
        </div>

        {/* 计算说明弹窗 */}
        {showHelp && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-8 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-blue-900">🔥 FIRE 计算说明</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">1.</span>
                  <span className="text-blue-800">退休年龄根据性别自动估算（男60/女55），可手动修改</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">2.</span>
                  <span className="text-blue-800">个人所需 = 每月支出 × 距离退休月数 + 退休时目标资产</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">3.</span>
                  <span className="text-blue-800">家庭总需求 = 所有成员个人所需之和</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-medium">4.</span>
                  <span className="text-blue-800">FIRE 进度 = 净资产 / 家庭总需求</span>
                </div>
              </div>
            </div>
            <p className="text-blue-600 text-xs mt-4">
              💡 提示：随着时间推移，距离退休月数会自动减少，所需总金额也会相应降低，FIRE 进度会自动提升。
            </p>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">本金耗尽策略：</span>
                退休前用资产给自己"发工资"，退休后依靠退休金生活。最激进的情况下，可以将"退休时目标资产"设为 0，表示退休时资产刚好耗尽。
              </p>
            </div>
          </div>
        )}

        {/* 成员表单 */}
        {isEditing && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {editingMember ? '编辑成员' : '添加成员'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    性别
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    出生日期
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    退休年龄
                  </label>
                  <input
                    type="number"
                    name="retirementAge"
                    value={formData.retirementAge}
                    onChange={handleInputChange}
                    min="40"
                    max="80"
                    step="1"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-sm text-slate-500 mt-1">
                    根据性别自动估算（男60/女55），可手动修改
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    每月支出 (元)
                  </label>
                  <input
                    type="number"
                    name="monthlyExpense"
                    value={formData.monthlyExpense}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    退休时目标资产 (元)
                  </label>
                  <input
                    type="number"
                    name="targetRetirementAsset"
                    value={formData.targetRetirementAsset}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 text-base md:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-sm text-slate-500 mt-1">
                    最激进可设为 0
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingMember ? '保存修改' : '添加成员'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* FIRE 进度卡片 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">家庭 FIRE 进度</h2>
              <p className="text-4xl font-bold text-blue-600">
                {calculation?.fireProgress.toFixed(1) ?? '0.0'}%
              </p>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              目标: {formatCurrency((calculation?.totalNeeded ?? 0) / 10000, 'CNY')} 万
            </div>
          </div>

          {/* 进度条 */}
          <div className="w-full bg-slate-200 rounded-full h-4 mb-8">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${calculation?.fireProgress ?? 0}%` }}
            ></div>
          </div>

          {/* 指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">FIRE 资产</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(calculation?.currentFireAssets ?? 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">负债</h3>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(calculation?.totalLiabilities ?? 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">净资产</h3>
              <p className={`text-2xl font-bold ${(calculation?.netWorth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(calculation?.netWorth ?? 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">距离目标</h3>
              <p className={`text-2xl font-bold ${(calculation?.fireGap ?? 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(calculation?.fireGap ?? 0) > 0
                  ? `+${formatCurrency(calculation?.fireGap ?? 0, 'CNY')}`
                  : formatCurrency(Math.abs(calculation?.fireGap ?? 0), 'CNY')}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">家庭月支出</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(calculation?.totalMonthlyExpense ?? 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">家庭总需求</h3>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(calculation?.totalNeeded ?? 0, 'CNY')}
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500 mb-2">家庭成员</h3>
              <p className="text-2xl font-bold text-slate-900">
                {members.length} 人
              </p>
            </div>
          </div>
        </div>

        {/* 家庭成员列表 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            家庭成员 ({members.length}人)
          </h2>
          {members.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              暂无家庭成员，请点击右上角"添加成员"
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {calculation?.members.map((memberCalc) => {
                const member = members.find(m => m.id === memberCalc.memberId);
                if (!member) return null;
                return (
                  <div key={member.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">{member.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(member)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          编辑
                        </button>
                        {members.length > 1 && (
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">性别</span>
                        <span className="text-slate-900">{member.gender === 'male' ? '男' : '女'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">退休年龄</span>
                        <span className="text-slate-900">{member.retirementAge}岁</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">距离退休</span>
                        <span className="text-slate-900">{formatMonths(memberCalc.monthsToRetirement)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">每月支出</span>
                        <span className="text-slate-900">{formatCurrency(member.monthlyExpense, 'CNY')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">退休时目标资产</span>
                        <span className="text-slate-900">{formatCurrency(member.targetRetirementAsset, 'CNY')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">个人所需</span>
                        <span className="text-slate-900 font-medium">{formatCurrency(memberCalc.personalTotalNeeded, 'CNY')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FIRE 资产明细 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">FIRE 资产明细</h2>
          </div>

          {/* 计入 FIRE 的资产 */}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-medium text-slate-900 mb-4">计入 FIRE 的资产</h3>
            {fireIncludedAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                暂无计入 FIRE 的资产
              </div>
            ) : (
              <div className="space-y-4">
                {fireIncludedAssets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{asset.name}</h4>
                      <p className="text-sm text-slate-500">{asset.type}</p>
                    </div>
                    <div className="font-medium text-slate-900">
                      {formatCurrency(asset.amount, asset.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 未计入 FIRE 的资产 */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">未计入 FIRE 的资产</h3>
            {assets.filter((a: any) => !a.includeInFire).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                暂无未计入 FIRE 的资产
              </div>
            ) : (
              <div className="space-y-4">
                {assets.filter((a: any) => !a.includeInFire).map((asset: any) => (
                  <div key={asset.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{asset.name}</h4>
                      <p className="text-sm text-slate-500">{asset.type}</p>
                    </div>
                    <div className="font-medium text-slate-900">
                      {formatCurrency(asset.amount, asset.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
