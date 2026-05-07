# Components Layer

This directory is the design-system UI layer described in `doc/design-system/figma-design-system-rules.md`.

- `ui`: base primitives and atom-level components, seeded from shadcn CLI and adapted to Figma.
- `auth/blocks`: Auth-only derived blocks used to build authentication pages.
- `blocks`: reusable cross-page composition blocks outside the Auth-specific slice.
- `shared`: site-level or layout-level shared components.

Feature-specific state, API adapters, and workflow orchestration stay in `src/features/*`.
