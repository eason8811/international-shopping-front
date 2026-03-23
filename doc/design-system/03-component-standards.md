# 03 Component Standards

## 1. Purpose

This document defines production-ready component behavior and visual rules. It bridges the semantic layer and the actual React/Tailwind/shadcn implementation.

## 2. Buttons

### 2.1 Primary Button
**Use for:** purchase, save, continue, confirm, submit.

- Background: `primary` or `gradient-cta`
- Foreground: `primary-foreground`
- Radius: `radius-md` or `radius-lg`
- Border: none by default
- Shadow: optional ambient shadow for hero or premium CTA moments only

**Rules**
- Must remain high-contrast and immediately discoverable.
- On user-facing screens, do not over-style with glow, outline stacks, or hard shadows.

### 2.2 Secondary Button
**Use for:** add address, edit profile, secondary confirmation.

- Background: `surface-container-lowest`
- Border: `ghost-border`
- Foreground: `on-surface-strong`
- Radius: `radius-md` or `radius-lg`

**Rules**
- Should feel integrated into the page, not like a default browser button.
- The border should whisper, not shout.

### 2.3 Ghost / Tertiary Button
**Use for:** cancel, unlink, back, low-priority actions.

- Background: transparent
- Foreground: `primary-dim` or `on-surface`
- Hover: lift to `surface-container-low`
- Border: none

### 2.4 Contrast Button
**Use for:** inverse actions placed on dark editorial cards, premium tracking modules, or other high-contrast surfaces.

- Background: `surface-container-lowest`
- Foreground: `on-surface-strong`
- Border: none by default
- Radius: `radius-md` or `radius-lg`

**Rules**
- Use this instead of `primary` when a dark container already carries the emphasis.
- Keep it visually simple; do not add extra outline or glow treatments.

### 2.5 Destructive Button
**Use for:** delete, remove, unlink critical identity, cancel irreversible actions.

- Background: `surface-container-lowest`
- Foreground: `destructive`

**Rule**
Do not mix destructive semantics with neutral hierarchy. Even with a calm white surface, the destructive foreground must remain unmistakable.

## 3. Inputs

### 3.1 Base Input
- Background: `surface-container-low`
- Border: none by default, or `ghost-border` when needed
- Radius: `radius-md`
- Text: `on-surface`
- Placeholder: `on-surface-subtle`

### 3.2 Focus State
- Increase tonal prominence to `surface-container-high` where appropriate
- Use `ring`
- Optional `ghost-border-strong` for clarity

### 3.3 Error State
- Helper text: `destructive`
- Border treatment: soft destructive edge only if required
- Avoid heavy red framing unless necessary for accessibility

### 3.4 Labels and Help Text
- Label: `label-md`
- Gap above input: small but consistent
- Long-form help text should use `body-md`, not label styling

## 4. Cards

### 4.1 Base Card
- Background: `surface-container-lowest`
- Radius: `radius-lg`
- Grouping: padding and background hierarchy, not dividers
- Shadow: none by default

### 4.2 Nested Card
- Outer shell: `surface-container-low`
- Inner card: `surface-container-lowest`

### 4.3 Elevated Card
Reserved for moments that must float visually:
- use ambient shadow
- optional glass version for premium overlays
- avoid overuse in data-dense layouts

## 5. Lists

### 5.1 Default Rule
Do not separate list items with hard dividers.

### 5.2 Alternatives
- `space-y-*`
- tonal alternation
- grouped cards
- subtle nesting backgrounds

## 6. Status Chips

### 6.1 Neutral Chip
- Background: `surface-container-high`
- Foreground: `on-surface`

### 6.2 Success Chip
- Background: `success-soft`
- Foreground: `success-foreground`

### 6.3 Warning Chip
- Background: `warning-soft`
- Foreground: `warning-foreground`

### 6.4 Destructive Chip / Urgent Badge
- Background: `destructive`
- Foreground: `destructive-foreground`

**Rule**
Urgent notification badges may overlap icon corners to create visual depth, but their size should remain tightly controlled.

## 7. Popover, Dropdown, Dialog, Sheet

### 7.1 Popover / Dropdown
- Background: `glass-fill-strong` or `surface-container-lowest`
- Border: `glass-border` or `ghost-border`
- Shadow: `shadow-ambient-sm`
- Blur: allowed for premium floating menus

### 7.2 Dialog
- Background: `surface-container-lowest`
- Optional premium variant: glass
- Avoid thick outlines, hard drop shadows, and overscaled entrance animation

### 7.3 Sheet
- Use for address editing, mobile filters, and contextual details
- Background: `surface`
- Sticky headers are allowed
- Avoid hard separating lines unless usability demands them

## 8. Sidebar

### 8.1 User Side
- Neutral surfaces only
- Current item indicated via tonal lift, text emphasis, or subtle marker
- Avoid dashboard-style color coding

### 8.2 Admin Side
- May use sidebar-specific admin tokens
- Stronger navigation grouping and analytics cues are allowed

## 9. Commerce Components

### 9.1 Product Card
- Imagery is the lead element
- Title should be capped at a scannable length
- Price may use mono
- Tags should be minimal
- CTA must not visually overpower the product content

### 9.2 Address Card
- Information hierarchy: receiver → contact → address
- Default state indicated by chip, not a giant colored banner
- Edit/delete actions should not dominate the composition

### 9.3 Order Summary Card
- Must surface time, status, amount, and item summary immediately
- Timeline and logistics areas should avoid overlined segmentation
- Use chips and nested surfaces to group related order facts

### 9.4 Preference / Account Card
- Group related settings together
- Use one container for one conceptual cluster
- Avoid over-fragmentation into tiny tiles

## 10. Tables and Data-Dense Areas

### 10.1 User-Facing Tables
Prefer cards or stacked blocks first. Use tables only when scan efficiency truly improves.

### 10.2 Admin Tables
Higher density is permitted, but typography, radius, and focus rules remain shared with the rest of the system.

## 11. Empty, Loading, and Error Components

### 11.1 Empty State
- Optional serif title
- concise explanation
- one strong CTA
- not overly technical

### 11.2 Loading State
- skeleton before spinner
- maintain final layout shape when possible

### 11.3 Error State
- `destructive` used for messaging
- container tone remains calm and structured
- do not turn the full page into an alarm panel

## 12. Implementation Notes

- Prefer token-driven class composition rather than one-off arbitrary colors.
- Extend shadcn components through className and token mapping before forking them.
- When custom variants are needed, encode them as design system variants rather than page-local style hacks.
