# UI 交互设计文档 (UI Description) - 有钱么 (YouQianMe)

本文档以“当前仓库实现”为基准，补齐所有 Web/Mobile 页面与组件的 UI 细节、交互状态与一致性规则；并在需要处标注“可选增强”作为后续迭代方向。

## 1. 设计综述（Design Overview）

### 1.1 设计理念
- 极简主义（Minimalist）：弱化装饰，强调数据密度与可读性。
- 松弛感（Relaxed）：圆角、柔和阴影、充足留白，降低“焦虑感”。
- 可解释（Explainable）：关键数字旁提供拆分、口径提示或缺失数据提示。
- 一致性（Consistent）：相同的金额、币种、涨跌色、交互状态在各页一致。

### 1.2 设计令牌（Design Tokens）

#### 1.2.1 色彩体系（Color Palette）
- 背景
  - 页面背景：`#F8FAFC`（近似 Tailwind `slate-50`）
  - 卡片背景：`#FFFFFF`
  - 分割线：`#E2E8F0`（`slate-200`）/ `#F1F5F9`（`slate-100`）
- 文字
  - 主标题：`#0F172A`（`slate-900`）
  - 正文：`#334155`（`slate-700`）
  - 次要：`#64748B`（`slate-500`）
  - 辅助：`#94A3B8`（`slate-400`）
- 品牌与强调
  - 主按钮/强调：`#0F172A`（`slate-900`）或 `#2563EB`（`blue-600`，用于进度与可视化）
- 语义色（当前实现口径：红涨绿跌）
  - 正向/增加：`#DC2626`（`red-600`）
  - 负向/减少：`#16A34A`（`green-600`）
  - 中性：`#64748B`（`slate-500`）
- 语义提示
  - 成功：`#16A34A`（`green-600`）
  - 警告：`#F59E0B`（`amber-500`）
  - 错误：`#DC2626`（`red-600`）

#### 1.2.2 字体与字号（Typography）
- 字体：系统 Sans-serif（Web：浏览器默认；Mobile：系统字体）。
- 字号（Web 推荐）
  - 页面标题：`text-3xl font-bold tracking-tight`
  - 卡片标题：`text-sm font-medium`（配合弱化色）
  - 关键数字：`text-2xl font-bold` / Hero：`text-5xl font-bold tracking-tighter`
  - 辅助说明：`text-xs text-slate-500`
- 数字对齐：表格金额列统一右对齐；金额展示使用千分位。

#### 1.2.3 圆角、阴影与边框
- 圆角
  - 卡片：`rounded-xl` 或 `rounded-2xl`（Dashboard Hero）
  - 输入框/按钮：`rounded-md` / `rounded-lg`
  - IconButton：`rounded-full`
- 阴影：`shadow-sm` 为主（仅用于强调层级，不做重阴影）
- 边框：默认 `border border-slate-200`，弱分割使用 `border-slate-100`

#### 1.2.4 间距与布局栅格
- 页面 padding：桌面 `p-8`，小屏 `p-4 sm:p-8`
- 卡片间距：`space-y-8` 作为页面主节奏
- 表单栅格：`grid gap-4 md:grid-cols-2 lg:grid-cols-3`（Transactions 有 `lg:grid-cols-5`）
- 表格：容器 `overflow-auto`，适配窄屏横向滚动

#### 1.2.5 交互态样式（Focus / Disabled）
- Web 的输入与按钮均使用 `focus-visible:ring-2` 高亮焦点，保证键盘可用性
- disabled：降低透明度并禁止交互（`disabled:opacity-50` + `disabled:pointer-events-none/cursor-not-allowed`）

### 1.3 全局布局（Layout）

#### 1.3.1 Web：侧边栏 + 主内容
- 左侧 Sidebar：固定菜单入口（总览/资产/交易/负债/时间轴/收益日历/FIRE/设置）。
- 主内容区：最大宽度 `max-w-7xl mx-auto`，按页面类型使用 `space-y-*` 控制纵向节奏。

#### 1.3.2 Mobile：底部 Tab + 顶部标题
- Tab：Dashboard / Assets / Liabilities / Settings。
- 页面容器：`SafeAreaView` + `ScrollView`，背景 `bg-gray-50`，卡片承载主要内容。

## 2. 组件规范（Component Specs）

### 2.1 Card（卡片）
- 用途：容器分组（指标、表单、表格、图表、管理面板）
- 结构：Header（标题/右侧操作）+ Content（内容）
- 边界：默认 `bg-white border`；Dashboard 的趋势与动态卡可用 `border-0 shadow-sm` 以弱化边框

### 2.2 Button（按钮）
- Primary：深色/蓝色（保存、提交、关键操作）
- Secondary：白底 + 边框（关闭、刷新、非破坏性操作）
- Danger：红底（清空数据等破坏性操作）
- 状态：
  - disabled：降低不透明度/不可点击
  - loading：按钮文案变为“处理中...”/“保存中...”
  - focus：键盘聚焦时出现 ring（与 Input 一致）

### 2.3 IconButton（图标按钮）
- 形态：圆形点击区域 `p-2 rounded-full`
- hover：浅色背景（蓝/红/灰按语义区分）
- 必须提供 `aria-label`（Web）或可读文本（Mobile）

### 2.4 Input（输入框）
- 高度：`h-10`
- 场景：数字、日期、文本备注
- 数字输入：
  - placeholder 使用 `0.00`
  - 金额列在展示侧统一格式化（千分位、最多 2 位小数）

### 2.5 Select（下拉选择）
- Web 现状：使用原生 `<select>` + Tailwind 样式
- 规则：
  - 默认项：`请选择`
  - 当选项依赖数据（如现金资产列表）为空时，保持可见但不可提交

### 2.6 Segmented Control（胶囊切换）
- 用于分类/筛选（Dashboard 最近动态、资产分类、时间轴筛选）
- 容器：`p-1 bg-slate-100 rounded-lg`
- 选中项：`bg-white shadow-sm text-slate-900`
- 未选中项：`text-slate-500 hover:text-slate-900`

### 2.7 Badge（类型徽标）
- 资产类型使用彩色徽标（浅底 + ring），在表格“类型”列展示
- 规则：保持背景弱、文字清晰，避免大面积纯色块

### 2.8 Table（表格）
- 表头：`h-12 px-4 text-muted-foreground`，金额/操作列右对齐
- 行 hover：`hover:bg-muted/50`
- 空状态：单行 `colSpan`，居中灰字
- 移动端：允许横向滚动，避免强行压缩

### 2.9 Progress（进度条）
- 用于定期存款进度（细条 `h-1.5`）与 Dashboard FIRE Hero（粗条 `h-4`）
- 规则：进度条必须限制在 0–100%

### 2.10 Message（状态消息）
- Web：MarketDataManagement/DataManagement 用行内文案（绿色成功/红色失败）
- Web 与 Mobile 的 confirm/alert：
  - Web：`confirm()`/`alert()`（现状）
  - Mobile：`Alert.alert()`（现状）
- 可选增强：统一 Toast（成功/失败）与全局错误提示样式

## 3. 页面 UI 细节（Web）

### 3.1 Dashboard（/）

#### 3.1.1 顶部栏
- 左：标题“总览”
- 右：
  - “FIRE 设置”文字链接（带火焰图标）
  - 汇率状态胶囊：
    - 有 USDCNY：展示 `汇率: 1 USD ≈ x.xxxx CNY`
    - 未配置：展示 `汇率: 未配置`
  - 缺失汇率提示（红色胶囊）：`缺少汇率: USDCNY, ...`

#### 3.1.2 FIRE Hero 区块
- 容器：白底大圆角卡 `rounded-2xl p-8 border`
- 上部：
  - 左：`FIRE 进度` + 大号百分比
  - 右：目标金额胶囊（以“万”为单位展示）
- 中部：粗进度条（蓝色填充 + 轻微动画脉冲层）
- 下部：4 列指标（md 以上 4 列，最后一列预留）
  - FIRE 资产 / 安全年提取 / 距离目标 / 预留

#### 3.1.3 核心指标卡（3 张）
- 净资产（黑字）
- 总资产（黑字）
- 总负债（红字）

#### 3.1.4 净资产趋势图
- 卡片：标题“净资产趋势”
- 图表：
  - 面积：净资产（蓝）
  - 折线：总资产（绿）、总负债（红）
  - Tooltip：圆角、无边框、轻阴影；金额格式化为 `¥1,234`
  - Y 轴 tick：以 `w`（万）缩写显示
- 空状态：`暂无趋势数据，请添加资产`

#### 3.1.5 最近动态
- 标题 + 过滤 Segmented（全部/资产/负债）
- 列表项：
  - 左侧：动作 + 对象类型 + 名称；下方时间与（可选）old→new
  - 右侧：delta，颜色规则：
    - delta > 0：红
    - delta < 0：绿
    - delta = 0：灰
- 空状态：`暂无动态，去新增一笔资产或负债吧`

### 3.2 Assets（/assets）

#### 3.2.1 顶部栏
- 标题“资产管理”
- 右侧按钮：
  - 默认：`新增资产`（带 Plus 图标）
  - 编辑/新增模式：`取消`

#### 3.2.2 分类 Tabs
- 仅在非编辑状态展示（进入编辑时隐藏，降低干扰）
- 选项：全部资产 / 流动资产 / 投资账户 / 实物/其他
- 容器可横向滚动（小屏）

#### 3.2.3 新增/编辑资产表单（同页 Card）
- 顶部：类型选择网格（3 列到 6 列响应式）
  - 选中：深边框 + 浅底
  - 未选中：浅边框 + hover 反馈
  - 选择类型会自动设置 includeInFire（房产/奢侈品默认不计入）
- 通用字段：
  - 名称（placeholder 随类型变化）
  - 金额/市值 或 本金（定期）
  - 币种（CNY/USD/HKD）
  - 账户（可选）
- 定期专属字段：
  - 年化利率（%）
  - 起息日
  - 期限（3M/6M/1Y/2Y/3Y/5Y/自定义）
  - 到期日（自动计算，可改为自定义）
- 计入 FIRE：
  - checkbox + 说明文本
- 提交按钮：`保存`

#### 3.2.4 资产表格
- 列：名称 / 类型 / 账户 / 金额 / 操作
- 定期存款行的增强展示：
  - 名称下方：利率与期限、进度条、到期剩余天数或“已兑付”
  - 金额下方：`含息 +x.xx`（红色提示）
- 操作：
  - 编辑（蓝色 IconButton）
  - 删除（红色 IconButton，二次确认）

### 3.3 Liabilities（/liabilities）

#### 3.3.1 顶部栏
- 标题“负债管理”
- 右侧按钮：新增负债/取消

#### 3.3.2 记录还款面板（选中某负债后展示）
- 标题：`记录还款：{name}`
- 表单字段：
  - 日期、提前还款本金、利息、手续费/违约金、备注
- 下方汇总：
  - 本次合计金额（加粗）
  - 右侧按钮：关闭（次要）、保存（主按钮，保存中禁用）
- 还款记录表格：
  - 表头：日期/本金/利息/手续费/备注
  - 右上：刷新按钮
  - 空状态：暂无记录

#### 3.3.3 新增/编辑负债表单（同页 Card）
- 类型选择网格（同资产风格）
- 字段：
  - 名称、金额、年化利率（% 可选）、起息日（可选）、到期日（可选）
- 提交：保存

#### 3.3.4 负债表格
- 列：名称 / 类型 / 年化利率 / 起息日 / 到期日 / 金额 / 操作
- 金额展示：
  - 主金额：红色加粗（默认显示 currentAmount 或 amount）
  - 次行：本金与利息拆分（存在利率/起息日/利息累计时）
- 操作：
  - 记录还款（HandCoins）
  - 编辑
  - 删除（二次确认）

### 3.4 Transactions（/transactions）

#### 3.4.1 顶部栏
- 标题“交易”
- 右侧“刷新”按钮（刷新资产与交易列表）

#### 3.4.2 新建交易 Card
- 顶部：标题 + 类型切换按钮
  - 转账 / 定期兑付
  - 选中态：深底白字；未选中：浅底深字
- 转账表单：
  - 日期、转出资产（现金列表）、转入资产（现金列表）、金额、备注
  - 限制：不同币种不允许直接转账（弹窗提示）
  - 提交：保存
- 定期兑付表单：
  - 兑付日、定期资产、兑付到（现金）、备注
  - 提交：兑付

#### 3.4.3 最近交易表格
- 列：日期 / 类型 / 摘要 / 分录 / 操作
- 分录展示：
  - 每条 leg 一行：左侧显示资产名（带账户），右侧显示带符号金额
  - 颜色：正数红、负数绿、0 灰
- 删除：
  - 红色 IconButton
  - 二次确认文案强调“回滚余额影响”

### 3.5 Activity（/activity）
- 与 Dashboard 最近动态一致的视觉风格，但为完整列表
- 筛选：全部/资产/负债
- 分页：通过“加载更多”按钮增加 take（现状上限 200）
- 列表项结构：动作+对象+名称 / 时间+old→new / delta

### 3.6 Earnings（/earnings）
- 月历热力图布局：
  - 顶部标题区：月份切换（上月/下月按钮）+ 当前月份标题
  - 主区域：7 列网格，按周分行
  - 日期格：背景色按当日收益绝对值强度着色
- 详情区（选中日期）：
  - 展示 total 与拆分字段（activity/interest/depositInterest/liabilityInterest 等）
- 加载态：切月会触发 loading（现状为占位块混用）

### 3.7 FIRE（/fire）
- 顶部标题 + 说明文案
- 4 张状态卡：
  - 当前进度、目标金额、FIRE 资产（含 hover tooltip）、预计达成
- 配置表单：
  - 两列栅格输入（年龄、收益率等）
  - 保存按钮（保存中展示 loading 图标与禁用态）
- 交互口径：保存后重新计算并刷新状态（当前实现）

### 3.8 Settings（/settings）
- 顶部：标题“设置”
- 信息卡：
  - 当前版本、本位币（现状静态）
- 市场数据管理：
  - 3 个数值输入：USDCNY、HKDCNY、黄金（CNY/克）
  - 保存按钮 + 成功/失败提示文案
- 数据管理（Developer）：
  - 一键填充测试数据、清空所有数据（均带 confirm）
  - 成功/失败提示文案

## 4. 页面 UI 细节（Mobile）

### 4.1 全局导航
- Tab：总览 / 资产 / 负债 / 设置
- 顶部：每页以大标题开头（`text-2xl font-bold`），列表与卡片之间保持 `mb-*` 节奏

### 4.2 设置（移动端）
- FIRE 目标参数 Card：
  - 多个 TextInput（灰底圆角），保存按钮（黑底白字）居中
  - 保存反馈：系统 Alert（成功/失败）
- 通用设置 Card：
  - 本位币（现状静态）、隐私模式 Switch（现状未持久化）
- 开发者数据 Card：
  - 一键填充/清空按钮（黑/红），二次确认 Alert；Web 预览时提示不支持

## 5. 状态与反馈（States & Feedback）

### 5.1 加载态
- 页面级：居中 Loading 文案或 Spinner（现状）；可选增强为 Skeleton 以减少抖动
- 表格级：单行 `加载中...`
- 表单提交：按钮进入 disabled + 文案变更

### 5.2 空状态
- 无资产：提示“暂无资产”
- 无趋势数据：提示“暂无趋势数据，请添加资产”
- 无交易/无还款记录：提示“暂无交易/暂无记录”

### 5.3 错误态
- Dashboard 数据加载失败：红色错误文案
- 表单提交失败：alert/行内错误提示（现状）

## 6. 可访问性与响应式（A11y & Responsive）

### 6.1 可访问性
- IconButton 提供 `aria-label`
- 表单 label 与输入的对应关系明确
- hover tooltip 不遮挡关键内容
- 键盘可达：
  - 所有可点击元素可通过 Tab 聚焦
  - 聚焦态清晰（Button/Input/Select 的 ring）
- 语义结构：
  - 表格必须有 `<thead>/<th>`，金额列使用右对齐提升可扫读性
  - 破坏性操作（删除/清空）在文案与颜色上都要明确危险性

### 6.2 响应式
- 宽屏：`max-w-7xl` 容器居中
- 小屏：
  - 页面 padding 使用 `p-4 sm:p-8`
  - Tabs 容器可横向滚动
  - 表格可横向滚动，避免列挤压导致不可读

## 7. 动效与微交互（Micro-interactions）
- hover：按钮与表格行提供轻微背景变化
- transition：`transition-colors`/`transition-all` 适度使用（选项切换、进度条）
- 可选增强：
  - Toast 统一成功/失败反馈
  - 金额变化 CountUp 动画（适用于 Dashboard 指标）
  - Skeleton 替换页面级 Loading 文案，减少布局跳动
