# Phase 1 实现方案：账号与地址

> 适用仓库：`/home/codex/codes/international-shopping-front`  
> 关联总纲：`doc/总体前端设计.md` 中 `### Phase 1：账号与地址`  
> 约束来源：现有用户 API 契约，`src/app/globals.css` 冻结 Design Token，`oiloil-ui-ux-guide`

## 1. 文档目标

本方案用于把 Phase 1 的账号与地址能力从“范围描述”细化为“可直接实现”的页面与工程蓝图，覆盖以下路由：

- `/{locale}/login`
- `/{locale}/register`
- `/{locale}/forgot-password`
- `/{locale}/oauth2/callback`
- `/{locale}/account`
- `/{locale}/addresses`

Phase 1 的核心目标不变：

- 让用户从未登录状态，尽量少填表地进入可下单状态。
- 让首次完成注册或登录后的用户，能够顺手补齐默认地址。
- 让账号页从第一屏就围绕“下一步还能做什么”组织，而不是围绕“我是谁”组织。
- 保持信息架构稳定，为后续 `orders`、`payments`、`shipping`、`customerservice` 接入留出语义连续性。

## 2. 已确认的产品结论

以下内容视为本方案的已确认前提，不再回退到此前版本：

1. `/login` 采用 `login6` 作为主骨架，但卡片内部改为 `login9` 的 OAuth 优先布局。
2. `/login` 引入 `react-icons`，在卡片内展示 `Google / TikTok / X` 三个 OAuth 按钮，`使用邮箱登录` 作为较弱次级动作。
3. `/register` 采用 `signup10` 左右布局，并落成两阶段流程：填写注册信息 -> 邮件已发送与状态轮询 -> 验证码激活。
4. `/forgot-password` 延续原方案，不做结构性变更，但需要补齐三端适配和完整状态。
5. `/account` 不做社交资料页，首屏改为“个人服务中枢”，优先展示 `订单与物流`、`地址簿`、`支付方式与安全`、`客服与售后`。
6. `/addresses` 不做 inline edit，新增与编辑使用独立表单层；同时接入 Google 地图能力降低地址录入成本。
7. `/oauth2/callback` 保持现有方向，作为 OAuth 登录与绑定的中转页。

## 3. 当前契约边界与依赖缺口

### 3.1 后端已支持的 Phase 1 核心契约

- 本地注册：`POST /auth/register`
- 邮件发送状态轮询：`GET /auth/email-status`
- 邮箱验证码激活：`POST /auth/verify-email`
- 重新发送激活邮件：`POST /auth/resend-activation`
- 本地登录：`POST /auth/login`
- 找回密码：`POST /auth/password/forgot`、`POST /auth/password/reset`
- 退出登录：`POST /auth/logout`
- CSRF 获取与轮换：`GET /auth/csrf`
- 第三方 OAuth2 授权与回调：`GET /oauth2/{provider}/authorize`、`GET /oauth2/{provider}/callback`
- 当前账户与资料：`GET /users/me`、`GET/PATCH /users/me/profile`
- 第三方绑定：`GET /users/me/bindings`、`GET /users/me/bindings/{provider}/authorize`、`GET /users/me/bindings/oauth2/{provider}/callback`、`DELETE /users/me/bindings/{provider}`
- 地址管理：`GET/POST /users/me/addresses`、`GET/PATCH/DELETE /users/me/addresses/{id}`、`POST /users/me/addresses/{id}/set-default`

### 3.2 当前必须明确的实现边界

这些点需要在方案里明确，不再沿用之前的旧表述：

- Phase 1 的认证目标明确为 `Google / TikTok / X` 三渠道 OAuth2 登录流程。
- `支付方式与安全` 模块在 Phase 1 只落实两块真实能力：`已绑定的 OAuth2 登录方式`、`修改密码`。
- 按最新 `international-shopping-user-api.yaml` 契约，地址接口已经补齐 Google 地址能力所需扩展字段，Phase 1 可以把补全、选点、校验得到的核心结构化信息随地址一并提交，核心字段包括 `country_code`、`language_code`、`address_source`、`raw_input`、`google_placeId`、`place_response`，并接收 `validation_status`、`validated_at`。

### 3.3 本方案的处理原则

- `/login` 和 `/register` 采用“OAuth 优先”的首屏策略，Phase 1 直接交付 `Google / TikTok / X` 三渠道 OAuth2 登录流程。
- `/account` 先把服务中枢结构做稳定，未接入的模块先提供稳定入口壳页或卡片插槽，不再把用户引回“我的资料”。
- `支付方式与安全` 模块只实现 OAuth2 绑定管理和修改密码，其他安全能力不进入 Phase 1 UI。
- Google Maps 参与自动补全、地图选点、逆地理编码、地址校验，并按最新地址契约回传可持久化的扩展字段。

## 4. 全局设计与交互约束

### 4.1 视觉 Token 使用规则

所有页面必须直接复用 `src/app/globals.css` 里的冻结 Token，不新增新的品牌色体系。

| 角色 | Token | 用法 |
| --- | --- | --- |
| 页面底色 | `--background` | 全站页面背景 |
| 卡片底色 | `--card` | 表单卡片、服务卡片、地址卡片 |
| 主文本 | `--foreground` | 标题、正文 |
| 次文本 | `--muted-foreground` | 帮助文本、时间、补充说明 |
| 主按钮 | `--primary` + `--primary-foreground` | 主 CTA |
| 次级表面 | `--secondary` / `--accent` | 分割区、次级动作容器 |
| 边框/输入 | `--border` / `--input` | 卡片描边、输入框描边 |
| 错误态 | `--destructive` | 表单错误、危险操作 |
| 圆角 | `--radius` | 主卡片与按钮圆角基准 |
| 阴影 | `--shadow-sm` ~ `--shadow-lg` | 仅用于卡片层级，不做重阴影 |

附加规则：

- 字体固定使用 `--font-sans`、`--font-mono`、`--font-serif`，不再引入第二套正文和数字字体。
- 色彩保持中性色主导。允许在 OAuth 品牌按钮中使用品牌图标本色，但按钮容器本身仍使用系统色。
- 认证页左侧氛围层允许使用同色系轻渐变，但只能由 `background / secondary / accent` 这组 Token 推导，不额外造色。

### 4.2 UI/UX 不可协商规则

- 不使用 emoji 做图标或装饰。
- 系统功能图标统一使用 `lucide-react`。
- 品牌图标只在 OAuth 场景中例外使用 `react-icons/si`，且限定为 `SiGoogle`、`SiTiktok`、`SiX`，不扩散到其他功能区。
- 文案最小化，只保留任务说明、系统状态、风险提示、下一步操作。
- 每个页面只允许一个主要任务。认证页的主要任务是“完成登录/注册”；账户页的主要任务是“继续订单相关服务”；地址页的主要任务是“管理与确认默认地址”。
- 通过间距而不是额外边框做分组，统一使用 `4 / 8 / 12 / 16 / 24 / 32 / 40 / 48` 间距标尺。

### 4.3 三端布局基线

| 端类型 | 建议宽度 | 布局规则 |
| --- | --- | --- |
| Mobile | `< 768px` | 单列，表单和卡片铺满内容区，弹层改全屏 |
| Pad | `768px - 1279px` | 双区块或双列，侧边氛围区收窄，弹层改大尺寸 Sheet |
| PC | `>= 1280px` | 12 列网格，允许左右布局，优先展示任务上下文与快捷入口 |

所有页面都要满足：

- 主 CTA 在首屏可见。
- 加载、空态、错误、成功、权限不足五类状态都必须可感知。
- 动效只用于层级切换和状态变化。认证卡片淡入与 Sheet 滑入即可，不做弹跳式装饰动效。

## 5. 信息架构与路由建议

### 5.1 Phase 1 页面任务总览

| 路由 | 页面角色 | 首要任务 | 主 CTA |
| --- | --- | --- | --- |
| `/login` | OAuth 优先登录入口 | 尽快进入已登录态 | `继续使用 Google` |
| `/register` | 账号创建入口 | 用最少输入完成注册与激活 | `创建账户` |
| `/forgot-password` | 密码恢复 | 重置密码并恢复会话 | `发送验证码` / `重置密码` |
| `/oauth2/callback` | 第三方登录与绑定中转页 | 完成登录态交接并跳转 | 无显式 CTA，自动跳转 |
| `/account` | 个人服务中枢 | 找到订单、地址、安全、售后入口 | 各模块内局部 CTA |
| `/addresses` | 地址管理页 | 添加或确认默认地址 | `新增地址` / `保存地址` |

### 5.2 推荐目录与切片

建议按总纲继续收敛到以下结构：

```text
src/
  app/
    [locale]/
      (auth)/
        login/
        register/
        forgot-password/
        oauth2/
          callback/
      (me)/
        account/
        addresses/
  features/
    auth/
      components/
      api/
      schemas/
      hooks/
    profile/
      api/
      components/
    address/
      api/
      components/
      google/
  entities/
    user/
    address/
```

说明：

- Phase 1 即使不交付完整 `orders`、`payments`、`support` 页面，也建议提前建立壳页路由，避免 `/account` 的 IA 在下一阶段发生语义漂移。
- 页面层只访问 `/api/bff/**`，不直接调用后端。

## 6. 页面实施方案

### 6.1 `/login`

#### 6.1.1 页面定位

- 面向已注册用户，也兼顾首次 OAuth 登录用户。
- 核心策略是先给低输入成本路径，再给邮箱或账号密码路径。
- Email 登录不能消失，但要从默认主动作退为次级动作。

#### 6.1.2 布局方案

采用 `login6` 的外部骨架，叠加 `login9` 的卡片内部节奏。

PC：

- 左 5 列为品牌与信任区，只保留 3 条以内价值信息，例如跨境发货、订单跟踪、安全支付。
- 右 7 列为单张认证卡片。
- 卡片内部顺序固定为：标题 -> OAuth 按钮组 -> 分割线 -> `使用邮箱登录` -> 折叠账号密码表单 -> 次级链接。

Pad：

- 氛围区收成顶部横幅。
- 认证卡片居中，宽度控制在 `480px - 560px`。

Mobile：

- 只保留认证卡片。
- 左侧氛围信息折叠为卡片上方两条极简信任点，不占主要视觉资源。

#### 6.1.3 卡片内部结构

1. 标题：`登录`。
2. 副标题：一行，说明“优先使用第三方账户继续”。
3. OAuth 按钮组：
    - `继续使用 Google`
    - `继续使用 TikTok`
    - `继续使用 X`
4. 分割线文案：`或`.
5. 次级按钮：`使用邮箱登录`。
6. 折叠表单：
    - `账号`，支持用户名 / 邮箱 / 手机号。
    - `密码`
    - `忘记密码`
    - 提交按钮：`登录`
7. 底部切换：`没有账户？去注册`

#### 6.1.4 交互动线

- 默认进入页面时，不展开账号密码表单。
- 点击任一 OAuth 按钮后，直接进入授权跳转，按钮进入 pending 状态，其他按钮禁用。
- 点击 `使用邮箱登录` 后，在当前卡片内展开表单，不跳新页，避免上下文切换。
- 若账号密码登录返回“账户未激活或已禁用”，在表单顶部展示内联警告，并提供两个动作：
    - `重新发送激活邮件`
    - `输入验证码激活`
- 登录成功后：
    - 有 `returnTo` 时回跳目标页。
    - 无 `returnTo` 且无默认地址时，跳转 `/addresses?mode=onboarding`.
    - 否则跳转 `/account`.

#### 6.1.5 BFF 映射

| 前端动作 | BFF | 后端 |
| --- | --- | --- |
| 账号密码登录 | `POST /api/bff/auth/login` | `POST /auth/login` |
| 重新发激活邮件 | `POST /api/bff/auth/resend-activation` | `POST /auth/resend-activation` |
| 获取 OAuth 授权地址 | `GET /api/bff/auth/oauth2/{provider}/authorize` | `GET /oauth2/{provider}/authorize` |

#### 6.1.6 状态要求

- Loading：按钮显示 pending 文案，不出现整页跳闪。
- Error：401 展示表单级错误；429 展示节流提示；网络错误允许重试。
- Success：不展示 toast，直接跳转。
- Permission：已登录用户访问 `/login` 时直接跳回 `/account` 或 `returnTo`。

#### 6.1.7 实现备注

- `react-icons` 仅用于 OAuth 品牌图标，具体采用 `react-icons/si`。
- 全站功能图标仍然保持 `lucide-react`，避免图标风格混乱。
- 三个 OAuth 按钮在登录页和注册页保持完全一致的顺序、文案和交互反馈。

### 6.2 `/register`

#### 6.2.1 页面定位

- 手工注册是兜底路径，不应该比 OAuth 更显眼。
- 手工注册一旦提交，就要立即进入激活闭环，不让用户在邮箱里迷路。

#### 6.2.2 布局方案

采用 `signup10` 左右布局。

PC：

- 左侧 5 列是品牌与权益区，强调跨境购物中注册后可直接获得的服务，例如订单追踪、地址簿、售后入口。
- 右侧 7 列是注册卡片。

Pad：

- 左右布局收成上下布局，价值信息在上，注册卡片在下。

Mobile：

- 保留单卡片。
- 左侧内容改成卡片上方简短标题与一条辅助说明。

#### 6.2.3 阶段一：注册信息填写

卡片结构：

1. 标题：`创建账户`。
2. OAuth 按钮组，顺序与 `/login` 完全一致。
3. 分割线：`或使用邮箱注册`。
4. 表单字段：
    - `邮箱`
    - `密码`
    - `用户名`
    - `昵称`
    - `手机号（可选）`
5. 主 CTA：`创建账户`
6. 次级切换：`已有账户？去登录`

字段原则：

- `手机号` 默认折叠为可选项，不默认展开。
- `昵称` 可以在用户输入 `用户名` 后自动预填，但允许修改。
- 表单提交前展示最少量密码规则，不把规则写成长段说明。

#### 6.2.4 阶段二：邮件已发送与验证码激活

注册接口返回 `202` 后，不跳页，卡片切换到激活阶段。

激活阶段结构：

1. 标题：`验证邮箱`
2. 当前邮箱地址摘要
3. 邮件发送状态条：
    - `发送中`
    - `已投递`
    - `暂未送达`
4. 6 位验证码输入
5. 主 CTA：`激活并继续`
6. 次级动作：
    - `重新发送`
    - `修改邮箱`

动线要求：

- 页面自动轮询 `GET /auth/email-status`，前 60 秒每 5 秒一次，之后停止自动轮询，改为手动刷新。
- `重新发送` 需要带倒计时，避免 429。
- `修改邮箱` 返回阶段一，但清空密码字段，不在前端长时间保留密码。
- 验证成功后，后端会下发 `access_token` 与 `csrf_token`，前端直接进入登录态。
- 验证成功后的跳转策略与 `/login` 一致：优先 `returnTo`，否则检查默认地址，没有默认地址时跳 `/addresses?mode=onboarding`。

#### 6.2.5 BFF 映射

| 前端动作 | BFF | 后端 |
| --- | --- | --- |
| 注册提交 | `POST /api/bff/auth/register` | `POST /auth/register` |
| 邮件状态轮询 | `GET /api/bff/auth/email-status` | `GET /auth/email-status` |
| 验证码激活 | `POST /api/bff/auth/verify-email` | `POST /auth/verify-email` |
| 重发激活邮件 | `POST /api/bff/auth/resend-activation` | `POST /auth/resend-activation` |
| OAuth 注册 | `GET /api/bff/auth/oauth2/{provider}/authorize` | `GET /oauth2/{provider}/authorize` |

#### 6.2.6 错误映射

- `409 CONFLICT`：优先映射到具体字段，至少区分邮箱已占用、用户名已占用、手机号已占用。
- `422`：只在验证码阶段出现，错误绑定到验证码输入区。
- `429`：停用重发按钮并展示剩余等待时间。

### 6.3 `/forgot-password`

#### 6.3.1 页面定位

- 该页保持原方案，但必须和 `/login` 共用相同的认证视觉语言。
- 不把用户拆到多个路由，避免重置链路过长。

#### 6.3.2 布局方案

- PC 和 Pad 复用认证页骨架，但弱化左侧氛围区。
- Mobile 为单卡片单列布局。

#### 6.3.3 两阶段流程

阶段一：

- 输入 `账号`，支持用户名 / 邮箱 / 手机号。
- CTA：`发送验证码`

阶段二：

- 输入 `验证码`
- 输入 `新密码`
- CTA：`重置密码`

#### 6.3.4 交互动线

- `POST /auth/password/forgot` 永远按受理成功处理，不暴露账号是否存在。
- 阶段二提交成功后，后端会直接下发登录态 Cookie。
- 成功后跳转规则与注册成功一致。

#### 6.3.5 BFF 映射

| 前端动作 | BFF | 后端 |
| --- | --- | --- |
| 发起找回 | `POST /api/bff/auth/password/forgot` | `POST /auth/password/forgot` |
| 提交新密码 | `POST /api/bff/auth/password/reset` | `POST /auth/password/reset` |

### 6.4 `/oauth2/callback`

#### 6.4.1 页面定位

- 这是纯状态中转页，不承载表单。
- 既要服务登录，也要服务账户中的第三方绑定。

#### 6.4.2 页面结构

- 页面中央只保留一张窄卡片。
- 卡片只允许三类状态：
    - `正在完成登录`
    - `登录成功，正在跳转`
    - `登录失败`

#### 6.4.3 交互规则

- 页面优先读取 `provider`、`intent`、`returnTo`、`error` 等 query。
- 成功时先调用 `GET /api/bff/me` 确认会话已建立，再按跳转规则前进。
- 失败时给两个恢复动作：
    - `返回登录`
    - `改用邮箱登录`
- 绑定模式下成功后跳回 `/account?panel=security`，并刷新绑定列表。

#### 6.4.4 BFF 映射

| 场景 | BFF | 后端 |
| --- | --- | --- |
| 登录回调 | `GET /api/bff/auth/oauth2/{provider}/callback` | `GET /oauth2/{provider}/callback` |
| 绑定回调 | `GET /api/bff/account/bindings/oauth2/{provider}/callback` | `GET /users/me/bindings/oauth2/{provider}/callback` |
| 会话确认 | `GET /api/bff/me` | `GET /users/me` |

### 6.5 `/account`

#### 6.5.1 页面定位

- 这是“服务中枢”，不是“资料页”。
- 首屏不展示大头像（可以有头像，但是视觉比重要放低）、不展示社交化简介、不把“修改资料”放成唯一主路径。
- 用户进入后，应该 3 秒内看懂：我可以查看订单物流、管理地址、处理安全问题、寻找售后入口。

#### 6.5.2 首屏模块结构

PC：

- 第一行：`订单与物流` 横向状态卡，占满整行。
- 第二行：三张等宽卡片，分别是 `地址簿`、`支付方式与安全`、`客服与售后`。
- 第三行：低优先级 `账户基础信息`，收纳邮箱、昵称、语言、退出登录。

Pad：

- 第一行订单卡片全宽。
- 第二行两列卡片。
- 第三张卡片自动换行。

Mobile：

- 纵向堆叠，顺序固定为 `订单与物流 -> 地址簿 -> 支付方式与安全 -> 客服与售后 -> 账户基础信息`。

#### 6.5.3 模块一：订单与物流

首屏直接给五个状态入口：

- `待付款`
- `待发货`
- `运输中`
- `已送达`
- `售后中`

交互要求：

- 每个状态都是可点卡片或按钮，点击后直接进入订单列表过滤态，而不是跳资料页。
- 即使订单域尚未在 Phase 1 完整交付，也建议先建立 `/orders` 壳页并支持 query 参数，以保证账户页 IA 稳定。
- 计数在订单域未接入前可以不显示，不强行展示假数据。

后续状态映射建议：

| 前台文案 | 后续状态来源 |
| --- | --- |
| 待付款 | `PENDING_PAYMENT` |
| 待发货 | 已支付且未发货 |
| 运输中 | `shipment` 非签收状态 |
| 已送达 | `DELIVERED` / `FULFILLED` |
| 售后中 | 退款中或售后工单处理中 |

#### 6.5.4 模块二：地址簿

首屏必须直接展示：

- 默认地址摘要
- 地址数量
- `管理地址`
- `新增地址`

如果用户没有默认地址：

- 在模块内显示明确提醒。
- `新增地址` 提升为模块主 CTA。

#### 6.5.5 模块三：支付方式与安全

为保持信息架构稳定，模块标题保持 `支付方式与安全`，但 Phase 1 只实现以下两类能力：

- 第三方绑定列表
- 绑定新 OAuth 账号
- 解绑 OAuth 账号
- 修改密码，Phase 1 暂时复用 `/forgot-password` 链路

不纳入 Phase 1 实施的子能力：

- 已绑定支付方式
- 登录设备
- passkey

这些能力本期不做伪功能按钮，只保留模块标题和后续插槽，避免首屏出现不可用操作。

#### 6.5.6 模块四：客服与售后

Phase 1 就要把这个入口做可见，不让用户“密室逃脱”。

本期策略：

- 先保留 `退款/退货`、`物流异常`、`联系客服` 三个入口位。
- 若 customerservice 域尚未接入，入口先跳壳页或帮助页，不隐藏。
- 后续工单、退货、补发接入时，不改模块名称和位置。

#### 6.5.7 低优先级模块：账户基础信息

只保留必要信息：

- 邮箱
- 昵称
- 语言偏好
- 退出登录

该区块不做大卡片风格，不与首屏服务入口竞争。

#### 6.5.8 数据聚合建议

建议新增一个账户总览聚合 BFF：

`GET /api/bff/account/overview`

Phase 1 聚合来源：

- `/users/me`
- `/users/me/profile`
- `/users/me/bindings`
- `/users/me/addresses?page=1&size=3`

后续 Phase 2+ 再接入：

- 订单状态计数
- 物流异常数量
- 售后数量
- 支付方式数量

#### 6.5.9 绑定与安全操作映射

| 前端动作 | BFF | 后端 |
| --- | --- | --- |
| 获取总览 | `GET /api/bff/account/overview` | 聚合接口 |
| 查看绑定 | `GET /api/bff/account/bindings` | `GET /users/me/bindings` |
| 发起绑定 | `GET /api/bff/account/bindings/{provider}/authorize` | `GET /users/me/bindings/{provider}/authorize` |
| 解绑 | `DELETE /api/bff/account/bindings/{provider}` | `DELETE /users/me/bindings/{provider}` |
| 退出登录 | `POST /api/bff/auth/logout` | `POST /auth/logout` |

解绑边界：

- 前端不做“最后一种登录方式”静态判断，交给后端裁决。
- 若后端返回 `Cannot remove the only login method`，在当前卡片内展示可恢复提示，不使用全局 toast。

### 6.6 `/addresses`

#### 6.6.1 页面定位

- 地址页是高频任务页，不是设置深层页。
- 目标是让用户尽快得到一个可用默认地址，并降低跨境地址输入负担。
- 不采用 inline edit，避免长字段展开造成认知负担。

#### 6.6.2 页面布局

PC：

- 顶部为页面标题、默认地址状态和 `新增地址` 按钮。
- 主内容区使用卡片列表或双列卡片网格。
- 点击 `新增地址` 或 `编辑` 后，打开右侧大尺寸 Sheet，宽度建议 `560px - 640px`。

Pad：

- 地址卡片单列。
- 编辑使用大尺寸 Sheet。

Mobile：

- 地址卡片单列。
- 新增与编辑改为全屏表单页或全屏 Dialog，不使用右侧 Sheet。

#### 6.6.3 地址卡片内容

每张卡片固定展示：

- 收件人
- 手机号
- 国家 / 省州 / 城市 / 区县
- 地址行 1 / 地址行 2
- 邮编
- 地址校验状态
- 默认地址标识
- 操作：`设为默认`、`编辑`、`删除`

状态展示规则：

- `validation_status=ACCEPT` 时不额外打扰，只在详情区弱提示“已校验”。
- `validation_status=REVIEW/FIX/REJECT` 时在卡片头部展示状态 badge，并把 `编辑` 提升为首个动作。

#### 6.6.4 新增与编辑表单

表单顺序建议：

1. `收件人`
2. `手机号`
3. `国家/地区`
4. `搜索地址`
5. `地址行 1`
6. `地址行 2`
7. `省州`
8. `城市`
9. `区县`
10. `邮编`
11. `设为默认地址`

关键原则：

- `搜索地址` 先于手工字段出现，把自动补全放在前面。
- 自动补全后回填手工字段，用户仍然可以编辑。
- 自动补全、地图选点、地址校验返回的 Google 扩展字段与可见表单字段同步维护，不让用户手填系统字段。
- 保存前做地址校验，但不能强迫用户接受系统建议地址。

提交时的字段组织：

- 用户可见字段：`receiver_name`、`phone_country_code`、`phone_national_number`、`country`、`province`、`city`、`district`、`address_line1`、`address_line2`、`zipcode`、`is_default`
- Google 扩展字段：`country_code`、`language_code`、`address_source`、`raw_input`、`google_placeId`、`place_response`

#### 6.6.5 Google 地图能力接入方案

前端依赖：

- `@vis.gl/react-google-maps`

交互能力：

1. 地址补全：
    - 使用 `PlaceAutocompleteElement` 或 Google Place Autocomplete Widget。
    - 用户选择候选地址后，自动回填 `country`、`province`、`city`、`district`、`address_line1`、`zipcode`。
2. 地图选点：
    - 表单内提供小型地图预览。
    - 用户点击地图或拖动标记后，触发 Reverse Geocoding，再回填地址字段。
3. 提交前校验：
    - 保存前调用 Google Address Validation API。
    - 若存在建议地址，弹出“建议地址 vs 当前输入”的轻量对比层，让用户选择。

#### 6.6.6 Google 集成边界

- 标准化后的表单字段仍然是页面主显示字段和主编辑字段。
- 按最新用户 API 契约，把 Google 地址补全、地图选点、校验产生的扩展字段随地址一并提交，由后端持久化。
- Google HTTP API 建议通过 BFF 代理，避免把服务端密钥暴露在浏览器。

建议采用以下字段映射：

| 前端来源 | 后端字段 | 说明 |
| --- | --- | --- |
| 国家选择器或 Google 地区码 | `country_code` | 地址标准国家码 |
| 当前 locale 或地图请求语言 | `language_code` | Google 查询语言 |
| 手填 / 自动补全 / 地图选点 | `address_source` | `MANUAL` / `GOOGLE_AUTOCOMPLETE` / `GOOGLE_MAP_PICK` |
| 搜索框原始输入 | `raw_input` | 便于回溯用户输入和校验来源 |
| Google Place 结果 | `google_placeId` | Place 主键 |
| Place / Geocode / Validation 结果摘要 | `place_response` | 建议序列化后提交，由 BFF 控制体积 |
| 后端回传 | `validation_status` | `UNVALIDATED` / `ACCEPT` / `REVIEW` / `FIX` / `REJECT` |
| 后端回传 | `validated_at` | 最近一次完成校验时间 |

实现注意：

- `CreateAddressRequest` 中 `country_code` 与 `address_source` 为必填。
- `UpdateAddressRequest` 中 `country_code` 与 `raw_input` 为必填。
- `place_response` 不建议直接把完整 Google 原始对象无裁剪透传给后端，BFF 应先做白名单提取与长度控制。

建议新增 BFF：

| 前端动作 | BFF | 上游 |
| --- | --- | --- |
| 逆地理编码 | `POST /api/bff/geo/reverse-geocode` | Google Geocoding API |
| 地址校验 | `POST /api/bff/geo/address-validation` | Google Address Validation API |

#### 6.6.7 地址接口映射

| 前端动作 | BFF | 后端 |
| --- | --- | --- |
| 列表 | `GET /api/bff/account/addresses` | `GET /users/me/addresses` |
| 新增 | `POST /api/bff/account/addresses` | `POST /users/me/addresses` |
| 详情 | `GET /api/bff/account/addresses/{id}` | `GET /users/me/addresses/{id}` |
| 编辑 | `PATCH /api/bff/account/addresses/{id}` | `PATCH /users/me/addresses/{id}` |
| 删除 | `DELETE /api/bff/account/addresses/{id}` | `DELETE /users/me/addresses/{id}` |
| 设为默认 | `POST /api/bff/account/addresses/{id}/set-default` | `POST /users/me/addresses/{id}/set-default` |

#### 6.6.8 幂等与重试

- 新增地址必须由 BFF 注入 `Idempotency-Key`。
- 同一次“保存地址”重试必须复用同一个 key。
- 删除和设默认不做乐观冒进，优先以后端结果为准。
- 成功后局部刷新列表，不依赖整页刷新感知成功。

#### 6.6.9 Onboarding 模式

以下场景进入 `mode=onboarding`：

- 注册激活成功且无默认地址。
- 登录成功且地址列表为空。
- 用户从 checkout 被拦截回补默认地址。

Onboarding 模式要求：

- 页面顶部展示轻量步骤提示：`完成默认地址后可继续下单`。
- 若地址已创建且已设为默认，提供明显的 `继续购物` 或 `返回结账`。

## 7. BFF、依赖与工程落地

### 7.1 建议新增依赖

| 依赖 | 用途 |
| --- | --- |
| `react-hook-form` | 认证和地址表单 |
| `zod` | 运行时校验与 schema 复用 |
| `@hookform/resolvers` | 表单与 zod 集成 |
| `react-icons` | OAuth 品牌图标 |
| `@vis.gl/react-google-maps` | 地图、地址补全与选点 |
| `libphonenumber-js` | 手机号解析与格式化 |

### 7.2 建议的 BFF 路由

```text
src/app/api/bff/auth/login/route.ts
src/app/api/bff/auth/register/route.ts
src/app/api/bff/auth/email-status/route.ts
src/app/api/bff/auth/verify-email/route.ts
src/app/api/bff/auth/resend-activation/route.ts
src/app/api/bff/auth/password/forgot/route.ts
src/app/api/bff/auth/password/reset/route.ts
src/app/api/bff/auth/logout/route.ts
src/app/api/bff/auth/oauth2/[provider]/authorize/route.ts
src/app/api/bff/auth/oauth2/[provider]/callback/route.ts
src/app/api/bff/account/overview/route.ts
src/app/api/bff/account/bindings/route.ts
src/app/api/bff/account/bindings/[provider]/authorize/route.ts
src/app/api/bff/account/bindings/[provider]/route.ts
src/app/api/bff/account/addresses/route.ts
src/app/api/bff/account/addresses/[id]/route.ts
src/app/api/bff/account/addresses/[id]/set-default/route.ts
src/app/api/bff/geo/reverse-geocode/route.ts
src/app/api/bff/geo/address-validation/route.ts
```

### 7.3 Feature Slice 建议

`features/auth`

- `oauth-buttons.tsx`
- `email-login-form.tsx`
- `register-form.tsx`
- `activation-panel.tsx`
- `forgot-password-panel.tsx`
- `oauth-callback-card.tsx`

`features/profile`

- `account-overview.tsx`
- `security-card.tsx`
- `bindings-list.tsx`

`features/address`

- `address-list.tsx`
- `address-card.tsx`
- `address-form-sheet.tsx`
- `google-place-input.tsx`
- `address-map-picker.tsx`
- `address-validation-dialog.tsx`

## 8. 校验、错误处理与状态闭环

### 8.1 表单校验

- 认证表单与地址表单统一使用 `react-hook-form + zod`。
- 手机号字段在 UI 层拆分为国家码与本地号码，提交前再映射为后端字段。
- 地址补全后仍然需要二次校验，因为 Google 结果不等于业务可投递地址。

### 8.2 错误分层

| 错误类型 | 表现方式 |
| --- | --- |
| 字段格式错误 | 字段下方错误文案 |
| 登录失败 / 验证码错误 | 表单顶部内联告警 |
| 节流 | 当前操作区内联提示 + 倒计时 |
| 网络失败 | 当前卡片内可重试提示 |
| 跨页面错误 | 仅必要时 toast，默认避免 |

### 8.3 反馈闭环

每一个关键动作都必须回答三件事：

- 系统有没有收到我的操作。
- 当前处理到哪一步。
- 下一步我应该做什么。

具体表现：

- OAuth 跳转前按钮进入 pending。
- 注册后明确显示“邮件已发送”和当前投递状态。
- 地址保存后直接回到列表并更新卡片，不只弹 toast。
- 解绑失败时在当前安全模块里说明原因，不让用户自行猜测。

## 9. 埋点与验收

### 9.1 建议埋点

- `auth_oauth_click`
- `auth_email_reveal`
- `auth_login_submit`
- `register_submit`
- `register_email_status_polled`
- `register_verify_success`
- `password_reset_submit`
- `address_autocomplete_selected`
- `address_validation_suggested`
- `address_saved`
- `address_set_default`
- `account_module_click`

### 9.2 Phase 1 验收标准

- `/login` 首屏默认呈现三枚 OAuth 按钮，邮箱登录为次级动作。
- `/register` 完成两阶段闭环，支持邮件状态轮询与验证码激活。
- `/forgot-password` 在单路由内完成找回与重置，并在成功后恢复会话。
- `/account` 首屏按服务中枢组织，四大模块可见，其中安全模块真实可用的内容限定为 OAuth2 绑定管理和修改密码。
- `/addresses` 不使用 inline edit，支持 Google 地址补全、地图选点回填、提交前校验。
- 所有写请求走 BFF，继续遵守 Cookie JWT、CSRF 双提交、地址创建幂等键。
- 页面在 PC、Pad、Mobile 三端均可完成完整流程。

## 10. 实施顺序建议

1. 先补 `auth/*`、`account/overview`、`addresses/*` 的 BFF 路由。
2. 再完成 `/login`、`/register`、`/forgot-password`、`/oauth2/callback`。
3. 随后交付 `/addresses`，把 onboarding 模式接到认证成功跳转。
4. 最后交付 `/account` 服务中枢与安全模块，并补壳页入口保持 IA 稳定。

这样做的原因很直接：

- 认证成功后的首要依赖是会话与地址，不是资料展示。
- 地址一旦可用，Phase 1 的“可下单”目标就闭合。
- 账户页最后接入，可以直接复用前面已经打通的认证、地址、安全数据。
