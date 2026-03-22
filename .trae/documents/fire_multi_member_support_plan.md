# FIRE 多成员支持改造计划

## 目标
将现有的单人 FIRE 规划改造为支持家庭多成员的 FIRE 规划系统，根据性别自动计算法定退休年龄（男性60岁，女性55岁）。

## 已完成的修改

### 1. 数据库 Schema ✅
- 创建 `fire_members` 表替代 `fire_config` 表
- 字段：id, user_id, name, gender, birth_date, monthly_expense, target_retirement_asset, updated_at, created_at

### 2. 类型定义 ✅
- `FireMember`：成员基本信息
- `FireMemberCalculation`：单个成员计算结果
- `FireCalculation`：家庭汇总计算结果

### 3. 数据访问层 ✅
- 创建 `fireMemberRepository`（packages/data-access）
- 更新 web 端 `dataAccess.ts`，添加 `fireMemberRepository`

## 待完成的修改

### 4. API 路由改造
**文件**: `apps/web/app/api/fire/route.ts`

**修改内容**:
- GET：返回家庭成员列表 + 汇总计算结果
- POST：创建新成员
- PUT：更新成员信息
- DELETE：删除成员

**计算逻辑**:
```typescript
// 根据性别计算退休年龄
function getRetirementAge(gender: 'male' | 'female'): number {
  return gender === 'male' ? 60 : 55;
}

// 计算距离退休月数
function calculateMonthsToRetirement(birthDate: string, retirementAge: number): number

// 家庭汇总计算
// totalNeeded = sum(每个成员的月支出 × 距离退休月数 + 退休目标资产)
```

### 5. 页面 UI 改造
**文件**: `apps/web/app/fire/page.tsx`

**新增组件**:
1. **成员列表展示**
   - 显示所有家庭成员卡片
   - 每个卡片显示：姓名、性别、出生日期、月支出、退休年龄、距离退休时间

2. **添加/编辑成员表单**
   - 姓名（文本输入）
   - 性别（单选：男/女）
   - 出生日期（日期选择）
   - 每月支出（数字输入）
   - 退休时目标资产（数字输入，可选，默认0）
   - 退休年龄（根据性别自动计算并显示，不可编辑）

3. **家庭汇总卡片**
   - 家庭成员数量
   - 家庭月支出总计
   - 家庭 FIRE 目标总额
   - 当前 FIRE 资产
   - 总体进度百分比

4. **操作按钮**
   - 添加成员
   - 编辑成员
   - 删除成员（带确认）

### 6. 其他文件更新

**mockData.ts**:
- 更新 `mockFireConfig` 为 `mockFireMembers`（数组）

**demo/init/route.ts**:
- 初始化演示数据时创建多个成员

**auth/register/route.ts**:
- 用户注册时不再自动创建 fire_config 记录

## 数据结构示例

### FireMember
```typescript
{
  id: "member_001",
  userId: "demo",
  name: "小明",
  gender: "male",
  birthDate: "1990-01-01",
  monthlyExpense: 10000,
  targetRetirementAsset: 0,
  updatedAt: "2024-01-01T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### FireCalculation
```typescript
{
  members: [
    {
      memberId: "member_001",
      name: "小明",
      gender: "male",
      birthDate: "1990-01-01",
      retirementAge: 60,
      monthsToRetirement: 360,
      monthlyExpense: 10000,
      targetRetirementAsset: 0,
      personalTotalNeeded: 3600000
    }
  ],
  totalMonthlyExpense: 10000,
  totalNeeded: 3600000,
  currentFireAssets: 800000,
  fireProgress: 22.2,
  fireGap: 2800000
}
```

## 页面布局规划

```
┌─────────────────────────────────────────┐
│ FIRE 目标                    [添加成员] │
├─────────────────────────────────────────┤
│ [成员表单 - 点击添加/编辑时显示]          │
├─────────────────────────────────────────┤
│ 家庭 FIRE 进度        22.2%             │
│ [████████░░░░░░░░░░░░]                  │
│ 目标: 360万                             │
├─────────────────────────────────────────┤
│ 当前资产    │ 距离目标    │ 家庭月支出   │
│ 80万       │ +280万     │ 1万         │
├─────────────────────────────────────────┤
│ 家庭成员（2人）                         │
├─────────────────────────────────────────┤
│ ┌─────────────┐  ┌─────────────┐       │
│ │ 小明        │  │ 小红        │       │
│ │ 男 | 60岁退休│  │ 女 | 55岁退休│       │
│ │ 月支出: 1万 │  │ 月支出: 0.8万│       │
│ │ 距退休: 30年│  │ 距退休: 25年│       │
│ │ [编辑][删除]│  │ [编辑][删除]│       │
│ └─────────────┘  └─────────────┘       │
├─────────────────────────────────────────┤
│ FIRE 资产明细                           │
└─────────────────────────────────────────┘
```

## 实施步骤

1. **更新 API 路由** (`apps/web/app/api/fire/route.ts`)
   - 实现多成员 CRUD 接口
   - 实现家庭汇总计算

2. **更新页面组件** (`apps/web/app/fire/page.tsx`)
   - 重构为支持多成员的 UI
   - 添加成员管理功能

3. **更新演示数据** (`apps/web/app/api/demo/init/route.ts`)
   - 修改初始化逻辑，创建多个成员

4. **更新 mockData** (`packages/utils/mockData.ts`)
   - 更新为新的数据结构

5. **测试验证**
   - 添加成员
   - 编辑成员
   - 删除成员
   - 验证计算结果

## 注意事项

1. 退休年龄根据性别自动计算，用户不可修改
2. 删除成员时需要确认提示
3. 至少保留一个成员（不能全部删除）
4. 计算结果随时间动态更新
