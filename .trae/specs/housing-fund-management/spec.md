# 公积金管理功能规格

## Why
用户需要原生支持公积金（住房公积金）管理功能，包括到账记录、提取记录等，以便更准确地追踪这部分长期储蓄资产。

## What Changes
- 新增 `housing_fund` 资产类型
- 新增公积金变动记录表（到账、提取）
- 扩展资产录入界面支持公积金类型
- 支持公积金账户的增删改查
- 支持公积金变动记录的增删改查
- 账户类型添加公积金选项

## Impact
- Affected specs: 资产管理、账户管理
- Affected code: 
  - `apps/web/app/assets/types.ts` - 添加新资产类型
  - `apps/web/app/assets/page.tsx` - 添加公积金录入界面和详情入口
  - `apps/web/app/accounts/types.ts` - 添加公积金账户类型
  - `apps/web/app/accounts/page.tsx` - 添加公积金账户选项
  - `packages/data-access/sql/schema.sql` - 添加公积金变动记录表
  - `packages/data-access/src/repositories/housingFundRepository.ts` - 数据访问层
  - 新增 `apps/web/app/housing-fund/` 模块
  - 新增 `apps/web/app/api/housing-fund/records/route.ts` - API路由

## ADDED Requirements

### Requirement: 公积金资产类型支持
系统 SHALL 支持将公积金作为一种独立的资产类型进行管理。

#### Scenario: 创建公积金资产
- **GIVEN** 用户在资产录入页面
- **WHEN** 选择资产类型为"公积金"
- **THEN** 系统创建公积金资产（字段与其他资产相同：名称、金额、币种、备注）
- **AND** 公积金默认不计入 FIRE 资产

### Requirement: 公积金变动记录
系统 SHALL 支持记录公积金的到账和提取等变动。

#### Scenario: 记录公积金到账
- **GIVEN** 用户已创建公积金资产
- **WHEN** 用户添加一笔到账记录（个人缴纳+单位缴纳）
- **THEN** 系统自动计算并更新公积金余额
- **AND** 记录到账日期、金额、类型（个人/单位）

#### Scenario: 记录公积金提取
- **GIVEN** 用户已创建公积金资产
- **WHEN** 用户添加一笔提取记录
- **THEN** 系统自动扣减公积金余额
- **AND** 记录提取日期、金额、提取原因

### Requirement: 公积金账户管理
系统 SHALL 支持管理多个公积金账户（如不同城市）。

#### Scenario: 创建多个公积金账户
- **GIVEN** 用户有多个城市的公积金账户
- **WHEN** 用户创建多个公积金资产
- **THEN** 系统分别管理每个账户的余额和变动记录

### Requirement: 公积金统计展示
系统 SHALL 在资产总览中展示公积金相关信息。

#### Scenario: 查看公积金统计
- **GIVEN** 用户有公积金资产
- **WHEN** 用户查看资产总览
- **THEN** 系统显示公积金总额、本月到账、累计缴纳等信息

## Database Schema

### 公积金变动记录表
```sql
CREATE TABLE IF NOT EXISTS housing_fund_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'default',
  asset_id TEXT NOT NULL,                    -- 关联的资产ID
  type TEXT NOT NULL,                        -- 变动类型: deposit(到账), withdraw(提取), interest(利息)
  amount DOUBLE PRECISION NOT NULL,          -- 变动金额
  personal_amount DOUBLE PRECISION,          -- 个人缴纳金额（仅deposit类型）
  company_amount DOUBLE PRECISION,           -- 单位缴纳金额（仅deposit类型）
  date TEXT NOT NULL,                        -- 变动日期
  reason TEXT,                               -- 提取原因（仅withdraw类型）
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE
);
```

## UI 设计

### 资产录入页面
- 资产类型选择器添加"公积金"选项（图标：🏛️）
- 公积金资产字段：名称、金额、币种、备注（与其他资产一致）
- 公积金默认不计入 FIRE 资产

### 资产列表页面
- 公积金资产显示"公积金"类型标签
- 公积金资产显示"详情"按钮，点击进入详情页

### 公积金详情页面
- **路径**: `/housing-fund/[id]`
- **账户信息卡片**:
  - 账户名称
  - 当前余额
- **统计信息卡片**:
  - 本月到账金额
  - 累计缴纳金额
  - 累计提取金额
  - 缴纳月数
  - 净缴纳金额
- **变动记录列表**:
  - 显示所有到账/提取记录
  - 支持删除记录
- **添加记录按钮**:
  - 弹出表单添加到账/提取记录

### 添加变动记录表单
- **到账记录**:
  - 到账日期
  - 个人缴纳金额
  - 单位缴纳金额
  - 备注
- **提取记录**:
  - 提取日期
  - 提取金额
  - 提取原因
  - 备注

### 账户管理页面
- 账户类型选择器添加"公积金"选项

## 操作路径

1. **创建公积金资产**: 资产管理 → 新增资产 → 选择"公积金"类型 → 填写信息 → 保存
2. **查看公积金详情**: 资产管理 → 点击公积金资产的"详情"按钮
3. **添加变动记录**: 公积金详情页 → 点击"添加记录" → 选择类型 → 填写信息 → 保存
4. **查看变动记录**: 公积金详情页 → 查看"变动记录"列表
5. **创建公积金账户**: 账户管理 → 新增账户 → 选择"公积金"类型
