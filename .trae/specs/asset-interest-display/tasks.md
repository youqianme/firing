# 有钱么 - 资产利息展示功能 - 实施计划

## [x] Task 1: 添加利息计算函数
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在 assets/page.tsx 文件中添加 calculateInterest 函数
  - 函数应根据本金、年化利率、开始日期和结束日期计算利息
  - 考虑实际存款期限（天数）计算利息
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 函数应正确计算定期存款利息，例如：50000元，2.1%年化利率，1年期应返回1050元
- **Notes**: 使用日期差异计算实际存款期限，确保计算准确性

## [x] Task 2: 修改资产列表展示部分
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 在资产列表的定期存款类型资产中添加利息信息展示
  - 利息信息应显示在资产名称下方，与到期日信息相邻
  - 只有定期存款类型的资产才显示利息信息
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgment` TR-2.1: 利息信息显示在正确位置，与到期日信息相邻
  - `human-judgment` TR-2.2: 只有定期存款类型的资产显示利息信息
- **Notes**: 使用条件渲染确保只有定期存款类型的资产显示利息

## [x] Task 3: 优化利息展示样式
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 为利息信息添加绿色文字样式，使其醒目
  - 确保信息层次清晰，与其他信息区分
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 利息信息以绿色文字显示
  - `human-judgment` TR-3.2: 信息层次清晰，易于阅读
- **Notes**: 使用现有的 Tailwind CSS 类名保持风格一致

## [x] Task 4: 测试验证
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 验证利息计算的准确性
  - 验证利息展示的位置和样式
  - 验证条件显示功能
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 利息计算结果正确
  - `human-judgment` TR-4.2: 界面展示符合设计要求
- **Notes**: 使用现有的测试数据进行验证
