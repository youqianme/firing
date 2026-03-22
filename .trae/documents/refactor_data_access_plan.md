# 数据访问层重构计划

## 目标
按照最佳实践重构 dataAccess.ts，统一处理数据库 snake_case 到 TypeScript camelCase 的转换。

## 当前问题
1. 使用 `getProp` 函数动态查找字段，性能开销大
2. 每个方法重复相同的字段映射逻辑
3. 容易遗漏字段映射
4. 代码可读性差

## 重构方案

### 1. 统一转换函数
为每个实体创建专门的转换函数，显式映射每个字段：

```typescript
// 资产转换
const toAsset = (row: any): Asset => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  type: row.type,
  subType: row.sub_type,
  currency: row.currency,
  amount: row.amount,
  includeInFire: row.include_in_fire === 1,
  accountId: row.account_id,
  quantity: row.quantity,
  unitPrice: row.unit_price,
  interestRate: row.interest_rate,
  startDate: row.start_date,
  endDate: row.end_date,
  valuationMethod: row.valuation_method,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  notes: row.notes,
});
```

### 2. 简化仓库方法
使用转换函数简化所有 CRUD 方法：

```typescript
getAll: async (userId: string) => {
  const rows = await adapter.execute('SELECT * FROM assets WHERE user_id = ?', [userId]);
  return rows.map(toAsset);
},

getById: async (userId: string, id: string) => {
  const row = await adapter.get('SELECT * FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
  return row ? toAsset(row) : undefined;
},
```

## 实施步骤

### Phase 1: Asset 模块重构
1. 创建 `toAsset` 转换函数
2. 更新 `assetRepository` 所有方法
3. 移除 `getProp` 相关代码

### Phase 2: Liability 模块重构
1. 创建 `toLiability` 转换函数
2. 更新 `liabilityRepository` 所有方法

### Phase 3: Payment 模块重构
1. 创建 `toPayment` 转换函数
2. 更新 `paymentRepository` 所有方法

### Phase 4: Transaction 模块重构
1. 创建 `toTransaction` 转换函数
2. 更新 `transactionRepository` 所有方法

### Phase 5: Account 模块重构
1. 创建 `toAccount` 转换函数
2. 更新 `accountRepository` 所有方法

### Phase 6: 其他模块重构
1. MarketData 模块
2. Activity 模块
3. FireConfig 模块
4. UserSettings 模块

### Phase 7: 清理
1. 删除未使用的 `getProp` 函数
2. 验证所有类型定义
3. 运行类型检查

## 文件变更清单

| 文件路径 | 变更类型 |
|---------|---------|
| apps/web/lib/dataAccess.ts | 重构 |

## 风险评估
- **低风险**：纯重构，不改变业务逻辑
- **回滚策略**：如有问题，可快速回滚到使用 getProp 的版本

## 验证计划
1. 类型检查通过
2. 页面渲染正常
3. 数据读写正常
