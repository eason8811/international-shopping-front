import type {
  DsDensityMode,
  DsRadiusKey,
  DsRealm,
  DsShadowKey,
  DsSpacingKey,
  DsSurfaceRole,
  DsTextRole,
  DsTypographyRole,
} from "./tokens";

/**
 * Production-facing component rule registry.
 *
 * Purpose:
 * - Keep component APIs aligned with the design-system docs.
 * - Centralize allowed variants/sizes/states.
 * - Provide metadata that can be consumed by components, docs, or Storybook.
 */

export type DsComponentName =
  | "button"
  | "input"
  | "card"
  | "badge"
  | "popover"
  | "dialog"
  | "sheet"
  | "sidebar"
  | "productCard"
  | "addressCard"
  | "orderSummaryCard"
  | "preferenceCard";

export type DsInteractiveState =
  | "rest"
  | "hover"
  | "focus"
  | "pressed"
  | "disabled"
  | "loading"
  | "error";

export type DsButtonVariant = keyof typeof buttonRules.variants;
export type DsButtonSize = keyof typeof buttonRules.sizes;
export type DsInputVariant = keyof typeof inputRules.variants;
export type DsInputDensity = keyof typeof inputRules.densities;
export type DsCardVariant = keyof typeof cardRules.variants;
export type DsBadgeTone = keyof typeof badgeRules.tones;
export type DsPopoverVariant = keyof typeof popoverRules.variants;
export type DsDialogVariant = keyof typeof dialogRules.variants;
export type DsSheetVariant = keyof typeof sheetRules.variants;
export type DsSidebarVariant = keyof typeof sidebarRules.variants;

export interface ComponentBaseRule {
  description: string;
  allowedRealms: readonly DsRealm[];
  density: readonly DsDensityMode[];
}

export const buttonRules = {
  component: "button",
  defaults: {
    variant: "primary",
    size: "md",
    radius: "lg",
  },
  variants: {
    primary: {
      description: "High-emphasis action for purchase, save, continue, submit, and confirm.",
      allowedRealms: ["user", "admin"],
      density: ["airy", "balanced", "compact"],
      background: "--ds-primary",
      foreground: "--ds-primary-foreground",
      radius: "lg",
      shadow: null,
      hoverSurface: "raised",
      allowsGradient: true,
      preferredGradient: "--ds-gradient-cta",
      preferredTypography: "titleMd",
      notes: [
        "Use ambient shadow only for hero or premium CTA moments.",
        "Do not stack glow, hard outline, and heavy shadow together.",
      ],
    },
    secondary: {
      description: "Medium-emphasis action using tonal surface and ghost border.",
      allowedRealms: ["user", "admin"],
      density: ["airy", "balanced", "compact"],
      backgroundSurface: "card",
      border: "--ds-ghost-border",
      foregroundRole: "strong",
      radius: "lg",
      shadow: null,
      hoverSurface: "section",
      preferredTypography: "titleMd",
      notes: [
        "Should feel integrated into the page rather than floating like a generic system button.",
      ],
    },
    ghost: {
      description: "Low-emphasis action for cancel, unlink, back, and auxiliary controls.",
      allowedRealms: ["user", "admin"],
      density: ["airy", "balanced", "compact"],
      background: "transparent",
      foreground: "--ds-primary-dim",
      radius: "lg",
      shadow: null,
      hoverSurface: "section",
      preferredTypography: "titleMd",
      notes: [
        "Keep hover behavior tonal and restrained.",
      ],
    },
    destructive: {
      description: "High-risk action for deletion, removal, and irreversible cancellation.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      background: "--ds-destructive",
      foreground: "--ds-destructive-foreground",
      radius: "lg",
      shadow: null,
      hoverSurface: "active",
      preferredTypography: "titleMd",
      notes: [
        "Do not disguise destructive actions as neutral buttons.",
      ],
    },
  },
  sizes: {
    sm: {
      height: "2.25rem",
      paddingX: "0.75rem",
      paddingY: "0.5rem",
      iconSize: "1rem",
      radiusFallback: "md",
      typography: "bodyMd",
    },
    md: {
      height: "2.75rem",
      paddingX: "1rem",
      paddingY: "0.625rem",
      iconSize: "1rem",
      radiusFallback: "lg",
      typography: "titleMd",
    },
    lg: {
      height: "3rem",
      paddingX: "1.25rem",
      paddingY: "0.75rem",
      iconSize: "1.125rem",
      radiusFallback: "lg",
      typography: "titleMd",
    },
    icon: {
      height: "2.75rem",
      width: "2.75rem",
      iconSize: "1rem",
      radiusFallback: "full",
      typography: "titleMd",
    },
  },
  states: {
    rest: "Maintain intended variant tone with no extra chrome.",
    hover: "Prefer tonal lift or subtle contrast adjustment over aggressive color shift.",
    focus: "Use ring for keyboard clarity; add ghost-border reinforcement only if needed.",
    pressed: "Slight tonal compression or active surface shift is allowed.",
    disabled: "Lower contrast and reduce depth, but keep label legible.",
    loading: "Keep label width stable and avoid layout shift.",
  },
} as const satisfies {
  component: "button";
  defaults: {
    variant: string;
    size: string;
    radius: DsRadiusKey;
  };
  variants: Record<
    string,
    ComponentBaseRule & {
      background?: string;
      backgroundSurface?: DsSurfaceRole;
      foreground?: string;
      foregroundRole?: DsTextRole;
      border?: string;
      radius: DsRadiusKey;
      shadow: DsShadowKey | null;
      hoverSurface: DsSurfaceRole;
      allowsGradient?: boolean;
      preferredGradient?: string;
      preferredTypography: DsTypographyRole;
      notes: readonly string[];
    }
  >;
  sizes: Record<
    string,
    {
      height: string;
      width?: string;
      paddingX?: string;
      paddingY?: string;
      iconSize: string;
      radiusFallback: DsRadiusKey;
      typography: DsTypographyRole;
    }
  >;
  states: Record<Exclude<DsInteractiveState, "error">, string>;
};

export const inputRules = {
  component: "input",
  defaults: {
    variant: "default",
    density: "balanced",
    radius: "md",
  },
  variants: {
    default: {
      description: "Editorial neutral input using tonal surface and optional ghost border.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "section",
      textRole: "default",
      placeholderRole: "subtle",
      radius: "md",
      preferredLabel: "labelMd",
      allowLeadingIcon: true,
      allowTrailingAction: true,
      notes: [
        "Default choice for forms, address fields, and account settings.",
      ],
    },
    quiet: {
      description: "Lighter inline input for lower visual emphasis or compact editing contexts.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "nested",
      textRole: "default",
      placeholderRole: "subtle",
      radius: "md",
      preferredLabel: "labelMd",
      allowLeadingIcon: true,
      allowTrailingAction: false,
      notes: [
        "Useful for inline editing or secondary settings rows.",
      ],
    },
    search: {
      description: "Search-oriented input for catalog, order history, and admin list filtering.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "section",
      textRole: "default",
      placeholderRole: "muted",
      radius: "full",
      preferredLabel: "labelMd",
      allowLeadingIcon: true,
      allowTrailingAction: true,
      notes: [
        "Best paired with sheet-based filters on mobile listing screens.",
      ],
    },
  },
  densities: {
    balanced: {
      minHeight: "2.75rem",
      paddingX: "0.875rem",
      paddingY: "0.625rem",
      helperGap: 2,
      labelGap: 2,
      typography: "bodyMd",
    },
    compact: {
      minHeight: "2.375rem",
      paddingX: "0.75rem",
      paddingY: "0.5rem",
      helperGap: 2,
      labelGap: 1,
      typography: "bodyMd",
    },
  },
  states: {
    rest: {
      surface: "section",
      border: null,
      ring: false,
      helpTextRole: "muted",
    },
    hover: {
      surface: "raised",
      border: "--ds-ghost-border",
      ring: false,
      helpTextRole: "muted",
    },
    focus: {
      surface: "raised",
      border: "--ds-ghost-border-strong",
      ring: true,
      helpTextRole: "muted",
    },
    error: {
      surface: "section",
      border: "--ds-destructive-soft",
      ring: false,
      helpTextRole: "default",
      helperColor: "--ds-destructive",
    },
    disabled: {
      surface: "nested",
      border: null,
      ring: false,
      helpTextRole: "subtle",
    },
  },
} as const satisfies {
  component: "input";
  defaults: {
    variant: string;
    density: DsDensityMode;
    radius: DsRadiusKey;
  };
  variants: Record<
    string,
    ComponentBaseRule & {
      surface: DsSurfaceRole;
      textRole: DsTextRole;
      placeholderRole: DsTextRole;
      radius: DsRadiusKey;
      preferredLabel: DsTypographyRole;
      allowLeadingIcon: boolean;
      allowTrailingAction: boolean;
      notes: readonly string[];
    }
  >;
  densities: Record<
    string,
    {
      minHeight: string;
      paddingX: string;
      paddingY: string;
      helperGap: DsSpacingKey;
      labelGap: DsSpacingKey;
      typography: DsTypographyRole;
    }
  >;
  states: Record<
    Extract<DsInteractiveState, "rest" | "hover" | "focus" | "error" | "disabled">,
    {
      surface: DsSurfaceRole;
      border: string | null;
      ring: boolean;
      helpTextRole: DsTextRole;
      helperColor?: string;
    }
  >;
};

export const cardRules = {
  component: "card",
  defaults: {
    variant: "base",
  },
  variants: {
    base: {
      description: "Default content card for user-facing product surfaces.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "card",
      radius: "lg",
      padding: 6,
      shadow: null,
      allowDividerLines: false,
      notes: [
        "Primary grouping should come from padding and tonal hierarchy, not dividers.",
      ],
    },
    nested: {
      description: "Inner card used inside section shells, dialogs, or grouped blocks.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "nested",
      radius: "lg",
      padding: 6,
      shadow: null,
      allowDividerLines: false,
      notes: [
        "Use for vellum-like layering inside larger containers.",
      ],
    },
    elevated: {
      description: "Floating card reserved for menus, premium overlays, or highlighted interactive blocks.",
      allowedRealms: ["user", "admin"],
      density: ["airy", "balanced"],
      surface: "card",
      radius: "lg",
      padding: 6,
      shadow: "ambientMd",
      allowDividerLines: false,
      notes: [
        "Avoid overuse in data-dense layouts.",
      ],
    },
    editorial: {
      description: "Large visual card for premium storytelling, hero modules, and welcome sections.",
      allowedRealms: ["user"],
      density: ["airy", "balanced"],
      surface: "card",
      radius: "xl",
      padding: 8,
      shadow: null,
      allowDividerLines: false,
      notes: [
        "Appropriate for masthead-adjacent blocks and high-confidence account intros.",
      ],
    },
  },
} as const satisfies {
  component: "card";
  defaults: { variant: string };
  variants: Record<
    string,
    ComponentBaseRule & {
      surface: DsSurfaceRole;
      radius: DsRadiusKey;
      padding: DsSpacingKey;
      shadow: DsShadowKey | null;
      allowDividerLines: boolean;
      notes: readonly string[];
    }
  >;
};

export const badgeRules = {
  component: "badge",
  defaults: {
    tone: "neutral",
    radius: "full",
  },
  tones: {
    neutral: {
      description: "Default low-key chip for neutral metadata.",
      allowedRealms: ["user", "admin"],
      density: ["airy", "balanced", "compact"],
      surface: "raised",
      foregroundRole: "default",
      radius: "full",
    },
    success: {
      description: "Success chip for paid, delivered, completed, and valid states.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      background: "--ds-success-soft",
      foreground: "--ds-success-foreground",
      radius: "full",
    },
    warning: {
      description: "Warning chip for pending, delayed, or attention-needed states.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      background: "--ds-warning-soft",
      foreground: "--ds-warning-foreground",
      radius: "full",
    },
    destructive: {
      description: "Urgent or critical chip/badge tone.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      background: "--ds-destructive",
      foreground: "--ds-destructive-foreground",
      radius: "full",
    },
    defaultAddress: {
      description: "Priority chip for the user's default address without using a loud banner.",
      allowedRealms: ["user"],
      density: ["balanced"],
      background: "--ds-surface-container-high",
      foregroundRole: "strong",
      radius: "full",
    },
  },
  sizes: {
    sm: {
      minHeight: "1.5rem",
      paddingX: "0.5rem",
      paddingY: "0.125rem",
      typography: "labelMd",
    },
    md: {
      minHeight: "1.75rem",
      paddingX: "0.625rem",
      paddingY: "0.1875rem",
      typography: "labelMd",
    },
  },
} as const;

export const popoverRules = {
  component: "popover",
  variants: {
    default: {
      description: "Standard floating menu or lightweight details panel.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      background: "--ds-glass-fill-strong",
      border: "--ds-glass-border",
      shadow: "ambientSm",
      blur: "--ds-glass-blur-sm",
    },
    neutral: {
      description: "Non-glass fallback for stricter clarity needs.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      backgroundSurface: "card",
      border: "--ds-ghost-border",
      shadow: "ambientSm",
      blur: null,
    },
  },
} as const;

export const dialogRules = {
  component: "dialog",
  variants: {
    default: {
      description: "Standard dialog for account edits, confirmations, and support flows.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "card",
      radius: "xl",
      shadow: "ambientMd",
      allowGlass: false,
    },
    premium: {
      description: "Glass-enhanced premium dialog reserved for logout or high-confidence confirm moments.",
      allowedRealms: ["user"],
      density: ["airy", "balanced"],
      surface: "card",
      radius: "xl",
      shadow: "ambientLg",
      allowGlass: true,
    },
  },
} as const;

export const sheetRules = {
  component: "sheet",
  variants: {
    mobileEditor: {
      description: "Primary mobile sheet for address edit, filters, and contextual details.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "page",
      radius: "xl",
      stickyHeader: true,
      allowGlass: false,
    },
    sidePanel: {
      description: "Desktop support sheet for advanced filters or secondary details.",
      allowedRealms: ["user", "admin"],
      density: ["balanced", "compact"],
      surface: "page",
      radius: "xl",
      stickyHeader: true,
      allowGlass: false,
    },
  },
} as const;

export const sidebarRules = {
  component: "sidebar",
  variants: {
    user: {
      description: "Neutral user-side navigation with tonal lift for active items.",
      allowedRealms: ["user"],
      density: ["balanced"],
      useAdminTokens: false,
      activeSurface: "raised",
      activeTextRole: "strong",
    },
    admin: {
      description: "Analytics-oriented admin sidebar with stronger grouping semantics.",
      allowedRealms: ["admin"],
      density: ["compact"],
      useAdminTokens: true,
      activeSurface: "raised",
      activeTextRole: "strong",
    },
  },
} as const;

export const commerceComponentRules = {
  productCard: {
    description: "Product list/grid card where imagery leads and commerce signals stay scannable.",
    mediaPriority: "high",
    titleMaxLines: 2,
    descriptionMaxLines: 2,
    tagLimit: 2,
    allowMonoPrice: true,
    preferredSurface: "card",
    preferredRadius: "lg",
    defaultPadding: 4,
    preferredActions: ["quickView", "wishlist", "openDetail"] as const,
    notes: [
      "CTA must not visually overpower product information.",
      "Keep media ratio stable across the whole grid.",
    ],
  },
  addressCard: {
    description: "Address management card with calm hierarchy and restrained actions.",
    informationHierarchy: ["receiver", "contact", "address"] as const,
    defaultChipTone: "defaultAddress",
    preferredSurface: "card",
    preferredRadius: "lg",
    defaultPadding: 6,
    actionsAlignment: "trailing",
    notes: [
      "Default address should be signaled by a chip, not a loud colored panel.",
      "Edit/delete actions must not dominate the composition.",
    ],
  },
  orderSummaryCard: {
    description: "Order summary card that surfaces date, status, amount, and item summary immediately.",
    keyFacts: ["date", "status", "amount", "itemSummary"] as const,
    preferredSurface: "card",
    preferredRadius: "lg",
    defaultPadding: 6,
    useNestedTimelineSurface: true,
    notes: [
      "Timeline and logistics regions should rely on grouping, not divider stacks.",
    ],
  },
  preferenceCard: {
    description: "Grouped account and preference card for profile settings clusters.",
    preferredSurface: "card",
    preferredRadius: "lg",
    defaultPadding: 6,
    notes: [
      "Use one container per conceptual cluster and avoid over-fragmentation.",
    ],
  },
} as const satisfies Record<
  string,
  {
    description: string;
    preferredSurface: DsSurfaceRole;
    preferredRadius: DsRadiusKey;
    defaultPadding: DsSpacingKey;
    notes: readonly string[];
    [key: string]: unknown;
  }
>;

export const componentRulesRegistry = {
  button: buttonRules,
  input: inputRules,
  card: cardRules,
  badge: badgeRules,
  popover: popoverRules,
  dialog: dialogRules,
  sheet: sheetRules,
  sidebar: sidebarRules,
  commerce: commerceComponentRules,
} as const;

export function getButtonVariantRule(variant: DsButtonVariant) {
  return buttonRules.variants[variant];
}

export function getInputVariantRule(variant: DsInputVariant) {
  return inputRules.variants[variant];
}

export function getCardVariantRule(variant: DsCardVariant) {
  return cardRules.variants[variant];
}

export function getBadgeToneRule(tone: DsBadgeTone) {
  return badgeRules.tones[tone];
}
