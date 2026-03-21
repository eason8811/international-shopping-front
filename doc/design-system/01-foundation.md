# 01 Foundation

## 1. Purpose

This document defines the foundational layer of the design system for the cross-border commerce frontend. It is the canonical source for typography, color, radius, spacing, motion, shadow, and theme primitives.

The system is built around the creative north star **Editorial Precision**. It moves away from generic SaaS aesthetics and toward a curated, premium, high-trust interface language shaped by whitespace, tonal layering, refined typography, and deliberate restraint.

## 2. Creative North Star

### 2.1 Editorial Precision
The interface should feel curated rather than assembled. Visual clarity comes from hierarchy, spacing, and tone rather than from hard separators, loud color, or dense chrome.

### 2.2 Soft Minimalism
The absence of clutter is intentional. Empty space is functional and should help users scan, compare, and trust.

### 2.3 Tonal Layering
Hierarchy is created primarily through surface tiers rather than 1px structural borders. Surfaces should feel like stacked sheets rather than framed boxes.

### 2.4 Curated Asymmetry
The layout may break rigid symmetry in hero and section composition to create editorial character, but asymmetry must remain controlled and purposeful.

### 2.5 Functional Restraint
Color is reserved for emphasis and feedback. Product and user-facing screens should remain predominantly neutral; colorful tokens are retained for admin analytics and dashboards.

## 3. Typography Foundation

### 3.1 Font Families

```css
--font-sans: "Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-serif: "Newsreader", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
```

### 3.2 Role Mapping

| Role | Family | Usage |
|---|---|---|
| Display / Editorial Headline | Newsreader | Hero copy, mastheads, brand storytelling, premium section intros |
| Title / Body / Label | Manrope | UI titles, supporting text, forms, cards, metadata, navigation |
| Data / Precision | JetBrains Mono | Prices, SKU, tracking code, order numbers, logistics metadata |

### 3.3 Type Scale

| Token | Size | Line Height | Family | Weight | Tracking | Usage |
|---|---:|---:|---|---:|---:|---|
| `display-xl` | 4rem | 1.0 | Serif | 500 | -0.03em | Large hero moments |
| `display-lg` | 3.5rem | 1.0 | Serif | 500 | -0.02em | Masthead titles |
| `headline-lg` | 2rem | 1.1 | Serif | 500 | -0.01em | Section-leading editorial headers |
| `headline-md` | 1.5rem | 1.2 | Sans | 600 | -0.01em | Primary content section titles |
| `title-lg` | 1.125rem | 1.4 | Sans | 600 | 0 | Card titles, grouped block titles |
| `title-md` | 1rem | 1.4 | Sans | 600 | 0 | Secondary titles |
| `body-lg` | 1rem | 1.7 | Sans | 400 | 0 | Descriptive body copy |
| `body-md` | 0.875rem | 1.7 | Sans | 400 | 0 | Dense supporting body copy |
| `label-md` | 0.75rem | 1.4 | Sans | 500 | 0.04em | Metadata, caps labels, UI labels |
| `data-sm` | 0.75rem | 1.5 | Mono | 500 | 0 | Codes, prices, tracking strings |

### 3.4 Typography Rules

- Use serif sparingly and intentionally. It is a brand amplifier, not a default text font.
- Labels should prefer spacing and case over heavy weight.
- Mono should be used for precision, not as a visual gimmick.
- Multi-language readability takes precedence over ornamental typesetting.

## 4. Color Foundation

### 4.1 Canonical Token Strategy

The design system uses **canonical semantic tokens** prefixed with `--ds-` and keeps the existing shadcn-compatible tokens as aliases. The semantic layer is the source of truth; alias tokens exist for compatibility.

### 4.2 User-Facing Neutral Palette

#### Light Theme

| Token | Value | Purpose |
|---|---|---|
| `--ds-surface` | `oklch(0.9824 0.0013 286.3757)` | Page background |
| `--ds-surface-container-lowest` | `oklch(1 0 0)` | Top interactive cards |
| `--ds-surface-container-low` | `oklch(0.9659 0.0025 228.7842)` | Secondary surfaces |
| `--ds-surface-container` | `oklch(0.9480 0.0040 232)` | Nested backgrounds |
| `--ds-surface-container-high` | `oklch(0.9300 0.0060 234)` | Hover and raised states |
| `--ds-surface-container-highest` | `oklch(0.9124 0.0085 236.5687)` | Active emphasis layer |
| `--ds-on-surface` | `oklch(0.3165 0.0099 229.1948)` | Standard readable text |
| `--ds-on-surface-strong` | `oklch(0.1619 0.0039 229.0847)` | Primary text / dark emphasis |
| `--ds-on-surface-muted` | `oklch(0.5560 0 0)` | Secondary text |
| `--ds-on-surface-subtle` | `oklch(0.7080 0 0)` | Placeholder / tertiary text |
| `--ds-primary` | `oklch(0.1619 0.0039 229.0847)` | Primary CTA fill / strong emphasis |
| `--ds-primary-foreground` | `oklch(1 0 0)` | Text on primary |
| `--ds-primary-dim` | `oklch(0.4819 0 89.8756)` | Editorial dark accent / softer premium dark |
| `--ds-accent-soft` | `oklch(0.9659 0.0025 228.7842)` | Soft emphasis surface |
| `--ds-accent-soft-foreground` | `oklch(0.1619 0.0039 229.0847)` | Text on soft accent |
| `--ds-destructive` | `oklch(0.5770 0.2450 27.3250)` | Destructive state |
| `--ds-destructive-foreground` | `oklch(1 0 0)` | Text on destructive |

#### Dark Theme

| Token | Value | Purpose |
|---|---|---|
| `--ds-surface` | `oklch(0.1450 0 0)` | Page background |
| `--ds-surface-container-lowest` | `oklch(0.2050 0 0)` | Top interactive cards |
| `--ds-surface-container-low` | `oklch(0.2690 0 0)` | Secondary surfaces |
| `--ds-surface-container` | `oklch(0.3000 0 0)` | Nested backgrounds |
| `--ds-surface-container-high` | `oklch(0.3250 0 0)` | Hover and raised states |
| `--ds-surface-container-highest` | `oklch(0.3710 0 0)` | Active emphasis layer |
| `--ds-on-surface` | `oklch(0.9120 0 0)` | Standard readable text |
| `--ds-on-surface-strong` | `oklch(0.9850 0 0)` | Primary text / bright emphasis |
| `--ds-on-surface-muted` | `oklch(0.7080 0 0)` | Secondary text |
| `--ds-on-surface-subtle` | `oklch(0.5560 0 0)` | Placeholder / tertiary text |
| `--ds-primary` | `oklch(0.9220 0 0)` | Primary CTA fill / strong emphasis |
| `--ds-primary-foreground` | `oklch(0.2050 0 0)` | Text on primary |
| `--ds-primary-dim` | `oklch(0.7080 0 0)` | Editorial light accent |
| `--ds-accent-soft` | `oklch(0.2690 0 0)` | Soft emphasis surface |
| `--ds-accent-soft-foreground` | `oklch(0.9850 0 0)` | Text on soft accent |
| `--ds-destructive` | `oklch(0.7040 0.1910 22.2160)` | Destructive state |
| `--ds-destructive-foreground` | `oklch(0.9850 0 0)` | Text on destructive |

### 4.3 State Tokens

| Token | Purpose |
|---|---|
| `--ds-success`, `--ds-success-soft`, `--ds-success-foreground` | Paid, delivered, completed, successful |
| `--ds-warning`, `--ds-warning-soft`, `--ds-warning-foreground` | Pending, delayed, action required |
| `--ds-destructive`, `--ds-destructive-soft`, `--ds-destructive-foreground` | Error, removed, cancel, destructive |

### 4.4 Ghost Border Tokens

These are the only border-like tokens allowed as the default fallback when a visible edge is needed.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--ds-ghost-border` | `oklch(0.3165 0.0099 229.1948 / 0.14)` | `oklch(0.9850 0 0 / 0.12)` | Default subtle edge |
| `--ds-ghost-border-strong` | `oklch(0.3165 0.0099 229.1948 / 0.20)` | `oklch(0.9850 0 0 / 0.18)` | Focus or accessibility edge |

### 4.5 Glass Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--ds-glass-fill` | `oklch(1 0 0 / 0.78)` | `oklch(0.2050 0 0 / 0.72)` | Floating overlays |
| `--ds-glass-fill-strong` | `oklch(1 0 0 / 0.86)` | `oklch(0.2050 0 0 / 0.82)` | Popovers / dialog surfaces |
| `--ds-glass-border` | `oklch(0.3165 0.0099 229.1948 / 0.10)` | `oklch(0.9850 0 0 / 0.10)` | Light edge on glass |
| `--ds-glass-blur-sm` | `12px` | `12px` | Small glass blur |
| `--ds-glass-blur-lg` | `20px` | `20px` | Large glass blur |

### 4.6 Gradient Tokens

| Token | Purpose |
|---|---|
| `--ds-gradient-cta` | Primary CTA gradient with editorial polish |
| `--ds-gradient-ink-soft` | Soft tonal overlay for banners and imagery |

### 4.7 Admin Extension Tokens

Admin screens retain colorful tokens for charts and more explicit sidebars.

| Token Group | Purpose |
|---|---|
| `--ds-chart-1` to `--ds-chart-5` | Analytics charts |
| `--ds-sidebar-*` | Admin navigation surfaces and emphasis |

## 5. Radius Foundation

### 5.1 Radius Scale

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 0.5rem | Small utility surfaces |
| `radius-md` | 0.625rem | Inputs, buttons |
| `radius-lg` | 0.75rem | Standard cards |
| `radius-xl` | 1rem | Editorial blocks, hero media |
| `radius-full` | 9999px | Pills and badges |

### 5.2 Rule
12px remains the main base radius across the system. Larger radii are for emphasis, not default inflation.

## 6. Spacing Foundation

Spacing follows Tailwind's scale.

| Tailwind Token | Value | Typical Use |
|---|---|---|
| `4` | 1rem | Minimum internal padding |
| `6` | 1.5rem | Standard card padding |
| `8` | 2rem | Large card padding |
| `12` | 3rem | Major section gap |
| `16` | 4rem | Hero / masthead spacing |

### Spacing Rule
User-facing screens default to a relaxed density. Dense layouts are reserved for admin screens, tables, and data-heavy tools.

## 7. Shadow Foundation

### 7.1 Principle
Tonal layering is the primary depth mechanism. Shadows are secondary and reserved for floating or elevated elements.

### 7.2 Ambient Shadow Tokens

| Token | Suggested Use |
|---|---|
| `--shadow-ambient-sm` | Small popovers, badges, small floating elements |
| `--shadow-ambient-md` | Dialogs, elevated cards, drawers |
| `--shadow-ambient-lg` | Large overlays and hero floating surfaces |

### 7.3 Rule
Avoid generic gray drop shadows. Shadows should feel diffused, light, and atmospheric.

## 8. Motion Foundation

| Token | Value |
|---|---|
| `--duration-fast` | `160ms` |
| `--duration-base` | `220ms` |
| `--duration-slow` | `320ms` |
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` |

### Motion Rule
Motion should feel polished, not theatrical. Hover states should be subtle. Layout reflow should be smooth. Modals and sheets may fade and slide, but should not bounce aggressively.

## 9. Theme Compatibility Strategy

The system keeps compatibility aliases for shadcn/Tailwind semantic tokens:

- `background`
- `foreground`
- `card`
- `popover`
- `primary`
- `secondary`
- `muted`
- `accent`
- `destructive`
- `border`
- `input`
- `ring`

These aliases point to the canonical `--ds-*` layer. All future design decisions should be made against the canonical semantic tokens first.

## 10. Implementation Note

This layer defines the token system only. It does **not** load web fonts automatically. In Next.js, `Newsreader`, `Manrope`, and `JetBrains Mono` should be loaded with `next/font` and applied to the root layout so the CSS variables resolve to real font faces.
