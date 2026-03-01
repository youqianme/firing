# 任务列表 (Tasks)

- [x] 任务 1: 创建 SidebarContext
  - [x] 在 `apps/web/app/context/SidebarContext.tsx` 中创建 Context
  - [x] 提供 isCollapsed 状态和 toggleSidebar 方法
  - [x] 创建 SidebarProvider 组件

- [x] 任务 2: 创建 Sidebar 组件
  - [x] 在 `apps/web/app/components/Sidebar.tsx` 中创建可折叠侧边栏
  - [x] 支持折叠（64px）和展开（256px）两种状态
  - [x] 添加平滑过渡动画
  - [x] 折叠状态只显示图标，展开状态显示完整菜单

- [x] 任务 3: 修改 DemoBanner
  - [x] 在 `apps/web/app/components/DemoBanner.tsx` 中使用 useSidebar
  - [x] 根据侧边栏状态自动调整位置
  - [x] 添加窗口大小监听，确保响应式体验

- [x] 任务 4: 修改 layout.tsx
  - [x] 在 `apps/web/app/layout.tsx` 中集成 SidebarProvider
  - [x] 用 Sidebar 组件替换原有的静态侧边栏
