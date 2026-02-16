# 有钱么 - 资产利息展示功能 - 产品需求文档

## Overview
- **Summary**: 在资产管理页面中，为定期存款类型的资产添加利息计算和展示功能，帮助用户直观了解投资收益。
- **Purpose**: 解决用户无法快速查看定期存款预期收益的问题，提高资产透明度和用户体验。
- **Target Users**: 使用有钱么应用管理个人资产的用户。

## Goals
- 在资产列表中为定期存款类型的资产显示预计利息
- 准确计算定期存款的利息收益
- 以醒目的方式展示利息信息

## Non-Goals (Out of Scope)
- 不修改其他类型资产的展示方式
- 不改变现有的资产添加和编辑功能
- 不涉及其他页面的利息计算

## Background & Context
- 应用使用 React + Next.js 开发
- 已有完整的资产和账户管理功能
- 定期存款资产包含金额、利率、开始日期和结束日期等字段

## Functional Requirements
- **FR-1**: 计算定期存款的预计利息
- **FR-2**: 在资产列表中展示定期存款的预计利息
- **FR-3**: 以醒目的方式显示利息信息

## Non-Functional Requirements
- **NFR-1**: 利息计算准确，考虑实际存款期限
- **NFR-2**: 界面展示美观，信息层次清晰
- **NFR-3**: 性能影响最小，不增加页面加载时间

## Constraints
- **Technical**: 使用现有的 React 组件和数据结构
- **Business**: 保持与现有设计风格一致

## Assumptions
- 定期存款资产包含必要的字段：金额、利率、开始日期、结束日期
- 利率为年化利率

## Acceptance Criteria

### AC-1: 利息计算准确性
- **Given**: 存在一个定期存款资产，金额为50000元，年化利率为2.1%，期限为1年
- **When**: 系统加载资产列表
- **Then**: 显示的预计利息应为1050元
- **Verification**: `programmatic`

### AC-2: 利息展示位置
- **Given**: 资产列表中有定期存款类型的资产
- **When**: 查看资产列表
- **Then**: 利息信息显示在资产名称下方，与到期日信息相邻
- **Verification**: `human-judgment`

### AC-3: 利息展示样式
- **Given**: 资产列表中有定期存款类型的资产
- **When**: 查看资产列表
- **Then**: 利息信息以绿色文字显示，与其他信息区分
- **Verification**: `human-judgment`

### AC-4: 条件显示
- **Given**: 资产列表中有不同类型的资产
- **When**: 查看资产列表
- **Then**: 只有定期存款类型的资产显示利息信息
- **Verification**: `human-judgment`

## Open Questions
- [ ] 无
