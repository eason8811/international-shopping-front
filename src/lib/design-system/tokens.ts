/**
 * Cross-border commerce Design System token registry.
 *
 * Purpose:
 * - Give TypeScript a stable, typed view of the design-system primitives.
 * - Keep component rules and page patterns aligned with the canonical `--ds-*` CSS tokens.
 * - Avoid magic strings scattered across components.
 *
 * Notes:
 * - CSS remains the source of truth for actual values.
 * - This file models token names, semantic groupings, and recommended usage.
 */

export const dsTokenNamespace = "--ds" as const;

export const dsRealms = ["user", "admin"] as const;
export type DsRealm = (typeof dsRealms)[number];

export const dsDensityModes = ["airy", "balanced", "compact"] as const;
export type DsDensityMode = (typeof dsDensityModes)[number];

export const dsThemeModes = ["light", "dark"] as const;
export type DsThemeMode = (typeof dsThemeModes)[number];

export const dsAllowedDesktopRatios = ["7/5", "8/4", "60/40", "5/4/3"] as const;
export type DsDesktopRatio = (typeof dsAllowedDesktopRatios)[number];

export const dsBreakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const dsFonts = {
  sans: {
    cssVar: "--font-sans",
    cssValue: '"Manrope", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    usage: "UI titles, body, labels, navigation, forms.",
  },
  serif: {
    cssVar: "--font-serif",
    cssValue: '"Newsreader", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    usage: "Editorial headlines, mastheads, premium storytelling moments.",
  },
  mono: {
    cssVar: "--font-mono",
    cssValue: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    usage: "Price, SKU, order number, tracking code, logistics precision data.",
  },
} as const;

export type DsFontFamilyKey = keyof typeof dsFonts;

export const dsTypographyRoles = {
  displayXl: {
    label: "Display XL",
    fontFamily: "serif",
    cssVar: "--font-serif",
    fontSize: "4rem",
    lineHeight: 1,
    fontWeight: 500,
    letterSpacing: "-0.03em",
    usage: "Large campaign and hero moments.",
  },
  displayLg: {
    label: "Display LG",
    fontFamily: "serif",
    cssVar: "--font-serif",
    fontSize: "3.5rem",
    lineHeight: 1,
    fontWeight: 500,
    letterSpacing: "-0.02em",
    usage: "Mastheads and welcome headers.",
  },
  headlineLg: {
    label: "Headline LG",
    fontFamily: "serif",
    cssVar: "--font-serif",
    fontSize: "2rem",
    lineHeight: 1.1,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    usage: "Section-leading editorial headers.",
  },
  headlineMd: {
    label: "Headline MD",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "1.5rem",
    lineHeight: 1.2,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    usage: "Primary content section titles.",
  },
  titleLg: {
    label: "Title LG",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "1.125rem",
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: "0em",
    usage: "Card titles and grouped block titles.",
  },
  titleMd: {
    label: "Title MD",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "1rem",
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: "0em",
    usage: "Secondary titles and compact section heads.",
  },
  bodyLg: {
    label: "Body LG",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "1rem",
    lineHeight: 1.7,
    fontWeight: 400,
    letterSpacing: "0em",
    usage: "Descriptive body copy.",
  },
  bodyMd: {
    label: "Body MD",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    fontWeight: 400,
    letterSpacing: "0em",
    usage: "Dense supporting body copy.",
  },
  labelMd: {
    label: "Label MD",
    fontFamily: "sans",
    cssVar: "--font-sans",
    fontSize: "0.75rem",
    lineHeight: 1.4,
    fontWeight: 500,
    letterSpacing: "0.04em",
    usage: "Metadata, caps labels, control labels.",
  },
  dataSm: {
    label: "Data SM",
    fontFamily: "mono",
    cssVar: "--font-mono",
    fontSize: "0.75rem",
    lineHeight: 1.5,
    fontWeight: 500,
    letterSpacing: "0em",
    usage: "Codes, prices, tracking strings.",
  },
} as const;

export type DsTypographyRole = keyof typeof dsTypographyRoles;

export const dsSpacing = {
  0: "0rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export type DsSpacingKey = keyof typeof dsSpacing;

export const dsSpacingUsage = {
  minimumContainerPadding: 4,
  compactCardPadding: 4,
  standardCardPadding: 6,
  largeCardPadding: 8,
  sectionGap: 12,
  mastheadGap: 16,
} as const satisfies Record<string, DsSpacingKey>;

export const dsRadius = {
  sm: {
    cssVar: "--radius-sm",
    value: "0.5rem",
    usage: "Very small utility chips or tightly packed controls.",
  },
  md: {
    cssVar: "--radius-md",
    value: "0.625rem",
    usage: "Inputs, smaller buttons, compact panels.",
  },
  lg: {
    cssVar: "--radius-lg",
    value: "0.75rem",
    usage: "Default cards, buttons, commerce blocks.",
  },
  xl: {
    cssVar: "--radius-xl",
    value: "1rem",
    usage: "Editorial cards, feature containers, larger hero blocks.",
  },
  full: {
    cssVar: "--radius-full",
    value: "9999px",
    usage: "Pills and badges.",
  },
} as const;

export type DsRadiusKey = keyof typeof dsRadius;

export const dsMotion = {
  durationFast: {
    cssVar: "--duration-fast",
    value: "160ms",
    usage: "Hover, icon, subtle state changes.",
  },
  durationBase: {
    cssVar: "--duration-base",
    value: "220ms",
    usage: "Default component transitions.",
  },
  durationSlow: {
    cssVar: "--duration-slow",
    value: "320ms",
    usage: "Dialog, sheet, and larger layout transitions.",
  },
  easeStandard: {
    cssVar: "--ease-standard",
    value: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    usage: "Default interaction curve.",
  },
  easeEmphasized: {
    cssVar: "--ease-emphasized",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    usage: "Premium enter/exit and emphasis transitions.",
  },
} as const;

export type DsMotionKey = keyof typeof dsMotion;

export const dsShadows = {
  shadow2xs: { cssVar: "--shadow-2xs", usage: "Subtle utility shadow." },
  shadowXs: { cssVar: "--shadow-xs", usage: "Subtle utility shadow." },
  shadowSm: { cssVar: "--shadow-sm", usage: "Low-elevation surface shadow." },
  shadow: { cssVar: "--shadow", usage: "Default fallback shadow." },
  shadowMd: { cssVar: "--shadow-md", usage: "Moderate surface shadow." },
  shadowLg: { cssVar: "--shadow-lg", usage: "Large fallback shadow." },
  shadowXl: { cssVar: "--shadow-xl", usage: "Oversized fallback shadow." },
  shadow2xl: { cssVar: "--shadow-2xl", usage: "Maximum fallback shadow." },
  ambientSm: { cssVar: "--shadow-ambient-sm", usage: "Popover, dropdown, lightweight floating elements." },
  ambientMd: { cssVar: "--shadow-ambient-md", usage: "Dialogs and premium cards." },
  ambientLg: { cssVar: "--shadow-ambient-lg", usage: "Large overlays and editorial hero float moments." },
} as const;

export type DsShadowKey = keyof typeof dsShadows;

export const dsSurfaceRoles = {
  page: {
    token: "surface",
    cssVar: "--ds-surface",
    usage: "Root page background.",
  },
  section: {
    token: "surface-container-low",
    cssVar: "--ds-surface-container-low",
    usage: "Section-level grouping blocks.",
  },
  card: {
    token: "surface-container-lowest",
    cssVar: "--ds-surface-container-lowest",
    usage: "Top cards, content blocks, main panels.",
  },
  nested: {
    token: "surface-container",
    cssVar: "--ds-surface-container",
    usage: "Internal grouping inside cards.",
  },
  raised: {
    token: "surface-container-high",
    cssVar: "--ds-surface-container-high",
    usage: "Hover, soft lift, secondary emphasis.",
  },
  active: {
    token: "surface-container-highest",
    cssVar: "--ds-surface-container-highest",
    usage: "Active state, pressed state, strongest tonal emphasis.",
  },
} as const;

export type DsSurfaceRole = keyof typeof dsSurfaceRoles;

export const dsTextRoles = {
  strong: {
    token: "on-surface-strong",
    cssVar: "--ds-on-surface-strong",
    usage: "Headings, primary values, strong emphasis.",
  },
  default: {
    token: "on-surface",
    cssVar: "--ds-on-surface",
    usage: "Body copy and standard UI text.",
  },
  muted: {
    token: "on-surface-muted",
    cssVar: "--ds-on-surface-muted",
    usage: "Descriptions and secondary text.",
  },
  subtle: {
    token: "on-surface-subtle",
    cssVar: "--ds-on-surface-subtle",
    usage: "Placeholder and tertiary labels.",
  },
} as const;

export type DsTextRole = keyof typeof dsTextRoles;

export const dsFeedbackTokens = {
  primary: {
    cssVar: "--ds-primary",
    foregroundCssVar: "--ds-primary-foreground",
    usage: "Primary CTA and strongest action emphasis.",
  },
  primaryDim: {
    cssVar: "--ds-primary-dim",
    usage: "Ghost action text, editorial deep tone, gradient tail.",
  },
  success: {
    cssVar: "--ds-success",
    softCssVar: "--ds-success-soft",
    foregroundCssVar: "--ds-success-foreground",
    usage: "Paid, delivered, completed, valid, success chips.",
  },
  warning: {
    cssVar: "--ds-warning",
    softCssVar: "--ds-warning-soft",
    foregroundCssVar: "--ds-warning-foreground",
    usage: "Pending attention, delayed, low urgency warnings.",
  },
  destructive: {
    cssVar: "--ds-destructive",
    softCssVar: "--ds-destructive-soft",
    foregroundCssVar: "--ds-destructive-foreground",
    usage: "Remove, cancel, irreversible or error states.",
  },
} as const;

export type DsFeedbackTokenKey = keyof typeof dsFeedbackTokens;

export const dsInteractionTokens = {
  ghostBorder: {
    cssVar: "--ds-ghost-border",
    usage: "Minimal visible edge when clarity requires it.",
  },
  ghostBorderStrong: {
    cssVar: "--ds-ghost-border-strong",
    usage: "Focus reinforcement or stronger delineation.",
  },
  ring: {
    cssVar: "--ds-ring",
    usage: "Focus visibility and keyboard navigation clarity.",
  },
} as const;

export type DsInteractionTokenKey = keyof typeof dsInteractionTokens;

export const dsGlassTokens = {
  fill: {
    cssVar: "--ds-glass-fill",
    usage: "Premium glass fill.",
  },
  fillStrong: {
    cssVar: "--ds-glass-fill-strong",
    usage: "Denser premium glass fill for floating containers.",
  },
  border: {
    cssVar: "--ds-glass-border",
    usage: "Glass outline edge.",
  },
  blurSm: {
    cssVar: "--ds-glass-blur-sm",
    usage: "12px blur for lighter overlays.",
  },
  blurLg: {
    cssVar: "--ds-glass-blur-lg",
    usage: "20px blur for premium hero overlays.",
  },
} as const;

export type DsGlassTokenKey = keyof typeof dsGlassTokens;

export const dsGradientTokens = {
  cta: {
    cssVar: "--ds-gradient-cta",
    usage: "Primary premium CTA gradient.",
  },
  inkSoft: {
    cssVar: "--ds-gradient-ink-soft",
    usage: "Soft editorial overlay gradient.",
  },
} as const;

export type DsGradientTokenKey = keyof typeof dsGradientTokens;

export const dsAdminTokens = {
  chart: {
    chart1: "--ds-chart-1",
    chart2: "--ds-chart-2",
    chart3: "--ds-chart-3",
    chart4: "--ds-chart-4",
    chart5: "--ds-chart-5",
  },
  sidebar: {
    surface: "--ds-sidebar",
    foreground: "--ds-sidebar-foreground",
    primary: "--ds-sidebar-primary",
    primaryForeground: "--ds-sidebar-primary-foreground",
    accent: "--ds-sidebar-accent",
    accentForeground: "--ds-sidebar-accent-foreground",
    border: "--ds-sidebar-border",
    ring: "--ds-sidebar-ring",
  },
} as const;

export const dsCompatibilityAliases = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
  sidebar: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
} as const;

export const dsUsagePresets = {
  userPage: {
    realm: "user",
    density: "balanced",
    baseSurface: "page",
    preferredCardSurface: "card",
    sectionGap: 12,
  },
  userHero: {
    realm: "user",
    density: "airy",
    baseSurface: "page",
    preferredCardSurface: "card",
    sectionGap: 16,
  },
  adminAnalytics: {
    realm: "admin",
    density: "compact",
    baseSurface: "page",
    preferredCardSurface: "card",
    sectionGap: 8,
  },
} as const satisfies Record<
  string,
  {
    realm: DsRealm;
    density: DsDensityMode;
    baseSurface: DsSurfaceRole;
    preferredCardSurface: DsSurfaceRole;
    sectionGap: DsSpacingKey;
  }
>;

export function cssVar(tokenName: string): string {
  return `var(${tokenName})`;
}

export function resolveSurfaceVar(surface: DsSurfaceRole): string {
  return cssVar(dsSurfaceRoles[surface].cssVar);
}

export function resolveTextVar(textRole: DsTextRole): string {
  return cssVar(dsTextRoles[textRole].cssVar);
}
