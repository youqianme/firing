# 任务列表 (Tasks)

- [x] 任务 1: 修复全局布局内边距
  - [x] 在 `apps/web/app/layout.tsx` 中为移动端主内容容器添加 `pb-24`（或适当间距），防止内容被底部导航栏遮挡。
  - [x] 确保在必要时处理 `safe-area-inset-bottom`。

- [x] 任务 2: 实现资产页面的移动端卡片视图
  - [x] 修改 `apps/web/app/assets/page.tsx`。
  - [x] 创建响应式设计：在 `md:block` 显示 `&lt;table&gt;`，在 `md:hidden` 显示 `div` 卡片堆叠视图。
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

- [x] 任务 6: 优化首页核心指标布局，让 FIRE 进度首屏可见
  - [x] 修改 `apps/web/app/page.tsx`，优化核心指标卡片在移动端的布局（减少内边距、调整尺寸）
  - [x] 确保 FIRE 进度卡片在移动端首屏可见

- [x] 任务 7: 修复游客模式提示遮挡菜单的问题
  - [x] 修改 `apps/web/app/components/DemoBanner.tsx`
  - [x] 调整 DemoBanner 的位置或样式，避免遮挡移动端的顶部导航或底部菜单

- [x] 任务 8: 修复页面内容宽度超出视口的问题
  - [x] 检查所有页面，确保没有内容超出移动端视口宽度
  - [x] 移除或修复导致水平滚动的元素

- [x] 任务 9: 优化设置页面的数据管理区域
  - [x] 修改 `apps/web/app/settings/page.tsx`
  - [x] 优化数据管理区域的网格布局，在移动端改为单列

- [x] 任务 10: 优化 FIRE 页面的移动端展示
  - [x] 修改 `apps/web/app/fire/page.tsx`
  - [x] 优化 FIRE 进度卡片布局
  - [x] 优化资产明细列表布局
