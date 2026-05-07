# Figma 设计系统规则

## 1. 文档目的

本文档用于约束本项目后续的 Figma-to-code 工作流，确保跨境电商前端的页面实现、组件抽象、设计 token 重建与目录落点保持一致。

本文档只定义规则，不执行代码改造。当前 `src/app/globals.css` 已作为本项目的 token bridge 与 `@theme inline` 公共入口，后续新增或调整 token 时必须继续受 Figma 与本文档约束。

`Auth` 作为当前首个落地切片，其具体组件层级、目录落点与 Figma 对照关系以 [auth-component-architecture.md](/home/eason/codes/international-shopping-front/doc/design-system/auth-component-architecture.md) 为准；本文继续承担全局总规则。

## 2. Figma 页面范围

本轮设计分析以以下 11 个 Figma Page 为准：

1. `Components`
2. `Customerservice`
3. `Checkout`
4. `Product Detail`
5. `Product List`
6. `Shopping Cart`
7. `Landing Page`
8. `Order`
9. `User Profile`
10. `Your Details`
11. `Auth`

### 2.1 页面角色定义

`Components`

- 组件与变体的唯一设计源。
- 所有按钮、输入、导航、状态、卡片、信息单元的基础样式与变体优先从此页抽取。
- 若业务页与 `Components` 页存在冲突，以 `Components` 的原子定义为准，再结合业务页修正上下文约束。

`Landing Page`

- 前台品牌入口与营销叙事页。
- 重点关注 hero、栏目分组、信息节奏、品牌排版和首屏层级。

`Product List`

- 商品浏览与筛选页。
- 重点关注商品卡片、列表节奏、筛选栏、排序、结果统计与响应式折叠规则。

`Product Detail`

- 商品详情的局部模块来源页。
- 重点关注规格区、信息摘要、详情模块切片、图文编排与购买入口关系。

`Shopping Cart`

- 购物车与结算前确认页。
- 重点关注商品条目、数量控制、价格小计、优惠信息、总结区块。

`Checkout`

- 交易流程页。
- 重点关注地址、配送、支付、摘要卡片、步骤顺序与主要 CTA 的优先级。

`Order`

- 订单历史与订单详情页。
- 重点关注订单卡片、状态、物流、金额明细、时间线与详情分组。

`Customerservice`

- 售后与沟通系统页。
- 重点关注会话列表、消息气泡、状态提示、附件区、支持入口和服务密度。

`User Profile`

- 账户中心首页。
- 重点关注个人入口、导航区块、信息摘要和任务导向卡片。

`Your Details`

- 资料维护与地址编辑页。
- 重点关注表单组织、字段层级、保存动作、信息确认与编辑态反馈。

`Auth`

- 登录、注册、邮箱验证、OTP 等认证流程页。
- 重点关注认证卡片、表单、第三方登录入口、辅助文案与状态反馈。
- `Auth` 的具体组件分层与 flow 设计不在本文展开，后续实现时直接参照 `doc/design-system/auth-component-architecture.md`。

### 2.2 页面与响应式关系

- `Components` 提供组件定义，不承担页面布局真值。
- 业务页承担组合关系与响应式验证职责。
- 设计稿已经明确呈现 desktop、pad、mobile 场景时，代码实现必须优先对齐已存在的断点关系，不允许自行发明新的布局体系。
- 若某个页面只展示了单端形态，先抽组件规则，再用相邻页面出现的相同模式补齐响应式推断，不直接凭经验扩展视觉语言。

## 3. 当前项目约束

### 3.1 技术栈约束

本项目后续实现必须继续遵守以下既有工程条件：

- `Next.js` App Router
- `React 19`
- `TypeScript`
- `next-intl`
- `Tailwind CSS v4`
- `shadcn/ui`，样式基线为 `radix-nova`
- BFF 架构

### 3.2 目录落点契约

新的设计系统实现采用以下目录职责：

- `src/components/ui`
  - 基础 UI 组件与原子组件。
  - 示例：`Button`、`Input`、`Badge`、`Dialog`、`Tabs`、`Pagination`。
- `src/components/auth/blocks`
  - Auth 专项派生块，只服务认证切片页面搭建。
  - 示例：`AuthHeroHeader`、`AuthProviderButtons`、`AuthFormFrame`、`AuthSuccessPanel`。
- `src/components/blocks`
  - 由多个基础组件组合成、但仍可跨业务页复用的复合块。
  - 示例：`ProductListItem`、`FinancialSummary`、`AddressCard`、`SupportThread`。
- `src/components/shared`
  - 站点级或布局级共享组件。
  - 示例：`Navbar`、`Sidebar`、`Footer`、`LocaleSwitcher`、`GlobalSearch`。
- `src/features/*`
  - 业务流程、接口适配、状态管理、页面内行为编排。
  - 不承载通用视觉规范。

### 3.3 现状说明

- 当前仓库尚无成熟的 `src/components/*` 组件体系可直接继承。
- `components.json` 已建立 `@/components`、`@/components/ui`、`@/lib/utils` 等别名，可直接作为后续目录约束基础。
- `src/app/globals.css` 当前已承担 Tailwind v4 / shadcn 的 token bridge，后续组件实现应在其既有语义入口上继续推进，而不是另起一套主题入口。

## 4. 视觉语言总结

以下结论来自当前 Figma 11 个 Page 的整体观察，用于指导新的 token 与组件抽象。

### 4.1 品牌气质

- 整体视觉偏向高端、编辑感、国际化电商风格。
- 页面强调留白、清晰的层次切分和强识别的标题排版。
- 交易型页面相比营销页更克制，突出摘要卡片、主要动作和信息确认。

### 4.2 色彩倾向

- 主体基调以浅色背景、深色文本、高对比主操作区为主。
- 黑、白、灰及偏暖中性色构成大多数基础界面层。
- 强调色用于价格、主要 CTA、状态点缀，不应大面积滥用。
- 风险、警告、成功等状态色需要作为语义 token 重新定义，而不是沿用现有旧变量。

### 4.3 排版倾向

- 标题存在明显的品牌化与编辑感，应预期采用 serif headline + sans body 的组合策略。
- 正文与辅助文案层级清晰，依赖字重、字号、行高和颜色，而非过多装饰。
- 数字、价格、订单金额、摘要字段需要稳定的可读性，允许单独定义数字显示规范。

### 4.4 间距与布局

- 信息密度偏精致而非拥挤，间距需要稳定、可预测。
- 卡片内部通常呈现“标题区 + 内容区 + 操作区”的明确分层。
- 桌面端布局更多使用左右分栏、摘要侧栏、信息主区的结构。
- 移动端优先保持单列、强顺序、减少并列决策点。

### 4.5 圆角、边框、阴影

- 视觉风格更偏克制，不依赖重阴影堆叠。
- 圆角应保留统一的几档等级，用于按钮、输入、卡片、弹层，而不是每个页面各自定义。
- 边框需要承担大量信息分隔职责，应作为基础 token 管理。

### 4.6 图标与图片

- 图标风格应统一为简洁、克制、线性或轻量填充风格，不允许不同页面混用明显不一致的图标体系。
- 商品图、品牌图、营销图必须按 Figma 资产或明确替代图实现，不允许先用任意占位图作为长期方案。
- 通用图标仅在与现有 `lucide-react` 视觉结果完全等价时复用，否则应以 Figma 资产为准。

### 4.7 动效与交互感

- 该设计不依赖夸张动效，重点是层次切换、展开收起、焦点状态和提交反馈。
- 新 token 层需要为时长、缓动、层级切换预留语义变量，但不应引入与设计语言不匹配的炫技动画。

## 5. 组件系统清单

以下组件来源于 `Components` 页及多个业务页中的重复模式。只有跨页面复用或在 `Components` 页中已出现明确变体的结构，才提升为设计系统级组件。

### 5.1 站点级共享组件

- `Navbar`
  - 顶部主导航、品牌入口、搜索、账户入口、购物车入口。
- `Sidebar`
  - 账户中心、订单、支持等侧栏导航。
- `Footer`
  - 站点底部信息与辅助链接。

建议落点：`src/components/shared`

### 5.2 基础 UI 组件

- `Button`
- `IconButton`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Badge`
- `Tabs`
- `Dialog` / `Drawer`
- `Pagination`
- `OTPInput`

建议落点：`src/components/ui`

### 5.3 复合块组件

- `HeaderHero`
  - 营销页或栏目页顶部信息块。
- `ProductListItem`
  - 商品图、商品名、规格、价格、数量、收藏/删除、状态组合。
- `FinancialSummary`
  - 小计、运费、税费、折扣、总价、主 CTA。
- `AddressCard`
  - 地址信息、联系方式、默认标签、编辑动作。
- `ShipmentCard`
  - 配送方式、预估时间、物流信息。
- `OrderCard`
  - 订单号、时间、状态、金额、明细入口。
- `SupportThread`
  - 消息列表、会话头部、状态提示、输入与发送区。
- `StatusBadge`
  - 待付款、已发货、已完成、已取消等状态映射。
- `OrderHistoryButton`
  - 在多个页面作为订单行为入口使用的统一按钮模式。

建议落点：`src/components/blocks`

### 5.4 不应过早提升为系统组件的内容

- 单一页面独有的营销排版片段。
- 与某个业务状态强绑定、无法跨页面复用的临时组合。
- 只出现一次、且明显属于某个 feature 的复杂容器。

这些内容应先放在 `src/features/*` 中，等出现第二个明确复用场景后再提升。

## 6. Figma-to-code 实施规则

### 6.1 读取顺序

实现任何页面或组件前，必须先按以下顺序读取设计信息：

1. `get_design_context`
2. `get_metadata`
3. `get_screenshot`

目的如下：

- `get_design_context` 用于获取结构化布局、尺寸和节点关系。
- `get_metadata` 用于确认命名、层级和变体范围。
- `get_screenshot` 用于核对视觉真实结果，避免只按结构推断样式。

### 6.2 实现原则

- 不允许把 Figma 页面当作静态截图进行逐页复制。
- 必须先拆出 token、组件、区块，再进行页面组合。
- 实现时优先对齐 `Components` 页，再用业务页验证上下文表现。
- 若两个页面中出现相同模式，但尺寸或排布略有差异，应优先抽象成统一组件变体，而不是复制两个实现。

### 6.3 样式原则

- 统一使用 Tailwind v4 与 CSS variables 承载视觉系统。
- 不允许在 JSX 中散落硬编码颜色、字号、圆角、阴影、间距值。
- 允许在组件内部使用少量布局类，但视觉语义必须来自新的 token 层。
- 不允许继续扩张历史 `.ds-*` utility class 体系。

### 6.4 图标与资产原则

- 优先使用 Figma 导出的 SVG、位图或明确资产。
- 通用图标只有在现有图标库完全等价时才可复用。
- 不新增新的 icon package。
- Figma 导出的静态资产统一归档到 `public/assets/figma/` 下的可维护目录。

### 6.5 可访问性原则

- 表单必须具备语义化 label、错误提示和键盘可达性。
- 可点击区域必须具备明确 hover、focus、disabled 状态。
- 状态色不可作为唯一信息来源，需配合文案或图标。
- OTP、弹层、抽屉、对话框等交互组件必须遵守基础无障碍规则。

## 7. Token 维护与 globals.css 约束

### 7.1 基本原则

- 语义 token 体系继续放在 `src/app/globals.css` 中。
- `src/app/globals.css` 是当前 Tailwind v4 / shadcn 的唯一公共 bridge 入口。
- 后续新增 token 仅允许来自 Figma `Semantics`、`Components` 或明确的 bridge 需要，不允许把 Figma `TailwindCSS` collection 镜像进代码。
- 字体族仍以 `src/app/layout.tsx` 中注入的字体变量为准，不在 `globals.css` 中硬编码新的字体源。

### 7.2 token 的职责边界

当前 `globals.css` 只应保留以下职责：

- 全局基础样式
- 主题入口
- 暗色模式或主题切换入口
- 新的语义化设计 token
- `@theme inline` 到 Tailwind v4 的映射层

### 7.3 token 分组

后续维护 token 时，应继续按语义分组，而不是退回历史命名：

- 颜色
  - 页面背景
  - 页面表面
  - 卡片表面
  - 反色表面
  - 主文本
  - 次文本
  - 弱文本
  - 边框
  - 分隔线
  - 品牌强调
  - 成功
  - 警告
  - 危险
  - 信息
- 排版
  - 字体族
  - 标题层级
  - 正文层级
  - 辅助文本层级
  - 数字显示层级
- 间距
  - 组件内边距
  - 区块间距
  - 页面间距
- 圆角
  - 小
  - 中
  - 大
  - 强调卡片
- 边框
  - 默认
  - 强调
  - 输入聚焦
- 阴影
  - 浮层
  - 弹窗
  - 悬浮态
- 动效
  - 快
  - 中
  - 慢
  - 标准缓动
- 层级
  - 内容层
  - 浮层
  - 抽屉
  - 模态

### 7.4 命名规则

- 不再使用 `--ds-*` 作为新系统命名前缀。
- 命名应直接表达界面语义，而不是表达实现历史。
- 优先使用“用途命名”，避免使用“具体颜色名命名”。

可接受示例：

- `--color-page-background`
- `--color-surface-card`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-action-primary`
- `--space-section-lg`
- `--radius-card`
- `--shadow-popover`

不接受示例：

- `--ds-color-1`
- `--gray-900-used-for-sometimes-title`
- `--legacy-card-radius`

### 7.5 维护顺序

后续维护 `src/app/globals.css` 时，应按以下顺序进行：

1. 先确认改动是否确实来自 Figma `Semantics`、`Components` 或现有组件消费需要。
2. 仅在 `:root` 语义层补充 token，不新增平行主题入口。
3. 同步维护 `@theme inline` 暴露给 Tailwind v4 / shadcn 的公共映射。
4. 让页面和组件消费新的语义 token，而不是直接硬编码视觉值。
5. 发现无消费的遗留 token 时，再做定向删除，不做无边界重写。

### 7.6 禁止事项

- 禁止把 Figma `TailwindCSS` collection 原样镜像到 `globals.css`。
- 禁止新增无法追溯到 Figma 或 bridge 需求的便利 token。
- 禁止绕开 `@theme inline` 另起新的公共主题入口。
- 禁止在文档未更新的情况下私自扩张新的语义层级。

## 8. 页面到组件的映射建议

### 8.1 Landing Page

- 重点沉淀 `Navbar`、`HeaderHero`、营销型内容卡片、品牌故事区块。
- 特殊排版可保留在页面层，但标题、按钮、标签、卡片容器必须回归系统组件。

### 8.2 Product List

- 必须优先抽出 `ProductListItem`、筛选控件、排序控件、分页。
- 列表密度和卡片间距依赖统一 token，不允许按页面手调。

### 8.3 Product Detail

- 规格区、详情信息块、购买摘要可拆为复合块组件。
- 商品图展示容器和规格条目应优先复用系统输入、标签、卡片规范。

### 8.4 Shopping Cart

- 核心组件是 `ProductListItem` 与 `FinancialSummary`。
- 数量控制、移除动作、优惠提示必须避免生成专用样式孤岛。

### 8.5 Checkout

- 地址、配送、支付、金额总结都应以卡片化复合块实现。
- 主 CTA、次 CTA、返回操作的优先级必须稳定，不允许按页面重新定义按钮体系。

### 8.6 Order

- 订单列表和订单详情优先抽 `OrderCard`、`StatusBadge`、`ShipmentCard`。
- 状态映射要通过统一语义层完成，不能让每个订单页面单独维护颜色与文案逻辑。

### 8.7 User Profile 与 Your Details

- 账户页入口卡片、导航、信息摘要优先复用共享块。
- 资料编辑页必须回归标准表单组件、地址卡片和保存反馈规范。

### 8.8 Customerservice

- 客服入口、会话列表、消息区、输入区统一归入 `SupportThread` 及其子组件。
- 聊天气泡、系统消息、状态消息应由统一消息样式系统承载，不允许 feature 内随意定义。

### 8.9 Auth

- `Auth` 作为首个专项切片，必须优先遵守 `doc/design-system/auth-component-architecture.md` 中的目录与组件层级。
- 登录、注册、验证邮件、OTP 必须统一回归 `src/components/ui`、`src/components/shared`、`src/components/auth/blocks` 与 `src/features/auth` 的既定边界。
- OAuth 入口、辅助链接、错误提示、成功提示必须通过显式面板与 Auth 专项 block 组合表达，不允许继续抽象为一个 `AuthBlock` 巨组件。

## 9. 验收与烟雾检查

### 9.1 文档完整性检查

- 11 个 Figma Page 均被覆盖。
- `Components` 被定义为组件真值来源，而不是普通业务页。
- 文档已明确声明当前 `src/app/globals.css` 是现行 token bridge，且后续维护受 Figma 与本文档约束。

### 9.2 规则可执行性检查

实现者应能仅凭本文档回答以下问题：

- 新按钮、输入框、状态标签、商品卡片、地址卡片、消息气泡分别应放在哪个目录层。
- 何时使用 `src/components/ui`，何时提升到 `src/components/blocks`，何时仅保留在 `src/features/*`。
- 新 token 应该定义在 `globals.css` 的哪一层职责中。
- 图标与位图资源应如何从 Figma 落地到项目中。

### 9.3 烟雾验证场景

应至少使用以下 3 类场景验证文档是否足够指导实现：

- `Auth`
  - 用 `Auth` 专项组件架构验证表单、按钮、OAuth、OTP、辅助链接与 success 状态规则是否完整。
- `Product List` 或 `Shopping Cart`
  - 用 `Product List Item` 验证商品图、价格、摘要、数量控制、响应式规则是否完整。
- `Customerservice`
  - 用消息气泡、状态提示、输入区验证复杂业务 UI 是否能被统一归类。

## 10. 结论

本项目后续的设计系统重建应以 Figma 为唯一视觉事实来源，以 `Components` 页为组件真值来源，以业务页为组合和响应式验证来源。

`src/app/globals.css` 会继续作为当前与未来 token 的承载文件，也是 Tailwind v4 / shadcn 的公共 bridge。后续所有前端实现都应继续在这层语义 token 之上推进组件抽象与页面落地，而不是回退到页面内硬编码样式或复制 Figma primitive collection。
