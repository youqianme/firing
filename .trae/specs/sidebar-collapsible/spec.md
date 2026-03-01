# 侧边栏折叠功能

## 为什么 (Why)
目前的左侧菜单是固定宽度的（256px），占用了较多的屏幕空间，特别是在较小的桌面屏幕上。用户希望能够折叠侧边栏，只显示图标，以便给内容区域更多空间。

## 变更内容 (What Changes)
- **侧边栏折叠功能**: 实现左侧菜单的折叠/展开功能
  - 折叠状态宽度为 64px，只显示图标
  - 展开状态宽度为 256px，显示完整菜单
- **状态管理**: 使用 Context API 来管理侧边栏的折叠状态
- **DemoBanner 自适应**: DemoBanner 位置根据侧边栏状态自动调整
- **平滑过渡**: 添加折叠/展开的平滑过渡动画

## 影响范围 (Impact)
- **涉及规范**: 无直接变更
- **涉及代码**:
  - `apps/web/app/context/SidebarContext.tsx`: 新增侧边栏状态管理 Context
  - `apps/web/app/components/Sidebar.tsx`: 新增可折叠侧边栏组件
  - `apps/web/app/components/DemoBanner.tsx`: 修改 DemoBanner 位置自适应侧边栏状态
  - `apps/web/app/layout.tsx`: 集成 SidebarProvider 和 Sidebar 组件

## 新增需求 (ADDED Requirements)
### 需求：侧边栏折叠功能
系统应支持左侧菜单的折叠和展开。
#### 场景：用户点击折叠按钮
- **当** 用户点击侧边栏顶部的折叠/展开按钮时
- **那么** 侧边栏会平滑地在 256px（展开）和 64px（折叠）之间过渡
- **并且** 折叠状态下只显示图标
- **并且** 展开状态下显示完整菜单

### 需求：DemoBanner 位置自适应
DemoBanner 应根据侧边栏状态自动调整位置。
#### 场景：侧边栏状态变化
- **当** 侧边栏折叠时
- **那么** DemoBanner 的 left 位置为 64px
- **当** 侧边栏展开时
- **那么** DemoBanner 的 left 位置为 256px
- **当** 在移动设备上时
- **那么** DemoBanner 的 left 位置为 0px

