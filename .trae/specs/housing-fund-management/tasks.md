# Tasks

- [x] Task 1: 扩展资产类型定义，添加公积金类型
  - [x] SubTask 1.1: 在 `apps/web/app/assets/types.ts` 中添加 `housing_fund` 到 AssetType
  - [x] SubTask 1.2: 创建公积金相关的类型定义接口

- [x] Task 2: 数据库Schema更新
  - [x] SubTask 2.1: 在 `packages/data-access/sql/schema.sql` 中添加 `housing_fund_records` 表
  - [x] SubTask 2.2: 创建数据库迁移脚本

- [x] Task 3: 数据访问层实现
  - [x] SubTask 3.1: 创建公积金记录的数据访问方法
  - [x] SubTask 3.2: 实现公积金余额计算逻辑

- [x] Task 4: 资产录入界面扩展
  - [x] SubTask 4.1: 修改资产录入表单，支持公积金类型选择
  - [x] SubTask 4.2: 添加公积金专用字段（账号、城市、缴纳比例等）

- [x] Task 5: 公积金变动记录功能
  - [x] SubTask 5.1: 创建公积金变动记录列表组件
  - [x] SubTask 5.2: 创建添加到账记录表单
  - [x] SubTask 5.3: 创建添加提取记录表单

- [x] Task 6: 公积金详情页面
  - [x] SubTask 6.1: 创建公积金详情页面布局
  - [x] SubTask 6.2: 显示账户基本信息和统计
  - [x] SubTask 6.3: 集成变动记录列表

- [x] Task 7: 资产总览集成
  - [x] SubTask 7.1: 在资产总览中显示公积金统计信息
  - [x] SubTask 7.2: 确保公积金纳入总资产计算

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 4 依赖 Task 1
- Task 5 依赖 Task 3
- Task 6 依赖 Task 5
- Task 7 依赖 Task 4
