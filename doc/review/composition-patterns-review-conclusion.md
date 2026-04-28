# React Composition Patterns Review 结论

审查日期：2026-04-28  
审查依据：`vercel-composition-patterns` skill、当前 checkout、`AGENTS.md`、`doc/总体前端设计.md`、`doc/design-system/figma-design-system-rules.md`

## 结论摘要

当前组件体系已经有几个好的基础：`Card`、`Field`、`Dialog`、`Sheet`、`Select`、`InputOTP` 等基本沿用 compound/shadcn 风格；Auth 动效集中在 `src/components/blocks/auth-motion.ts`；`Button` 已有统一的 `status` API；代码里没有发现 `forwardRef`，render props 也基本没有扩散。

主要问题集中在 Auth 用户流程：`AuthPageClient` 同时承担页面状态机、字段状态、校验、BFF 调用、toast、按钮反馈、倒计时、OAuth 回跳和具体 JSX 组合，导致 UI 组件只能通过长 props 串接。后续继续增加 Auth、账户、订单、地址等复杂流程时，建议优先用 provider + compound components + explicit variants，把状态契约和 UI 组合拆开。

本次 review 不建议把所有 boolean 都当成问题。`disabled`、`invalid`、`aria-invalid`、`isActive` 这类表达真实可访问性或业务状态的 boolean 可以保留；需要警惕的是 `showPasswordField`、`showCloseButton`、`pressable` 这类会改变结构或行为组合的开关。

## P1：AuthPageClient 是流程、状态和视图的集中式大组件

证据：

- `src/app/[locale]/auth/auth-page-client.tsx:260` 开始的 `AuthPageClient` 持有 `mode`、`flow`、pending/completed action、OAuth provider、success、redirect、resend countdown、所有表单字段、字段交互状态等大量状态。
- `src/app/[locale]/auth/auth-page-client.tsx:421` 到 `src/app/[locale]/auth/auth-page-client.tsx:680` 同时处理 login/register/verify/resend/forgot/reset/OAuth 的请求和按钮状态。
- `src/app/[locale]/auth/auth-page-client.tsx:684` 到 `src/app/[locale]/auth/auth-page-client.tsx:925` 同时处理校验、字段 touched/blurred 状态和派生 error。
- 当前文件约 1298 行，已经不是单纯 page client，而是 Auth flow controller + form controller + renderer。

对应规则：

- `state-lift-state`
- `state-decouple-implementation`
- `state-context-interface`
- `architecture-compound-components`

风险：

- 新增一个 Auth mode 会同时修改状态、校验、请求、文案映射、面板 JSX 和 transition，变更面过大。
- 兄弟组件如 footer、provider buttons、success view、resend control 只能靠 props 或闭包访问状态，难以组合复用。
- 后续需要把 Auth 能力复用到弹窗、checkout 登录拦截、账户设置安全校验时，当前实现很难迁移。

修复方案：

1. 在 `src/features/auth/model` 增加 Auth flow provider：

```tsx
type AuthFlowState = {
  mode: AuthMode
  flow: AuthFlow
  pendingAction: PendingAction | null
  completedAction: PendingAction | null
  fields: AuthFields
  errors: AuthFormErrors
  timers: AuthTimers
  success: AuthSuccessState
}

type AuthFlowActions = {
  switchMode: (nextMode: AuthMode, nextFlow?: AuthFlow) => void
  updateField: (field: AuthInputField, value: string) => void
  blurField: (field: AuthInputField) => void
  submitLogin: () => Promise<void>
  submitRegister: () => Promise<void>
  submitVerification: () => Promise<void>
  submitForgotPassword: () => Promise<void>
  submitPasswordReset: () => Promise<void>
  resendVerificationCode: () => Promise<void>
  resendRecoveryCode: () => Promise<void>
  startOAuth: (provider: AuthProvider) => void
}

type AuthFlowMeta = {
  copy: AuthPageCopy
  locale: string
  reducedMotion: boolean
}

type AuthFlowContextValue = {
  state: AuthFlowState
  actions: AuthFlowActions
  meta: AuthFlowMeta
}
```

2. 用 reducer 或小型状态机收敛 mode、flow、pending、completed、success、timer 的更新，不再分散成二十多个 `useState`。
3. 把纯校验函数移到 `src/features/auth/model/auth-validation.ts`，用文案参数注入错误信息，方便单测。
4. `AuthPageClient` 只保留：
   - `AuthFlowProvider`
   - `LayoutGroup`
   - `AuthPageShell`
   - 当前 mode 的 panel renderer
5. 用 Vitest 覆盖 reducer transition、校验函数和关键 submit 成功/失败路径。

## P1：Auth mode 渲染是内联条件树，不是 explicit variants

证据：

- `src/app/[locale]/auth/auth-page-client.tsx:953` 到 `src/app/[locale]/auth/auth-page-client.tsx:1138` 通过一串 `mode === ... ? ... : null` 渲染 `login`、`register`、`login-email`、`register-email`、`verify`、`forgot`、`reset`、`success`。
- `src/app/[locale]/auth/auth-mode-panel-transition.ts:1` 到 `src/app/[locale]/auth/auth-mode-panel-transition.ts:76` 已经把 mode 和 transition 语义抽出来，但面板本身还没有相应的显式组件边界。

对应规则：

- `patterns-explicit-variants`
- `architecture-avoid-boolean-props`
- `architecture-compound-components`

风险：

- 每个 mode 的结构不自描述，需要读完整条件树才能知道页面形态。
- 当前 transition resolver 是好的起点，但 mode 的 UI、数据和动作仍然绑定在父组件闭包里。
- 容易出现“mode 已切换，但字段/error/timer 仍来自旧 flow”的隐性耦合。

修复方案：

1. 新增显式 panel 组件，例如：

```text
src/features/auth/ui/panels/
  login-entry-panel.tsx
  register-entry-panel.tsx
  login-email-panel.tsx
  register-email-panel.tsx
  verify-email-panel.tsx
  forgot-password-panel.tsx
  reset-password-panel.tsx
  auth-success-panel.tsx
```

2. 每个 panel 内部通过 `use(AuthFlowContext)` 获取 `state/actions/meta`，只组合自己需要的 block。
3. 增加 `AuthModePanelRenderer`：

```tsx
const panelByMode = {
  login: LoginEntryPanel,
  register: RegisterEntryPanel,
  "login-email": LoginEmailPanel,
  "register-email": RegisterEmailPanel,
  verify: VerifyEmailPanel,
  forgot: ForgotPasswordPanel,
  reset: ResetPasswordPanel,
  success: AuthSuccessPanel,
} satisfies Record<AuthMode, React.ComponentType>
```

4. 保留现有 `resolveAuthModePanelAnimation(...)` 作为 transition 的唯一入口，避免把动画规则重新散落到 panel 内。

## P2：AuthEmailForm 用结构 boolean 表达两个不同表单

证据：

- `src/components/blocks/auth-block.tsx:97` 到 `src/components/blocks/auth-block.tsx:127` 的 `AuthEmailFormProps` 同时包含 account、phone country、password、forgot action、submit、`showPasswordField`、`showSubmitIcon` 等配置。
- `src/components/blocks/auth-block.tsx:374` 到 `src/components/blocks/auth-block.tsx:483` 中 `showPasswordField` 决定是否渲染 password field，`showSubmitIcon` 决定 submit 结构。
- `src/app/[locale]/auth/auth-page-client.tsx:973` 到 `src/app/[locale]/auth/auth-page-client.tsx:1002` 用它渲染登录表单。
- `src/app/[locale]/auth/auth-page-client.tsx:1065` 到 `src/app/[locale]/auth/auth-page-client.tsx:1084` 用同一个组件渲染 forgot-password 表单，并传入 `showPasswordField={false}`。

对应规则：

- `architecture-avoid-boolean-props`
- `patterns-explicit-variants`
- `patterns-children-over-render-props`

风险：

- `showPasswordField=false` 时，组件类型仍允许 password props、forgot action props 等无效组合。
- 登录和忘记密码的业务含义不同，但被一个“可配置表单”隐藏了。
- 后续加 magic-link、phone-only、guest checkout 登录时，这个 props 会继续膨胀。

修复方案：

优先选 explicit variants：

```tsx
function AuthLoginEmailForm() {
  return (
    <AuthForm.Frame>
      <AuthForm.AccountField />
      <AuthForm.PasswordField action={<ForgotPasswordAction />} />
      <AuthForm.Submit icon="arrow" />
    </AuthForm.Frame>
  )
}

function AuthForgotAccountForm() {
  return (
    <AuthForm.Frame>
      <AuthForm.AccountField />
      <AuthForm.Submit icon="arrow" />
    </AuthForm.Frame>
  )
}
```

如果仍想保留底层复用，应抽 `AuthForm.Frame`、`AuthForm.AccountField`、`AuthForm.PasswordField`、`AuthForm.Submit` 这类 compound pieces，而不是继续给 `AuthEmailForm` 加布尔开关。迁移时可以先保留旧导出作为兼容 wrapper，内部改成调用新组件。

## P2：Auth 表单通过长 props 传递字段状态，缺少 generic context interface

证据：

- `src/components/blocks/auth-block.tsx:129` 到 `src/components/blocks/auth-block.tsx:212` 中 `AuthRegisterFormProps`、`AuthVerifyFormProps`、`AuthResetPasswordFormProps` 都在重复声明 value、onChange、invalid、error、label、status、disabled。
- `src/app/[locale]/auth/auth-page-client.tsx:1006` 到 `src/app/[locale]/auth/auth-page-client.tsx:1128` 调用这些表单时，每个字段都从父组件逐项传入。
- `AuthVerifyForm` 与 `AuthResetPasswordForm` 都组合了验证码、resend、submit；对应逻辑散在父组件和 block 内。

对应规则：

- `state-context-interface`
- `state-decouple-implementation`
- `state-lift-state`

风险：

- UI block 必须知道字段状态的组织方式，无法被另一个 provider 复用。
- 父组件承担太多字段映射，一旦字段命名变化，所有调用点一起改。
- `resend`、`OTP code`、`password pair` 这类可复用 step 没有稳定上下文接口。

修复方案：

1. 为 Auth form 定义可注入接口：

```tsx
type AuthFormState = {
  values: Record<AuthInputField, string>
  errors: AuthFormErrors
  touched: Partial<Record<AuthInputField, boolean>>
  disabled: boolean
}

type AuthFormActions = {
  change: (field: AuthInputField, value: string) => void
  blur: (field: AuthInputField) => void
  submit: () => Promise<void>
}
```

2. `AuthForm.Provider` 只负责注入 state/actions/meta；字段组件通过 context 消费，不再逐层透传。
3. 抽出稳定 pieces：
   - `AuthForm.AccountField`
   - `AuthForm.PasswordField`
   - `AuthForm.PasswordPair`
   - `AuthForm.CodeField`
   - `AuthForm.ResendControl`
   - `AuthForm.Submit`
4. 业务 panel 负责选择 pieces 的组合，provider 负责状态来源。

## P2：Dialog/Sheet 的 showCloseButton 是结构开关，应改为 slot/显式组件

证据：

- `src/components/ui/dialog.tsx:50` 到 `src/components/ui/dialog.tsx:82` 的 `DialogContent` 通过 `showCloseButton` 决定是否渲染右上角关闭按钮。
- `src/components/ui/dialog.tsx:98` 到 `src/components/ui/dialog.tsx:120` 的 `DialogFooter` 也通过 `showCloseButton` 决定是否追加 Close 按钮。
- `src/components/ui/sheet.tsx:48` 到 `src/components/ui/sheet.tsx:83` 同样使用 `showCloseButton`。

对应规则：

- `architecture-avoid-boolean-props`
- `architecture-compound-components`

风险：

- 关闭按钮位置、样式、文案被组件内部固定，业务无法自然组合。
- `DialogContent showCloseButton` 和 `DialogFooter showCloseButton` 可能同时开启，产生两个关闭入口。
- 后续若需要“顶部 icon close”“底部取消按钮”“无 close”“自定义 close 文案”等，会继续增加 boolean 或专用 props。

修复方案：

1. 保留 Radix primitive wrapper：

```tsx
function DialogContent({ children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content {...props}>{children}</DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogCloseButton(props: React.ComponentProps<typeof Button>) {
  return (
    <DialogPrimitive.Close asChild>
      <Button variant="ghost" size="icon-sm" {...props} />
    </DialogPrimitive.Close>
  )
}
```

2. 业务使用方显式组合：

```tsx
<DialogContent>
  <DialogHeader />
  <DialogBody />
  <DialogCloseButton className="absolute top-2 right-2" />
</DialogContent>
```

3. 如果需要保留默认便捷 API，可以新增 `DialogContentWithClose`，但底层仍复用 slot pieces。

## P2：Button 同时承担 polymorphic、async status 和 press 行为

证据：

- `src/components/ui/button.tsx:65` 到 `src/components/ui/button.tsx:73` 中 `ButtonProps` 包含 `asChild`、`pressable?: boolean | "auto"`、`status`、`successHoldMs`、`loadingLabel`、`successLabel`。
- `src/components/ui/button.tsx:89` 到 `src/components/ui/button.tsx:131` 在 Button 内维护 success hold 的本地状态。
- `src/components/ui/button.tsx:148` 到 `src/components/ui/button.tsx:157` 的 `asChild` 分支只透传 children；`src/components/ui/button.tsx:166` 到 `src/components/ui/button.tsx:195` 的非 `asChild` 分支才渲染 loading/success 动画内容。

对应规则：

- `architecture-avoid-boolean-props`
- `patterns-explicit-variants`
- `state-decouple-implementation`

风险：

- 当前项目里 `asChild + status` 暂未实际组合，但类型允许这种组合；一旦使用，调用者可能以为 loading/success 内容会出现，实际不会。
- `pressable="auto"` 把交互策略藏在 Button 内部，随着 size/variant 增多会越来越难预测。
- Button 作为基础 primitive 过早承载异步状态机，会让链接按钮、图标按钮、普通 submit button 的语义混在一起。

修复方案：

1. 拆分底层样式 primitive 和异步 action button：

```tsx
function ButtonRoot(props: ButtonRootProps) {}
function AsyncButton(props: AsyncButtonProps) {}
function IconButton(props: IconButtonProps) {}
function LinkButton(props: LinkButtonProps) {}
```

2. `AsyncButton` 独占 `status/successHoldMs/loadingLabel/successLabel`；`LinkButton` 独占 `asChild` 或 href 语义。
3. `pressable` 改为 explicit variant 或 data attribute，由具体 variant 选择，不要让调用者传 `boolean | "auto"`。
4. 若短期不拆文件，至少在类型层禁止 `asChild` 与 `status !== "idle"` 同时出现。

## P3：React 19 context API 迁移点较小

证据：

- `package.json` 使用 React `19.2.3`。
- 全仓库未发现 `forwardRef`。
- `src/components/ui/input-otp.tsx:56` 使用 `React.useContext(OTPInputContext)`。

对应规则：

- `react19-no-forwardref`

风险：

- 不是当前最大问题，但项目已经是 React 19，后续共享组件应统一采用 React 19 风格，避免新旧写法混杂。

修复方案：

1. 将 `InputOTPSlot` 中的 context 读取调整为：

```tsx
const inputOTPContext = React.use(OTPInputContext)
```

2. 若第三方 context 类型不允许 null，保留当前 fallback；否则封装 `useInputOTPContext()`，集中处理空上下文。
3. 后续新增组件时避免重新引入 `forwardRef`。

## P3：组合架构相关测试缺口明显

证据：

- 当前测试文件只有 `src/lib/api/oauth.test.ts`。
- Auth flow、Auth transition、Button status、Form invalid/resend 等用户可见组合行为没有现存测试覆盖。

风险：

- 一旦按上面的 provider/compound components 重构，缺少回归测试会让动效、按钮成功态、OTP 错误态、resend 倒计时等细节容易回退。

修复方案：

1. 先补纯函数测试：
   - `resolveAuthModePanelTransition`
   - `resolveAuthModePanelExpandBehavior`
   - Auth validation helpers
   - Auth reducer transitions
2. 再补轻量 RTL 测试：
   - Login email panel submit loading/success
   - Register -> verify transition
   - Verify failure sets code error
   - Forgot -> reset transition
   - Button idle/loading/success rendering
3. 重构前先落测试，重构后用同一组测试兜底。

## 推荐落地顺序

1. **先写测试与抽纯函数**：把 Auth validation、transition、button status 这些已有行为锁住，不改变 UI。
2. **引入 AuthFlowProvider**：把 `AuthPageClient` 的状态和 actions 移入 provider/reducer，页面先保持原 JSX。
3. **拆 explicit panels**：把每个 `mode === ...` 的 JSX 搬到独立 panel，panel 通过 context 消费状态。
4. **拆 Auth form compound pieces**：先处理 `AuthEmailForm` 的 login/forgot 分裂，再处理 register/verify/reset 的字段复用。
5. **整理 shared primitives**：最后再处理 `Dialog/Sheet showCloseButton`、`Button asChild/status/pressable` 和 React 19 `useContext` 迁移。

这个顺序能最大限度保留当前 Auth 视觉、动效和 BFF 行为，同时逐步把组合边界理顺。

## 不建议做的事

- 不要为了套规则把 `disabled`、`invalid`、`aria-invalid` 全部改成 compound components；这些是正常语义状态。
- 不要一次性重写整个 Auth UI。当前 Figma 还原和 motion 细节已经有不少沉淀，应该通过 provider/panel/form pieces 渐进迁移。
- 不要把业务请求逻辑塞进 `src/components/ui`。状态 provider 和 submit actions 应落在 `src/features/auth`，共享视觉 pieces 才落在 `src/components/blocks` 或 `src/components/ui`。
