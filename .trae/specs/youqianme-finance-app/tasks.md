# 有钱么 (YouQianMe) - 实现计划

## [x] 任务 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 初始化 Next.js 项目
  - 配置 Tailwind CSS
  - 设置 SQLite 本地数据库
  - 创建基础目录结构
- **Acceptance Criteria Addressed**: None（基础设施）
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目能正常启动，无编译错误
  - `human-judgment` TR-1.2: 目录结构清晰，配置文件完整
- **Notes**: 选择适合的 SQLite 库（如 better-sqlite3 或 sqlite3）

## [x] 任务 2: 核心数据模型设计与实现
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 设计资产、负债、交易、账户、市场数据、时间轴等核心表结构
  - 实现数据模型的增删改查操作
  - 建立币种折算逻辑
- **Acceptance Criteria Addressed**: AC-3, AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: 所有数据模型能正确创建和查询
  - `programmatic` TR-2.2: 币种折算逻辑能正确处理不同币种的资产
- **Notes**: 考虑数据一致性和事务处理

## [x] 任务 3: 总览页面 (Dashboard) 实现
- **Priority**: P0
- **Depends On**: 任务 2
- **Description**:
  - 实现核心指标卡片（总资产、总负债、净资产）
  - 实现净资产趋势图
  - 实现最近动态列表
  - 实现市场数据缺失提示
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 核心指标计算正确
  - `programmatic` TR-3.2: 空状态引导正常显示
  - `human-judgment` TR-3.3: 页面布局美观，交互流畅
- **Notes**: 使用适当的图表库（如 recharts）

## [x] 任务 4: 资产管理模块实现
- **Priority**: P0
- **Depends On**: 任务 2
- **Description**:
  - 实现资产列表页面
  - 实现资产新增/编辑/删除功能
  - 实现定期存款专项功能
  - 实现 FIRE 计入标记
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-4.1: 资产增删改操作正确记录到时间轴
  - `programmatic` TR-4.2: 定期存款到期兑付功能正常
- **Notes**: 按资产类型提供不同的表单字段

## [x] 任务 5: 负债管理模块实现
- **Priority**: P0
- **Depends On**: 任务 2
- **Description**:
  - 实现负债列表页面
  - 实现负债新增/编辑/删除功能
  - 实现还款记录专项功能
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `programmatic` TR-5.1: 负债余额变化正确记录
  - `programmatic` TR-5.2: 还款记录功能正常
- **Notes**: 确保还款金额验证逻辑正确

## [x] 任务 6: 交易台账模块实现
- **Priority**: P1
- **Depends On**: 任务 2, 任务 4
- **Description**:
  - 实现交易列表页面
  - 实现转账交易功能
  - 实现定期兑付功能
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-6.1: 转账交易能正确更新资产余额
  - `programmatic` TR-6.2: 定期兑付功能正常
- **Notes**: 确保交易操作的原子性

## [x] 任务 7: 时间轴模块实现
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**:
  - 实现时间轴列表页面
  - 实现筛选功能
  - 实现分页/加载更多功能
- **Acceptance Criteria Addressed**: AC-3, AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 所有资产/负债/交易变动都能在时间轴中找到
  - `programmatic` TR-7.2: 筛选功能正常工作
- **Notes**: 优化时间轴查询性能

## [x] 任务 8: FIRE 目标模块实现
- **Priority**: P1
- **Depends On**: 任务 2, 任务 4
- **Description**:
  - 实现 FIRE 配置页面
  - 实现目标资产计算
  - 实现进度展示
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `programmatic` TR-8.1: FIRE 目标计算正确
  - `programmatic` TR-8.2: 配置保存后能持久化
- **Notes**: 提供合理的默认值和输入验证

## [x] 任务 9: 收益日历模块实现
- **Priority**: P2
- **Depends On**: 任务 2
- **Description**:
  - 实现月历热力图
  - 实现每日收益拆分展示
  - 实现月份切换功能
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-9.1: 收益数据计算正确
  - `human-judgment` TR-9.2: 热力图颜色显示合理
- **Notes**: 考虑收益数据的计算性能

## [x] 任务 10: 市场数据与设置模块实现
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**:
  - 实现市场数据管理页面
  - 实现设置页面（本位币、隐私模式）
  - 实现数据导出/导入/清空功能
- **Acceptance Criteria Addressed**: AC-9, AC-10
- **Test Requirements**:
  - `programmatic` TR-10.1: 市场数据更新后能正确影响资产折算
  - `programmatic` TR-10.2: 数据导出导入功能正常
- **Notes**: 确保数据安全，清空操作需二次确认

## [x] 任务 11: 账户管理模块实现
- **Priority**: P2
- **Depends On**: 任务 2
- **Description**:
  - 实现账户列表页面
  - 实现账户新增/编辑/删除功能
  - 实现资产与账户的关联
- **Acceptance Criteria Addressed**: None（增强功能）
- **Test Requirements**:
  - `programmatic` TR-11.1: 账户管理功能正常
  - `programmatic` TR-11.2: 资产能正确关联到账户
- **Notes**: 账户作为可选功能，不影响核心流程

## [x] 任务 12: 响应式设计与移动端适配
- **Priority**: P1
- **Depends On**: 所有页面任务
- **Description**:
  - 优化页面在不同屏幕尺寸下的显示
  - 实现移动端底部导航
  - 确保表单在移动端的可用性
- **Acceptance Criteria Addressed**: None（非功能性需求）
- **Test Requirements**:
  - `human-judgment` TR-12.1: 页面在移动端显示正常
  - `human-judgment` TR-12.2: 移动端交互流畅
- **Notes**: 使用 Tailwind 的响应式类

## [x] 任务 13: 测试与优化
- **Priority**: P0
- **Depends On**: 所有功能任务
- **Description**:
  - 运行单元测试和集成测试
  - 优化页面加载性能
  - 修复已知问题
- **Acceptance Criteria Addressed**: 所有 AC
- **Test Requirements**:
  - `programmatic` TR-13.1: 所有测试用例通过
  - `programmatic` TR-13.2: 首屏加载时间 < 2s
- **Notes**: 使用性能分析工具识别瓶颈