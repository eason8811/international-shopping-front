# 02 Semantic Rules

## 1. Purpose

This document defines how the foundation layer should be interpreted across layouts, user journeys, and interaction states. It is the usage contract between tokens and actual interface design.

## 2. Surface Semantics

### 2.1 Hierarchy

| Semantic Surface | Token | Use |
|---|---|---|
| Page Base | `surface` | Root page background |
| Section Base | `surface-container-low` | Section-level grouping blocks |
| Primary Card | `surface-container-lowest` | Top cards, content blocks, main panels |
| Nested Block | `surface-container` | Internal grouping inside cards |
| Raised / Hover Block | `surface-container-high` | Hover, soft lift, secondary emphasis |
| Active / Pressed Layer | `surface-container-highest` | Active state, strong tonal emphasis |

### 2.2 Rules
- Prefer tonal contrast over structural borders.
- Major grouping should be readable at a glance without relying on lines.
- Nested layers should feel like stacked material, not like outlined widgets.

## 3. The No-Line Rule

### 3.1 Default Rule
Designers and developers must not use 1px solid borders as the default means of separating major UI regions.

### 3.2 Preferred Alternatives
Use one or more of the following:
- tonal surface changes
- spacing and rhythm
- content alignment
- image / type contrast
- edge positioning and grouping

### 3.3 Exceptions
`Ghost Border` may be used when:
- accessibility requires a visible edge
- an input or control needs focus clarity
- an element is interactive but would otherwise be visually ambiguous
- a dense data region needs minimal structural assistance

## 4. Text Semantics

### 4.1 On-Surface Hierarchy

| Semantic Role | Token | Typical Use |
|---|---|---|
| Strong | `on-surface-strong` | headings, strong emphasis, primary values |
| Default | `on-surface` | body copy, standard UI text |
| Muted | `on-surface-muted` | secondary copy, descriptions |
| Subtle | `on-surface-subtle` | placeholder, tertiary labels |

### 4.2 Rules
- Body text must never use pure black.
- Muted text must remain legible and not collapse into decorative gray.
- Serif should be reserved for editorial hierarchy, not dense task flows.

## 5. Density Rules

### 5.1 Density Modes

| Mode | Typical Screens | Characteristics |
|---|---|---|
| Airy | Hero, campaigns, onboarding, brand stories | large whitespace, oversized type, minimal chrome |
| Balanced | Profile, address book, order history, product detail | moderate spacing, high clarity, editorial restraint |
| Compact | Admin tables, dashboards, logs, power-user utilities | tighter spacing, increased information density |

### 5.2 Default
User-facing product screens default to **Balanced**. Marketing-led surfaces may move to **Airy**. Admin analytics may move to **Compact**.

## 6. Asymmetry Rules

### 6.1 Allowed Desktop Ratios
Use asymmetry intentionally, with stable ratio families:
- `7 / 5`
- `8 / 4`
- `60 / 40`
- `5 / 4 / 3`

### 6.2 Allowed Use Cases
- mastheads
- profile hero areas
- featured collection headers
- product listing intros
- editorial sidebars

### 6.3 Disallowed Use Cases
Do not use asymmetry to:
- break form field grids without reason
- create accidental misalignment
- reduce scannability in checkout or order-critical flows

### 6.4 Mobile Rule
On mobile, asymmetry collapses to clean single-column flow. Intentional imbalance should not survive as awkward stacking.

## 7. Whitespace Rules

### 7.1 Minimum Internal Padding
Every container should preserve at least `spacing-4` (1rem) from its content edge.

### 7.2 Section Rhythm
Use `spacing-8` and `spacing-12` as the default major section rhythm.

### 7.3 Editorial Breathing Room
If a screen feels crowded, increase spacing before adding visual dividers.

## 8. Editorial Imagery Rules

### 8.1 Use Cases
Editorial-scale imagery is appropriate for:
- mastheads
- campaign and collection banners
- brand and category storytelling
- high-confidence welcome or account hero areas

### 8.2 Rules
- imagery may bleed to top edges when paired with radius-aware containers
- imagery may overlap text only when readability remains excellent
- functional controls must not compete with hero imagery
- do not use decorative imagery in high-conversion zones if it harms clarity

## 9. Masthead Rules

A masthead is a reusable structure for premium entry points.

### 9.1 Required Anatomy
- one serif display headline
- one sans supporting paragraph
- one small mono label or metadata cue
- one primary CTA
- optional secondary CTA
- one editorial-scale image

### 9.2 Interaction Rule
The masthead should feel premium but must still convert. CTA clarity takes priority over decorative layering.

## 10. Interaction Rules

### 10.1 Hover
Hover should primarily lift through tonal change, not aggressive hue shifts.

### 10.2 Focus
Focus should combine ring behavior with ghost-border reinforcement when needed.

### 10.3 Pressed
Pressed states may move to `surface-container-highest` or reduce tonal contrast, but should not visually collapse.

### 10.4 Disabled
Disabled states should reduce contrast and depth, but remain understandable and discoverable.

### 10.5 Loading
Use skeletons before global spinners whenever content structure is known.

### 10.6 Destructive
Destructive actions must be visually explicit and never disguised as neutral controls.

## 11. Glass Usage Rules

Glass should be rare and intentional.

### Allowed
- premium floating menus
- hero overlays
- logout or confirmation overlays
- selected editorial banners

### Not Allowed
- every card on the page
- forms that need maximum clarity
- checkout core steps
- dense admin tools

## 12. User / Admin Split

### User-Facing Product Screens
- neutral palette first
- editorial restraint
- functional colors only when necessary
- whitespace and tone over chrome

### Admin Screens
- retains colorful chart tokens
- higher density is allowed
- stronger sidebar semantics are allowed
- still inherits the same typography, radius, ring, and motion system

## 13. Accessibility Interpretation

The No-Line Rule is not permission to remove structure. If contrast, focus, or state comprehension suffers, use ghost-border, ring, or tonal escalation. Clarity always outranks purity.
