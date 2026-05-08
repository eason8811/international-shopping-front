# Auth 组件架构

## 1. 文档定位

本文档是 `Auth` 页面切片的专项 Figma-to-code 组件架构说明，用于指导后续将认证相关页面从 Figma 还原到当前前端仓库。

它补充并细化 [figma-design-system-rules.md](/home/eason/codes/international-shopping-front/doc/design-system/figma-design-system-rules.md)，重点回答以下问题：

- `Auth` 页面里哪些内容来自 `Components` 页，哪些内容来自 `Auth` 页自己的 `Auth Component` 区域
- `src/components/ui`、`src/components/shared`、`src/components/auth/blocks`、`src/features/auth` 分别承接什么
- 如何按 `vercel-composition-patterns` 把 Figma 中的大变体集翻译成明确的组件层级，而不是做一个 `mode` 巨组件

本轮产物是实现契约，不直接安装 shadcn 组件，也不创建真实页面代码。

## 2. Figma 事实范围

### 2.1 公共组件真值

`Components` 页当前实查到的公共组件如下：

- `LOGO And Copy`
- `NavBar`
  - `device=pc`
  - `device=pad`
  - `device=mobile`
- `Picture With Card`
- `Sidebar Active Button`
  - `type=activated`
  - `type=default`
- `Sidebar`
  - `device=default, inProfile=ture`
  - `device=mobile, inProfile=ture`
  - `device=mobile, inProfile=false`
- `Search Page`
- `Search History Item`
- `Button`
  - `variant=primary|secondary|link|naked|nacked-icon|nacked-icon-inline`
  - `status=default|hover|active|disabled|loading|success`
  - `size=large|default|small|mini`
- `Search Input`
  - `focus=false`
  - `focus=true`

这些组件中，与 Auth 首切片直接相关的公共依赖只有：

- `NavBar`
- `LOGO And Copy`
- `Picture With Card`
- `Button`

### 2.2 Auth 专项组件真值

`Auth` 页中的 `Auth Component` section 当前分为 3 个子区域：

- `Social Icons`
  - `google`
  - `tiktok`
  - `X`
- `components`
  - `Field Title`
  - `Account Input`
  - `Login Password Input`
  - `Register Password Input`
  - `Reset New Password Input`
  - `Register Password Confirm Input`
  - `Reset New Password Confirm Input`
  - `Email Input`
  - `Input OTP Item`
  - `Input OTP`
- `blocks`
  - `Auth Way Button`
  - `Auth Form`
  - `Hero Header Section`
  - `Code Resend`
  - `Footer`
  - `Glass`

### 2.3 Auth 页面骨架真值

desktop 流程页统一结构：

- `Background+Blur`
- `Background+Blur`
- `Main`
  - `NavBar`
  - `Frame 5`
    - `Container`
      - `Hero Header Section`
      - `Auth Way Button`
      - optional `Footer`
    - `Picture With Card`

mobile 流程页统一结构：

- `Background+Blur`
- `Background+Blur`
- `Main`
  - `NavBar`
  - `Container`
    - `Hero Header Section`
    - `Auth Way Button`
    - optional `Footer`

成功态页与普通页的主要差异：

- 仍保留 `Hero Header Section`
- 仍保留 `Auth Way Button`
- `Auth Way Button` 的 `Slot` 变为 success 内容
- `Footer` 在 success 页中被移除
- `Picture With Card` 仍只出现在 desktop

## 3. 目录与组件层级

### 3.1 `src/components/ui`

这里只放 shadcn CLI 基础件和与 Figma 对齐后的基础变体。Auth 首切片的第一批基线固定为：

- `button`
- `input`
- `input-otp`
- `separator`

后续实际实现前，先通过 shadcn CLI 拉取基础源文件，再做 Figma 样式对齐：

```bash
pnpm dlx shadcn@latest add button input input-otp separator
```

`ui` 层的职责：

- 保留 shadcn 基础可访问性与结构
- 扩展 Figma 所需的 `variant` / `size`
- 承接通用 focus、disabled、invalid、loading 状态

`ui` 层不承接：

- `login` / `register` / `forgot` 之类业务流程语义
- OAuth 提供商组合
- resend、success、panel 切换逻辑

### 3.2 `src/components/shared`

这里只放跨页面公共件。Auth 首切片当前需要的 shared 组件为：

- `Navbar`
- `LogoLockup`
  - 对应 Figma `LOGO And Copy`
- `PictureWithCard`

已在 `Components` 页出现、但暂不纳入 Auth 首切片的公共组件：

- `Sidebar`
- `SidebarActiveButton`
- `SearchPage`
- `SearchHistoryItem`

### 3.3 `src/components/auth/blocks`

这里放“由基础组件组合成、且可以直接用于 Auth 页面搭建”的派生块。首批清单固定为：

- `AuthHeroHeader`
- `AuthProviderButtons`
- `AuthDivider`
- `AuthFooterLink`
- `AuthCodeResend`
- `AuthAccountField`
- `AuthEmailField`
- `AuthPasswordField`
- `AuthOtpField`
- `AuthFormFrame`
- `AuthSuccessPanel`

这些组件是 Auth 专项 block，不进入通用 `src/components/blocks`。

以下 Figma 节点不提升为公开 block：

- `Glass`
  - 作为 `AuthScreenLayout` 内部的装饰层处理
- `Input OTP Item`
  - 作为 `AuthOtpField` 的内部组成，不单独暴露

### 3.4 `src/features/auth`

这里只放认证流程编排、BFF 调用和状态管理，不承接通用视觉结构。

当前已存在的接口能力可以直接支撑首批面板流转：

- `loginUser`
- `registerUser`
- `verifyRegistrationEmail`
- `resendActivationEmail`
- `getActivationEmailStatus`
- `requestPasswordReset`
- `resetPassword`
- `issueUserCsrfToken`
- `refreshUserSession`
- `logoutUser`

`features/auth` 最终应承接：

- `AuthFlowProvider`
- flow 切换
- submit / resend / success 状态
- 与 `src/entities/user` 的数据映射协作

## 4. 组合模式与公开 API

### 4.1 不允许的 API 形态

禁止实现为单个大组件：

```tsx
<AuthForm
  mode="login"
  success
  showFooter
  showSocial
  isForgot
  isReset
/>
```

也禁止把 Figma 设计态条件直接公开为布尔 prop：

- `focus`
- `invalid`
- `showPassword`
- `isRegister`
- `isForgot`

这些都应由内部状态或显式组件变体驱动。

### 4.2 推荐的组件层级

推荐使用“provider + shell + explicit panel”的组合方式：

```tsx
<AuthFlowProvider flow="login-email">
  <AuthScreenLayout>
    <AuthScreenLayout.Navbar>
      <Navbar />
    </AuthScreenLayout.Navbar>
    <AuthScreenLayout.Main>
      <AuthScreenLayout.Content>
        <AuthContent>
          <AuthContent.Hero>
            <AuthHeroHeader />
          </AuthContent.Hero>
          <AuthContent.Section>
            <AuthProviderSection locale={locale} returnTo={returnTo}>
              <AuthProviderSection.Providers />
              <AuthProviderSection.Divider />
              <AuthProviderSection.Form>
                <LoginEmailPanel />
              </AuthProviderSection.Form>
            </AuthProviderSection>
          </AuthContent.Section>
          <AuthContent.Footer>
            <AuthFooterLink />
          </AuthContent.Footer>
        </AuthContent>
      </AuthScreenLayout.Content>
      <AuthScreenLayout.Picture>
        <PictureWithCard />
      </AuthScreenLayout.Picture>
    </AuthScreenLayout.Main>
  </AuthScreenLayout>
</AuthFlowProvider>
```

其中：

- `AuthScreenLayout` 负责 desktop/mobile 框架差异，并以 compound components 显式标记 `Navbar / Main / Content / Picture`
- `AuthContent` 固定承接 `HeroHeader + AuthProviderSection + optional Footer`，通过显式子组件表达结构位
- `AuthProviderSection` 对应 Figma `Auth Way Button`，自身再拆为 `OAuth Buttons + Divider + Slot`，并通过共享上下文把 locale / returnTo 注入给子组件
- `AuthFormFrame` 是 Slot 中的通用容器
- `LoginEmailPanel`、`RegisterEmailPanel` 等显式面板只组合自己需要的字段和动作

### 4.3 共享上下文接口

后续实现统一收敛到一个共享上下文接口：

```ts
export interface AuthFlowContextValue {
  state: {
    fields: Record<string, string>
    errors: Record<string, string | null>
    pending: boolean
    resend: {
      status: "idle" | "countdown" | "success"
      remainingSeconds: number
    }
    success: {
      visible: boolean
      title: string | null
      description: string | null
    }
  }
  actions: {
    update: (name: string, value: string) => void
    submit: () => Promise<void>
    resend: () => Promise<void>
    togglePasswordVisibility: (field: string) => void
    switchFlow: (flow: AuthFlow) => void
  }
  meta: {
    flow: AuthFlow
    device: "desktop" | "mobile"
    refs: Record<string, unknown>
  }
}
```

约束如下：

- `state` 只描述当前 UI 所需状态
- `actions` 只暴露组合件真正要调用的动作
- `meta` 只放流转上下文、设备信息和 ref
- 任何 block 只消费这个接口，不直接耦合特定 hook 实现

## 5. 显式面板与流程映射

### 5.1 页面级显式面板

后续代码层统一暴露以下显式面板：

- `LoginPanel`
- `LoginEmailPanel`
- `ForgotPasswordPanel`
- `ResetPasswordPanel`
- `ResetSuccessPanel`
- `RegisterPanel`
- `RegisterEmailPanel`
- `VerifyEmailPanel`
- `RegisterSuccessPanel`

### 5.2 Figma `Auth Form` 到代码面板的映射

Figma `Auth Form` 组件集只有 7 个变体，但代码侧要区分“页面入口态”和“表单态”：

- `type=login` -> `LoginEmailPanel`
- `type=register` -> `RegisterEmailPanel`
- `type=forget` -> `ForgotPasswordPanel`
- `type=reset` -> `ResetPasswordPanel`
- `type=verify` -> `VerifyEmailPanel`
- `type=register-success` -> `RegisterSuccessPanel`
- `type=reset-success` -> `ResetSuccessPanel`

以下两个页面级入口态不是 `Auth Form` 变体，而是 `AuthProviderSection` 的 `Slot` 内容：

- `LoginPanel`
  - `Slot` 渲染 `Continue with Email` 次按钮
- `RegisterPanel`
  - `Slot` 渲染 `Continue with Email` 次按钮

### 5.3 Hero 与 Footer 家族映射

Figma 当前只提供 3 个 `Hero Header Section` 变体：

- `type=login`
- `type=register`
- `type=forgot`

Figma 当前只提供 3 个 `Footer` 变体：

- `type=login`
- `type=register`
- `type=forget`

代码侧统一做命名归一：

- `login` -> `login`
- `register` -> `register`
- `forgot` / `forget` -> `recovery`

`ResetPasswordPanel` 与 `ResetSuccessPanel` 均归入 `recovery` 家族，不新增 `isReset` 之类布尔 prop。

## 6. Figma 到代码的映射规则

### 6.1 命名归一

文档与代码统一使用以下映射，不直接沿用 Figma 原名：

- `Auth Way Button` -> `AuthProviderSection`
- `type=forget` -> `ForgotPassword`
- `nacked-icon` -> `NakedIcon`
- `LOGO And Copy` -> `LogoLockup`
- `Picture With Card` -> `PictureWithCard`

### 6.2 Button

Figma `Button` 组件集映射到 `src/components/ui/button.tsx`。

实现要求：

- 保留 shadcn `Button` 作为基础入口
- 通过 `variant` / `size` 扩展 Figma 所需样式
- `loading` / `success` 走组合与状态渲染，不新增 `isLoading` 布尔 prop

Auth 首切片最先消费的按钮家族：

- `primary / large`
- `secondary / large`
- `link / small|mini`
- `naked / small`
- `nacked-icon-inline / small`

### 6.3 输入家族

输入相关组件按“少量代码组件 + 内部状态渲染”收敛：

- `Account Input` -> `AuthAccountField`
- `Email Input` -> `AuthEmailField`
- `Login Password Input`
- `Register Password Input`
- `Reset New Password Input`
- `Register Password Confirm Input`
- `Reset New Password Confirm Input`
  -> 统一收敛为 `AuthPasswordField`
- `Input OTP` + `Input OTP Item` -> `AuthOtpField`

约束如下：

- `focus=true`、`invalid=true`、`readonly=true` 不成为公开组件 API
- 这些状态统一由真实交互状态推导
- `Field Title` 不做单独业务组件，作为字段内部结构的一部分
- `Input OTP Item` 只作为 `AuthOtpField` 内部拼装单元存在，不单独暴露到目录层

### 6.4 AuthProviderSection

`AuthProviderSection` 是 Auth 首切片里最重要的复合块，对应 Figma `Auth Way Button`。

固定内部结构：

- `AuthProviderButtons`
  - Google / TikTok / X
- `AuthDivider`
  - 默认文案 `OR`
- `Slot`
  - `Continue with Email` 按钮
  - 或一个显式面板
  - 或一个 success panel

代码侧不暴露：

- `showSocial`
- `showDivider`
- `showFooter`

而是通过显式面板组合来表达页面差异。

`Social Icons` 中的 `google`、`tiktok`、`X` 不单独提升为业务 block，而是作为 `AuthProviderButtons` 内部的资产或图标实现细节承接。

### 6.5 AuthSuccessPanel

success 态统一收敛到 `AuthSuccessPanel`：

- `RegisterSuccessPanel`
- `ResetSuccessPanel`

差异只体现在文案和后续跳转行为，不新增单独的大容器组件。

## 7. 响应式实现约束

desktop 与 mobile 的差异只允许存在于以下层：

- `Navbar` 变体选择
- `PictureWithCard` 是否出现
- 容器宽度、内边距、块间距

不允许：

- 发明第三套布局骨架
- 为 mobile 再做一份不同的 Auth 组件体系
- 在 mobile 上把 block 拆成完全不同的 API

具体约束：

- desktop 使用 `NavBar device=pc`，保留 `PictureWithCard`
- mobile 使用 `NavBar device=mobile`，移除 `PictureWithCard`
- `AuthContent` 的结构与 flow 切换规则在两个端保持一致

## 8. 实施顺序

后续真正编码时，按以下顺序推进：

1. 通过 shadcn CLI 添加 `button`、`input`、`input-otp`、`separator`
2. 先实现 `src/components/ui` 的 Figma 变体扩展
3. 实现 `src/components/shared` 的 `Navbar`、`LogoLockup`、`PictureWithCard`
4. 实现 `src/components/auth/blocks`
5. 实现 `AuthFlowProvider` 和显式面板
6. 最后接入 `src/features/auth/api.ts` 现有 BFF 流程

## 9. 验收标准

- 文档中的公共组件清单与 `Components` 页实查结果一致
- 文档中的 Auth 专项清单与 `Auth Component` section 实查结果一致
- `src/components/ui`、`src/components/shared`、`src/components/auth/blocks`、`src/features/auth` 边界清晰且互不冲突
- API 设计不存在单个 `mode` 巨组件
- 每条认证流都有显式面板名
- 响应式差异仅存在于 `Navbar`、`PictureWithCard`、容器尺寸与间距
