# Design System V1 Deliverables

This package contains:

- `01-foundation.md`
- `02-semantic-rules.md`
- `03-component-standards.md`
- `04-patterns.md`
- `global.css`

## Notes

- `global.css` is written to be a drop-in replacement for the existing token file while preserving shadcn compatibility.
- The canonical design-system tokens use the `--ds-*` namespace.
- Existing semantic aliases such as `--background`, `--card`, `--muted`, `--accent`, and `--border` are still exposed for compatibility.
- Web fonts are **not** fetched by CSS alone. In a Next.js project, load `Manrope`, `Newsreader`, and `JetBrains Mono` with `next/font`.
