# 有钱么 (YouQianMe) - 产品需求文档

## Overview
- **Summary**: 一款面向个人的资产负债管理应用，帮助用户快速查看净资产、追踪变动原因、管理多资产类型，并支持 FIRE 目标规划。
- **Purpose**: 解决传统记账软件功能冗余与数据噪声问题，提供极简、高效、可追溯的个人资产管理体验。
- **Target Users**: FIRE 规划者、多账号投资者、轻量管理者。

## Goals
- 一屏看清：总资产、总负债、净资产、收益与趋势
- 数据可信：每次变动可追溯（时间轴/台账），关键计算口径透明
- 多资产类型：股票/现金/定期/实物资产等统一口径汇总
- 可行动：支持转账台账、定期兑付、负债还款记录等“会影响余额”的操作

## Non-Goals (Out of Scope)
- 银行/券商自动同步（OpenAPI 直连）
- 多用户协作与权限体系
- 消费记账、预算、账单识别等复杂记账功能

## Background & Context
- 产品定位为个人财务管理工具，专注于资产负债追踪和 FIRE 规划
- 采用本地数据存储方案，确保数据隐私和离线可用性
- 技术栈建议：React/Next.js + Tailwind CSS + SQLite

## Functional Requirements
- **FR-1**: 总览（Dashboard）：展示核心指标、资产/负债结构、净资产趋势、最近动态
- **FR-2**: 时间轴（Activity Timeline）：记录所有资产/负债/交易变动，支持筛选和分页
- **FR-3**: 资产管理（Assets）：支持多种资产类型，统一折算汇总，标记 FIRE 计入
- **FR-4**: 负债管理（Liabilities）：记录负债余额，支持还款记录和余额变化追踪
- **FR-5**: 交易台账（Transactions）：记录资产转移、定期兑付等影响余额的行为
- **FR-6**: 收益日历（Earnings Calendar）：按月展示收益热力图，支持查看每日收益拆分
- **FR-7**: FIRE 目标（FIRE Goal）：配置年支出和安全提取率，计算目标资产和完成进度
- **FR-8**: 市场数据（Market Data）：管理汇率、金价等用于币种折算的数据
- **FR-9**: 账户管理（Accounts）：支持多账户维度的资产归属和汇总
- **FR-10**: 设置与数据管理：本位币设置、隐私模式、数据导出/导入/清空

## Non-Functional Requirements
- **NFR-1**: 性能：首屏加载 < 2s（本地数据库场景）
- **NFR-2**: 可靠性：关键操作原子性，避免部分写入
- **NFR-3**: 可用性：完整的空状态、加载态、错误态处理
- **NFR-4**: 安全性：默认单用户本地数据，不记录敏感信息
- **NFR-5**: 兼容性：支持主流桌面浏览器和移动设备

## Constraints
- **Technical**: React/Next.js + Tailwind CSS + SQLite
- **Business**: 单用户本地应用，无后端服务依赖
- **Dependencies**: 本地存储（SQLite），可选的市场数据更新（未来）

## Assumptions
- 用户具备基本的财务管理知识
- 初期采用手动输入方式管理资产和负债
- 市场数据通过手动维护，不依赖外部 API

## Acceptance Criteria

### AC-1: 首次使用引导
- **Given**: 系统中没有任何资产与负债
- **When**: 用户进入 Dashboard
- **Then**: 展示空状态引导（添加资产、添加负债、设置本位币），且不会显示误导性的 0 值趋势图
- **Verification**: `human-judgment`

### AC-2: 市场数据缺失提示
- **Given**: 存在 USD 资产，但系统缺少 USD/CNY 汇率
- **When**: 用户进入 Dashboard
- **Then**: 页面显示“缺少市场数据：USD/CNY”，并提供跳转/快捷补录入口
- **Verification**: `programmatic`

### AC-3: 资产增删改操作可追溯
- **Given**: 用户有一条资产记录
- **When**: 用户新增/编辑/删除该记录
- **Then**: 时间轴出现对应 CREATE/UPDATE/DELETE 记录，且能看到对象名称与变动金额
- **Verification**: `programmatic`

### AC-4: 定期存款到期兑付
- **Given**: 存在一笔未兑付的定期存款且已到期
- **When**: 用户点击“兑付”并确认
- **Then**: 资产状态/余额按规则变化；时间轴出现 REDEEM 记录
- **Verification**: `programmatic`

### AC-5: 负债还款记录
- **Given**: 某负债余额为 5,000
- **When**: 用户新增一条还款记录金额 1,000
- **Then**: 负债余额变为 4,000；还款历史出现该条；时间轴出现 PAYMENT/UPDATE 记录
- **Verification**: `programmatic`

### AC-6: 转账交易记录
- **Given**: 存在资产 A 与资产 B
- **When**: 用户新增一条转账交易（From=A，To=B，金额>0）并保存
- **Then**: 交易列表出现该记录；A 余额减少、B 余额增加；时间轴出现 TRANSFER 记录
- **Verification**: `programmatic`

### AC-7: FIRE 目标配置
- **Given**: 用户进入 FIRE 页面
- **When**: 用户输入年支出与 SWR 并保存
- **Then**: 页面展示目标资产、当前 FIRE 资产、完成率、差额
- **Verification**: `programmatic`

### AC-8: 收益日历查看
- **Given**: 当前展示某个月份
- **When**: 用户点击“上个月/下个月”
- **Then**: 展示加载态；请求新月份数据；完成后月历与月度合计更新
- **Verification**: `programmatic`

### AC-9: 数据导出导入
- **Given**: 用户已有资产/负债/配置等数据
- **When**: 用户导出为文件并在另一环境导入
- **Then**: 资产/负债/时间轴/台账/配置都被恢复；关键汇总口径一致
- **Verification**: `programmatic`

### AC-10: 隐私模式
- **Given**: 页面展示了金额
- **When**: 用户开启隐私模式
- **Then**: 所有金额字段被隐藏/模糊化；关闭后恢复
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持自动市场数据更新（如汇率、股价）？
- [ ] 是否需要添加预算管理功能？
- [ ] 是否需要支持多语言？
- [ ] 是否需要添加数据备份到云存储的功能？