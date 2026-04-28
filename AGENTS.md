# AGENTS.md

## 适用范围

本文件适用于当前前端仓库 `international-shopping-front` 的全部目录。后续如某个子目录存在更具体的 `AGENTS.md`，以更靠近被修改文件的说明为准。

本仓库是跨境电商平台前端，核心形态是 Next.js App Router + BFF + Feature Slice。所有实现都应优先服务于前端体验、BFF 协议适配和设计系统一致性，不在本仓库中扩散后端内部实现细节。

## 事实来源与优先级

开始修改前先检查当前 checkout，不要复用旧运行中的目录状态或过期假设。当前仓库结构、配置和测试结果永远优先于记忆或历史结论。

项目级设计与契约优先级如下：

1. `doc/总体前端设计.md`：前端架构、BFF、业务/API 切片和交付边界的总纲。
2. `doc/design-system/figma-design-system-rules.md`：Figma-to-code、组件抽象、设计 token 和视觉实现规则。
3. `doc/*/international-shopping-*-api.yaml` 与 `doc/international-shopping.sql`：后端 API、DDL 和领域契约参考。
4. 当前源码实现：实际目录、类型、组件 API、BFF helper 和运行脚本。

后端仓库不是本文件的约束范围。需要对齐后端行为时，以本仓库内的 API YAML、SQL 和已实现 BFF 适配为前端侧依据；若文档与实际接口冲突，应先核实再改。

## 技术栈与命令

- 包管理器固定使用 `pnpm`。不要切换到 npm、yarn 或 bun。
- 主要栈：Next.js App Router、React 19、TypeScript、next-intl、Tailwind CSS v4、shadcn/ui、Radix、motion/react、Vitest。
- 常用命令：
  - `pnpm dev`：启动开发服务。
  - `pnpm lint`：ESLint 检查。
  - `pnpm test`：Vitest 测试。
  - `pnpm build`：Next.js 生产构建。
- 常用环境变量：
  - `BACKEND_ORIGIN`：后端服务 origin，默认本地后端。
  - `BACKEND_API_PREFIX`：后端 API 前缀，默认 `/api/v1`。
  - `APP_ORIGIN` 或 `NEXT_PUBLIC_APP_ORIGIN`：服务端发起同域 BFF 请求时的 origin 兜底。

文档-only 变更通常不需要跑完整 lint/test/build。TS、TSX、CSS 或配置变更应按影响面运行至少 `pnpm lint`，并在触及业务流或共享组件时补充 `pnpm test`、`pnpm build`。

## 目录职责

- `src/app/[locale]`：国际化页面路由。所有用户可见页面默认走 locale 前缀。
- `src/app/api/bff`：运行时 BFF Route Handlers，负责转发和协议适配。
- `src/app/bff`：BFF 相关页面 helper 或 server component 预留区，不是 runtime route handler 的落点。
- `src/features/*`：业务切片，放业务流程、页面内行为编排、feature-level API 入口和类型。
- `src/entities/*`：跨 feature 复用的领域实体模型、mapper 和实体级 helper。
- `src/components/ui`：基础 UI primitives 和原子组件。
- `src/components/blocks`：可跨页面复用的复合区块。
- `src/components/shared`：站点级或布局级共享组件。
- `src/lib/api`：前端 BFF client、后端 fetch、Result 解包、错误、CSRF、幂等键等基础能力。
- `src/i18n`：next-intl 路由、请求配置、导航 helper 和消息文件。

保持分层边界清晰：通用视觉规范不要放入 feature，业务流程不要塞进 `components/ui`，页面组件不要绕过 BFF 直接调用后端。

## BFF 与 API 约定

页面、组件和 feature 侧统一访问 `/api/bff/**`，优先复用 `src/lib/api/bff-client.ts` 中的 `requestBff`。不要在浏览器端直接请求后端 API origin。

BFF 层负责：

- Cookie JWT 透传与登录态请求处理。
- CSRF 双提交 token 读取、引导和 `X-CSRF-Token` 注入。
- 声明幂等的写请求注入 `Idempotency-Key`。
- 后端 `Result<T>` envelope 的成功/失败归一化。
- 错误模型、HTTP 状态、业务码、`traceId` 和 `Set-Cookie` 处理。

新增或修改 BFF route 时，保持路径语义贴近前端使用场景，同时在实现内部映射到后端 API 文档定义的路径。写接口默认按当前 helper 规则处理 CSRF；需要幂等键时显式开启对应选项。

## i18n 约定

当前 active locale 以 `src/i18n/routing.ts` 为准：`en-US`、`es-ES`，默认 `en-US`。仓库中可能存在额外消息文件，但路由支持范围必须以 routing 配置为准。

新增用户可见文案时：

- 不要把长期文案硬编码在页面或组件中。
- 同步更新 active locale 对应的 message 文件。
- 路由页面放在 `src/app/[locale]` 下，避免新增无 locale 前缀的用户页面。
- 只在确有产品要求时新增 locale；新增时同步 routing、messages、导航和测试。

## UI、Figma 与设计系统

Figma 和 `doc/design-system/figma-design-system-rules.md` 是视觉实现的主要来源。做 Figma-to-code 时，先确认目标页面、组件节点和响应式形态，再改代码。

实现规则：

- 设计稿要求一比一还原时，以 Figma 为准。
- 若 Figma 与现有 `components/ui` 或 `components/blocks` 不一致，优先更新共享 primitive/block，再让页面复用它。
- 不要为单个页面复制一套与 shared 组件重复的样式或状态逻辑。
- 基础控件优先放在 `src/components/ui`，跨页面复合结构放在 `src/components/blocks`，站点级布局部件放在 `src/components/shared`。
- 通用图标优先使用既有图标体系和 `lucide-react`；只有 Figma 明确要求特殊资产时再引入专用资产。
- 动效、颜色、字体、状态色等应优先使用共享 token 或 shared motion helper，避免局部散落魔法值。

Auth 相关页面当前大量复用 `src/components/blocks` 与 `src/components/ui`。继续修改 Auth UI 时，应先检查 shared primitive、block 和 `auth-motion.ts`，不要只在 `auth-page-client.tsx` 做局部补丁。

## Next.js 与 React 约定

- 默认采用 Server Components；只有需要浏览器 API、状态、事件、动画或表单交互时才加 `"use client"`。
- App Router 页面和 layout 保持职责清晰：数据获取、metadata、locale provider、全局 shell 不要互相混杂。
- 服务端请求优先走同域 BFF；登录态和交易态请求默认避免缓存。
- 不随意移除根布局中的全局 provider、字体变量或全局 `Toaster`。这类变更需要确认全站影响。
- 共享组件 API 应保持语义化，避免布尔参数堆叠；已有 variant/status API 能表达时优先复用。

## 工作方式

- 修改前先用 `rg`、`rg --files`、`git status --short` 等命令确认真实上下文。
- 保持变更范围小，解决用户提出的问题，不顺手重构无关文件。
- 不覆盖用户未提交改动；发现相关文件已有他人改动时，先读懂并在其基础上修改。
- 不使用破坏性 git 命令，除非用户明确要求。
- 新增代码优先沿用项目现有 helper、类型和组件模式。
- 对外说明结果时，写清改了什么、验证了什么、哪些检查因 docs-only 或范围原因未运行。

## 提交前自检

完成后至少检查：

- 目标文件是否存在且内容与当前仓库结构一致。
- `git diff -- <path>` 是否只包含预期改动。
- 代码变更是否通过必要的 lint/test/build。
- 文档、类型、i18n message、API contract 是否随功能变更同步更新。

