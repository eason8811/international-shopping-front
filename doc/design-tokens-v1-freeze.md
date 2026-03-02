# Design Token v1 正式冻结记录

> 适用仓库：`/home/codex/codes/international-shopping-front`  
> 冻结版本：v1.0  
> 冻结日期：2026-03-02  
> 冻结状态：已生效（文档 + 代码基线）

## 1. 冻结目标与范围

本次冻结用于落实 `总体前端设计.md` 中 UX-M0 里程碑，目标是避免中后期风格返工。  
冻结范围如下：

- Typography（字体体系）
- Color（语义色体系）
- Spacing & Radius（间距与圆角）
- Shadow / Border（基础阴影与描边）
- Motion baseline（动效基线规则，参数先文档冻结）

## 2. 冻结事实源（Source of Truth）

- 主题事实源：`doc/design-tokens-v1.tweakcn.css`（来自 tweakcn 预览导出）
- 运行时基线：`src/app/globals.css`（已与事实源对齐）
- 项目引用入口：`doc/总体前端设计.md` 第 9.3 节 UX-M0

说明：
- 今后若调整 token，先在 tweakcn 完成评审并导出，再同步到 `globals.css`。
- 不允许直接在页面组件里绕过 token 写“临时品牌色/临时圆角/临时间距”。

## 3. 视觉方向（v1 冻结）

- 风格：现代简洁、交易系统友好、低装饰噪声。
- 当前色彩倾向：中性灰阶基线（低饱和），优先保障信息层级和商品图可读性。
- 交互气质：轻量反馈、少干扰、可预测。

## 4. Token 冻结清单

### 4.1 Typography

- `--font-sans`: `Manrope` + system fallback
- `--font-serif`: `Cormorant Garamond` + serif fallback
- `--font-mono`: `JetBrains Mono` + monospace fallback
- `--tracking-normal`: `0em`

规则：
- 默认页面使用 `sans`，单号/金额/技术字段使用 `mono`。
- `serif` 仅用于少量品牌表达区块，不进入高频操作页面主流程。

### 4.2 Color（语义）

已冻结语义变量：
- `background / foreground`
- `card / card-foreground`
- `popover / popover-foreground`
- `primary / primary-foreground`
- `secondary / secondary-foreground`
- `muted / muted-foreground`
- `accent / accent-foreground`
- `destructive / destructive-foreground`
- `border / input / ring`
- `chart-1..5`
- `sidebar-*`

规则：
- 状态语义保持稳定：危险态统一使用 `destructive` 体系。
- 不新增高饱和装饰色，避免与商品图竞争视觉主位。

### 4.3 Spacing & Radius

- `--spacing: 0.25rem`（4px 基础单位）
- 间距刻度：`4 / 8 / 12 / 16 / 24 / 32 / 40 / 48`
- `--radius: 0.75rem`
- 半径映射：`sm/md/lg/xl` 由 `--radius` 推导

规则：
- 禁止引入离散值（如 14px、18px）破坏重复性。
- 同类组件内部间距必须重复一致。

### 4.4 Shadow / Border

已冻结变量：
- `--shadow-x / --shadow-y / --shadow-blur / --shadow-spread`
- `--shadow-opacity / --shadow-color`
- `--shadow-2xs..2xl`
- `--border`（描边基色）

规则：
- 阴影仅用于层级提示，不做重装饰。
- 描边优先于背景块叠加，减少视觉噪声。

### 4.5 Motion（基线规则）

v1 先冻结规则，不强制冻结变量命名：
- 仅用于层级变化和状态变化，不做装饰性大动效。
- 默认采用 `fade` 或 `translate+fade` 小幅过渡。
- 保持内容区稳定，避免页面主体“漂浮”。

## 5. 工程落实状态

已完成：
- `globals.css` 已切换到 v1 token 基线。
- 颜色、字体、圆角、阴影均通过 CSS variables 暴露给 Tailwind/shadcn。

待后续（不影响本次冻结生效）：
- 需要时可在 `layout.tsx` 使用 `next/font` 精确托管 `Manrope/Cormorant/JetBrains Mono` 下载策略。

## 6. 变更门禁（冻结后）

允许变更的条件（满足其一）：
- 可用性 P0/P1 问题需要通过 token 层修复。
- 对比度/可访问性不达标（含焦点态可见性）。
- 跨页面一致性明显失衡，且组件层修复无法收敛。

每次 token 变更必须同步提交：
- 变更原因（问题页面 + 复现方式）
- 影响面（组件/页面列表）
- 回归清单（Light/Dark、关键交易路径、管理端高密度页）
