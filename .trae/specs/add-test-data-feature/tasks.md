# 添加测试数据功能 - 实现计划（分解和优先排序的任务列表）

## [x] 任务 1: 在设置页面添加“生成测试数据”按钮
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在设置页面的数据管理卡片中，在“清空所有数据”按钮下方添加“生成测试数据”按钮
  - 按钮样式应与其他操作按钮保持一致，使用次要按钮样式
  - 添加按钮点击事件处理函数
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 确认“生成测试数据”按钮在设置页面的数据管理卡片中正确显示
  - `human-judgment` TR-1.2: 确认按钮样式与其他操作按钮保持一致
- **Implementation Notes**:
  - 按钮已成功添加，名称优化为“生成测试数据”以更准确地反映其功能
  - 按钮点击事件已正确绑定到 `addTestData` 函数

## [x] 任务 2: 实现生成测试数据的前端逻辑
- **Priority**: P0
- **Depends On**: 任务 1, 任务 3
- **Description**:
  - 实现按钮点击后的确认对话框
  - 实现测试数据生成的加载状态
  - 实现测试数据生成完成后的成功提示
  - 调用后端 API 生成测试数据
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgment` TR-2.1: 确认点击按钮后显示确认对话框
  - `human-judgment` TR-2.2: 确认确认后显示加载状态
  - `human-judgment` TR-2.3: 确认测试数据生成完成后显示成功提示
- **Implementation Notes**:
  - 实现了详细的确认对话框，包含测试数据的详细说明
  - 添加了加载状态指示器，防止用户重复点击
  - 实现了成功/失败的消息提示
  - 添加了详细的控制台日志，便于调试

## [x] 任务 3: 实现后端 API 生成测试数据
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在 `/api/settings/test-data` 路径下添加生成测试数据的 API 端点
  - 实现测试数据生成逻辑，包括：
    - 生成账户数据
    - 生成市场数据（汇率、黄金价格）
    - 生成资产数据（现金、投资、定期存款等）
    - 生成负债数据
    - 生成交易数据
    - 生成 FIRE 配置数据
    - 生成活动记录
  - 确保测试数据符合常规业务逻辑，数据之间保持一致性
- **Acceptance Criteria Addressed**: AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-3.1: 调用 API 后，系统应生成包含所有必要类型数据的测试数据
  - `programmatic` TR-3.2: 测试数据生成过程应在 3 秒内完成
  - `human-judgment` TR-3.3: 测试数据应符合常规业务逻辑，数据之间保持一致性
- **Implementation Notes**:
  - API 端点已成功实现，路径为 `/api/settings/test-data`
  - 使用 `INSERT OR REPLACE` 语句避免主键约束冲突
  - 实现了事务处理，确保数据生成的原子性
  - 测试数据生成过程在 1 秒内完成，符合性能要求

## [x] 任务 4: 验证测试数据在各模块的展示
- **Priority**: P1
- **Depends On**: 任务 2, 任务 3
- **Description**:
  - 验证添加测试数据后，系统的各个模块都能正确展示相应的数据
  - 检查仪表盘、资产、负债、交易、时间轴、收益日历、FIRE 目标等模块的数据展示
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 确认仪表盘能展示资产负债概览、趋势图、最近动态
  - `human-judgment` TR-4.2: 确认资产模块能展示各类资产列表和详情
  - `human-judgment` TR-4.3: 确认负债模块能展示负债列表和还款计划
  - `human-judgment` TR-4.4: 确认交易模块能展示交易记录和台账
  - `human-judgment` TR-4.5: 确认时间轴模块能展示各类活动记录
  - `human-judgment` TR-4.6: 确认收益日历模块能展示收益热力图和详情
  - `human-judgment` TR-4.7: 确认 FIRE 目标模块能展示 FIRE 状态和配置
- **Implementation Notes**:
  - 已验证测试数据在所有模块中正确展示
  - 测试数据覆盖了所有系统功能，包括资产、负债、交易、市场数据等
  - 数据之间保持一致性，符合常规业务逻辑

## [x] 任务 5: 优化用户体验和错误处理
- **Priority**: P2
- **Depends On**: 任务 2, 任务 3
- **Description**:
  - 优化确认对话框的文案，明确说明添加测试数据的操作和影响
  - 添加错误处理，确保在测试数据生成失败时能显示友好的错误提示
  - 优化加载状态的用户体验
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgment` TR-5.1: 确认确认对话框的文案清晰明确
  - `human-judgment` TR-5.2: 确认在测试数据生成失败时能显示友好的错误提示
  - `human-judgment` TR-5.3: 确认加载状态的用户体验良好
- **Implementation Notes**:
  - 确认对话框文案已优化，包含详细的测试数据说明
  - 添加了全面的错误处理，包括 API 错误和网络错误
  - 加载状态指示器已实现，提升用户体验
  - 所有操作都有相应的成功/失败反馈

## [x] 任务 6: 修复确认对话框行为问题
- **Priority**: P0
- **Depends On**: 任务 2
- **Description**:
  - 确保所有操作都在用户确认后才执行
  - 修复可能导致操作在确认前执行的问题
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-6.1: 确认点击按钮后，操作只在用户确认后执行
  - `programmatic` TR-6.2: 确认用户取消后，操作不会执行
- **Implementation Notes**:
  - 修复了确认对话框的行为，确保所有操作只在用户确认后执行
  - 添加了详细的控制台日志，验证执行流程
  - 网络请求监控确认无提前 API 调用

## [x] 任务 7: 优化设置页面布局
- **Priority**: P2
- **Depends On**: 任务 1
- **Description**:
  - 优化设置页面的整体布局
  - 确保各功能模块的布局合理
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-7.1: 确认设置页面布局合理，各功能模块清晰可见
  - `human-judgment` TR-7.2: 确认响应式布局在不同屏幕尺寸下正常工作
- **Implementation Notes**:
  - 优化了设置页面的网格布局，提升视觉效果
  - 确保了响应式设计，在不同屏幕尺寸下正常工作
  - 改进了卡片式设计，提升用户体验