# 任务列表 (Tasks)

- [x] 任务 1: 修复全局布局内边距
  - [ ] 在 `apps/web/app/layout.tsx` 中为移动端主内容容器添加 `pb-24`（或适当间距），防止内容被底部导航栏遮挡。
  - [ ] 确保在必要时处理 `safe-area-inset-bottom`。

- [x] 任务 2: 实现资产页面的移动端卡片视图
  - [x] 修改 `apps/web/app/assets/page.tsx`。
  - [x] 创建响应式设计：在 `md:block` 显示 `<table>`，在 `md:hidden` 显示 `div` 卡片堆叠视图。
  - [x] 设计卡片样式：展示图标/类型、名称、金额（突出显示）、账户和操作行。

- [x] 任务 3: 实现负债页面的移动端卡片视图
  - [x] 修改 `apps/web/app/liabilities/page.tsx`。
  - [x] 应用与资产页面相同的卡片视图模式。

- [x] 任务 4: 实现交易页面的移动端卡片视图
  - [x] 修改 `apps/web/app/transactions/page.tsx`。
  - [x] 应用卡片视图模式（展示日期、交易对象、金额、分类）。

- [x] 任务 5: 优化移动端表单体验
  - [x] 检查 `apps/web/app/assets/page.tsx` 及其他表单的输入框。
  - [x] 确保移动端输入框使用 `text-base` 或 `text-[16px]` 字体大小，防止 iOS 自动缩放。
