# 页面 Loading 优化计划

## 问题分析

### 问题描述
进入 `/accounts` 页面时，会有跳变（从 API 拿到数据后），这是因为页面在数据加载完成前没有显示 loading 状态，导致用户先看到空状态或默认状态，然后数据突然加载完成导致页面跳变。

### 受影响页面分析

经过代码审查，发现以下页面存在类似问题：

| 页面 | 文件路径 | 当前状态 | 问题 |
|------|----------|----------|------|
| accounts | `app/accounts/page.tsx` | ❌ 缺少 loading | 无 isLoading 状态，数据加载时显示空列表 |
| fire | `app/fire/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| assets | `app/assets/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| liabilities | `app/liabilities/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| earnings | `app/earnings/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| transactions | `app/transactions/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| activity | `app/activity/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| settings | `app/settings/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |
| market-data | `app/market-data/page.tsx` | ❌ 缺少 loading | 无 isLoading 状态，但数据量小跳变不明显 |
| 首页 | `app/page.tsx` | ✅ 已有 loading | 已实现完整 loading 状态 |

### 主要问题页面

1. **`/accounts` 页面** - 最严重，完全没有 loading 状态管理
2. **`/market-data` 页面** - 轻微，数据量小但理论上也需要

## 解决方案

### 统一 Loading 组件样式

参考已有页面的 loading 实现，采用统一的 loading UI：

```tsx
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
```

### 具体修改计划

#### 1. `/accounts` 页面修改

**文件**: `apps/web/app/accounts/page.tsx`

**修改内容**:
- 添加 `isLoading` 状态: `const [isLoading, setIsLoading] = useState(true);`
- 在 `loadAccounts` 函数中设置 loading 状态
- 在数据加载完成前显示 loading UI

**代码变更**:
```tsx
// 添加状态
const [isLoading, setIsLoading] = useState(true);

// 修改 loadAccounts 函数
async function loadAccounts() {
  try {
    setIsLoading(true);  // 开始加载
    const response = await fetch('/api/accounts', {
      headers: { 'x-user-id': userId }
    });
    const loadedAccounts = await response.json();
    setAccounts(Array.isArray(loadedAccounts) ? loadedAccounts : []);
  } catch (error) {
    console.error('Failed to load accounts:', error);
  } finally {
    setIsLoading(false);  // 加载完成
  }
}

// 添加 loading UI
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
```

#### 2. `/market-data` 页面修改（可选）

**文件**: `apps/web/app/market-data/page.tsx`

**修改内容**:
- 添加 `isLoading` 状态
- 在 `loadMarketData` 函数中设置 loading 状态
- 由于数据量小，此修改优先级较低

## 实施步骤

1. **修改 `/accounts` 页面**
   - 添加 `isLoading` 状态
   - 修改 `loadAccounts` 函数
   - 添加 loading UI 渲染逻辑

2. **（可选）修改 `/market-data` 页面**
   - 添加 `isLoading` 状态
   - 修改 `loadMarketData` 函数
   - 添加 loading UI 渲染逻辑

3. **验证测试**
   - 测试 `/accounts` 页面加载时是否显示 loading
   - 测试数据加载完成后是否正常显示
   - 测试网络慢的情况下的用户体验

## 预期效果

- 进入 `/accounts` 页面时，先显示 loading 状态
- 数据加载完成后平滑过渡到正常页面内容
- 消除页面跳变问题
- 用户体验更加流畅

## 代码实现

### accounts/page.tsx 完整修改

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { AccountType, Currency, type Account } from './types';

export default function AccountsPage() {
  const { userId } = useUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);  // 新增
  const [isEditing, setIsEditing] = useState(false);
  // ... 其他状态

  // 加载账户数据
  useEffect(() => {
    if (userId) {
      loadAccounts();
    }
  }, [userId]);

  // 加载账户数据
  async function loadAccounts() {
    try {
      setIsLoading(true);  // 新增
      const response = await fetch('/api/accounts', {
        headers: {
          'x-user-id': userId
        }
      });
      const loadedAccounts = await response.json();
      setAccounts(Array.isArray(loadedAccounts) ? loadedAccounts : []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setIsLoading(false);  // 新增
    }
  }

  // ... 其他函数

  // 新增 loading UI
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
    // ... 原有 JSX
  );
}
```
