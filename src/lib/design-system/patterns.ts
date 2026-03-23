import type { DsDensityMode, DsDesktopRatio, DsRealm, DsSpacingKey } from "./tokens";

/**
 * Product-level layout pattern registry.
 *
 * Purpose:
 * - Turn business-facing screens into reusable pattern contracts.
 * - Keep page composition consistent with the design-system docs.
 * - Give feature teams a typed set of allowed structures before custom page-specific improvisation happens.
 */

export type DsPatternName = keyof typeof pagePatterns;

export type DsPatternBlockKey =
  | "eyebrow"
  | "displayHeadline"
  | "supportingCopy"
  | "primaryCta"
  | "secondaryCta"
  | "heroImage"
  | "welcomeHeader"
  | "profileSummary"
  | "orderTrackingCard"
  | "addressBookCard"
  | "preferencesCard"
  | "securityCard"
  | "supportCard"
  | "sectionHeader"
  | "primaryAction"
  | "filters"
  | "productGrid"
  | "addressList"
  | "emptyState"
  | "mediaGallery"
  | "purchasePanel"
  | "variantSelector"
  | "shippingTrustBlock"
  | "detailsAccordion"
  | "addressSection"
  | "shippingSection"
  | "paymentSection"
  | "summarySection"
  | "submitAction"
  | "orderList"
  | "statusControls"
  | "orderHeader"
  | "itemList"
  | "shipmentTimeline"
  | "paymentSummary"
  | "afterSalesEntry"
  | "summaryMetrics"
  | "charts"
  | "table";

export interface DsPatternDefinition {
  name: string;
  description: string;
  realm: DsRealm;
  density: DsDensityMode;
  recommendedSectionGap: DsSpacingKey;
  minimumContainerPadding: DsSpacingKey;
  allowedDesktopRatios: readonly DsDesktopRatio[];
  allowAsymmetry: boolean;
  allowGlass: boolean;
  allowEditorialImagery: boolean;
  allowTables: boolean;
  preferCardsOverTables: boolean;
  supportsLongCopy: boolean;
  feedback: {
    emptyRequiresPrimaryAction: boolean;
    loadingMirrorsLayout: boolean;
    errorRequiresRecoveryAction: boolean;
  };
  requiredBlocks: readonly DsPatternBlockKey[];
  optionalBlocks?: readonly DsPatternBlockKey[];
  primaryComponents: readonly string[];
  notes: readonly string[];
  doNots: readonly string[];
}

export const pagePatterns = {
  editorialMasthead: {
    name: "Editorial Masthead",
    description:
      "Premium entry pattern for homepage hero, collection lead-in, seasonal campaigns, and user welcome headers.",
    realm: "user",
    density: "airy",
    recommendedSectionGap: 16,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "8/4", "60/40"],
    allowAsymmetry: true,
    allowGlass: true,
    allowEditorialImagery: true,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: [
      "eyebrow",
      "displayHeadline",
      "supportingCopy",
      "primaryCta",
      "heroImage",
    ],
    optionalBlocks: ["secondaryCta"],
    primaryComponents: ["Button", "Card", "EditorialMasthead"],
    notes: [
      "Mild overlap between text and image is allowed if readability stays excellent.",
      "Whitespace should feel generous and premium.",
      "CTA clarity outranks decorative layering.",
    ],
    doNots: [
      "Do not stuff operational UI into the masthead.",
      "Do not let imagery bury the primary CTA.",
    ],
  },
  userProfileDashboard: {
    name: "User Profile Dashboard",
    description:
      "Account overview pattern that balances premium atmosphere with fast confidence-building scanability across desktop, tablet, and mobile.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 12,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "60/40", "5/4/3"],
    allowAsymmetry: true,
    allowGlass: false,
    allowEditorialImagery: true,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: [
      "welcomeHeader",
      "profileSummary",
      "statusControls",
      "orderTrackingCard",
      "preferencesCard",
      "supportCard",
    ],
    optionalBlocks: ["securityCard"],
    primaryComponents: [
      "EditorialMasthead",
      "OrderSummaryCard",
      "AddressCard",
      "PreferenceCard",
      "Button",
    ],
    notes: [
      "Use grouped cards rather than tile overload.",
      "Tonal hierarchy and spacing should do more work than dividers.",
      "A single dark editorial tracking card may anchor the composition.",
      "Responsive changes may alter placement, but not naming or semantic hierarchy.",
      "Mobile navigation should collapse into a hamburger entry rather than a bottom tab bar.",
    ],
    doNots: [
      "Do not make the screen look like an admin dashboard.",
      "Do not fragment related settings into too many tiny panels.",
      "Do not let each breakpoint invent a separate naming system or page identity.",
    ],
  },
  addressManagement: {
    name: "Address Management",
    description:
      "Address book pattern focused on calm hierarchy, quick edits, and a clear default address state.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "60/40"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: false,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: ["sectionHeader", "primaryAction", "addressList", "emptyState"],
    primaryComponents: ["AddressCard", "Button", "Dialog", "Sheet", "Badge"],
    notes: [
      "Desktop edit flows can use dialog; mobile edit flows should prefer sheet.",
      "Default chip should signal priority without overpowering the address card.",
      "Use spacing rather than divider lines between addresses.",
    ],
    doNots: [
      "Do not let destructive actions visually outrank the Add Address CTA.",
      "Do not use loud colored banners for default addresses.",
    ],
  },
  productListing: {
    name: "Product Listing",
    description:
      "Catalog pattern that supports promotional framing without losing search and filter utility.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["8/4", "60/40", "5/4/3"],
    allowAsymmetry: true,
    allowGlass: false,
    allowEditorialImagery: true,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: ["filters", "productGrid"],
    optionalBlocks: ["sectionHeader", "primaryAction"],
    primaryComponents: ["ProductCard", "Sheet", "Button", "Input", "Badge"],
    notes: [
      "Desktop can pair an editorial intro with product grid once the core utility remains clear.",
      "Mobile should collapse to a clean single-column flow and use sheet or drawer filters.",
      "Product grid rhythm must stay stable once products begin.",
    ],
    doNots: [
      "Do not let campaign framing bury search and filtering.",
      "Do not vary media ratio card-by-card.",
    ],
  },
  productDetail: {
    name: "Product Detail Page",
    description:
      "Conversion-sensitive product detail pattern balancing editorial tone and purchase clarity.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "60/40"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: true,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: [
      "mediaGallery",
      "purchasePanel",
      "variantSelector",
      "primaryCta",
      "shippingTrustBlock",
      "detailsAccordion",
    ],
    primaryComponents: ["Button", "Badge", "Card", "Accordion", "ProductCard"],
    notes: [
      "Desktop should default to left media and right purchase information.",
      "Mobile should stack into a clear image-first flow.",
      "Trust indicators should feel calm and integrated, not loud.",
    ],
    doNots: [
      "Do not make buying controls feel secondary to decorative content.",
      "Do not use editorial flourishes that reduce conversion clarity.",
    ],
  },
  checkout: {
    name: "Checkout",
    description:
      "Task-first purchase completion pattern where trust and clarity override decorative ambition.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "60/40"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: false,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: [
      "addressSection",
      "shippingSection",
      "paymentSection",
      "summarySection",
      "submitAction",
    ],
    primaryComponents: ["Card", "Button", "Input", "Badge", "Dialog"],
    notes: [
      "Use tonal layering, not theatrics.",
      "Errors should be direct, localized, and easy to resolve.",
      "Asymmetry should be minimal even on desktop.",
    ],
    doNots: [
      "Do not use decorative glass treatment on core decision blocks.",
      "Do not reduce scannability to preserve editorial styling.",
    ],
  },
  orderHistory: {
    name: "Order History",
    description:
      "Order archive pattern optimized for status scanability and calm transaction review.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["60/40", "7/5"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: false,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: ["statusControls", "orderList"],
    optionalBlocks: ["filters", "emptyState"],
    primaryComponents: ["OrderSummaryCard", "Badge", "Input", "Button", "Sheet"],
    notes: [
      "Default density should remain Balanced.",
      "Use chips rather than loud icons for status emphasis.",
      "Key facts should be visible before expansion.",
    ],
    doNots: [
      "Do not over-segment every order line with heavy dividers.",
      "Do not turn the list into a dense back-office table unless user utility truly improves.",
    ],
  },
  orderDetail: {
    name: "Order Detail",
    description:
      "Detailed post-purchase pattern for items, logistics, payments, and after-sales support.",
    realm: "user",
    density: "balanced",
    recommendedSectionGap: 8,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["7/5", "60/40"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: false,
    allowTables: false,
    preferCardsOverTables: true,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: [
      "orderHeader",
      "itemList",
      "shipmentTimeline",
      "paymentSummary",
      "afterSalesEntry",
    ],
    primaryComponents: ["OrderSummaryCard", "Card", "Badge", "Button", "Timeline"],
    notes: [
      "Use block grouping rather than dozens of separators.",
      "Timeline should feel structured, not overdesigned.",
      "After-sales entry points should be visible but not alarming.",
    ],
    doNots: [
      "Do not scatter related payment and logistics facts into tiny disconnected cards.",
      "Do not hide support actions too deeply.",
    ],
  },
  adminAnalytics: {
    name: "Admin Analytics",
    description:
      "Higher-density internal analytics pattern that retains the shared type, radius, and interaction foundations.",
    realm: "admin",
    density: "compact",
    recommendedSectionGap: 6,
    minimumContainerPadding: 4,
    allowedDesktopRatios: ["8/4", "5/4/3", "60/40"],
    allowAsymmetry: false,
    allowGlass: false,
    allowEditorialImagery: false,
    allowTables: true,
    preferCardsOverTables: false,
    supportsLongCopy: true,
    feedback: {
      emptyRequiresPrimaryAction: true,
      loadingMirrorsLayout: true,
      errorRequiresRecoveryAction: true,
    },
    requiredBlocks: ["filters", "summaryMetrics", "charts", "table"],
    primaryComponents: ["Card", "Table", "Chart", "Sidebar", "Input", "Button"],
    notes: [
      "Chart tokens and stronger sidebar semantics are allowed here.",
      "Density may be compact, but focus and interaction clarity must remain consistent.",
    ],
    doNots: [
      "Do not back-port colorful analytics styling into user-facing product pages.",
      "Do not compromise text hierarchy for metric density.",
    ],
  },
} as const satisfies Record<string, DsPatternDefinition>;

export type DsPagePatternName = keyof typeof pagePatterns;

export const patternAdoptionSequence = [
  "editorialMasthead",
  "userProfileDashboard",
  "addressManagement",
  "productListing",
  "productDetail",
  "checkout",
  "orderHistory",
  "orderDetail",
  "adminAnalytics",
] as const satisfies readonly DsPagePatternName[];

export function getPattern(name: DsPagePatternName): DsPatternDefinition {
  return pagePatterns[name];
}

export function getPatternsByRealm(realm: DsRealm): DsPatternDefinition[] {
  return Object.values(pagePatterns).filter((pattern) => pattern.realm === realm);
}

export function getPatternsByDensity(density: DsDensityMode): DsPatternDefinition[] {
  return Object.values(pagePatterns).filter((pattern) => pattern.density === density);
}

export function patternAllowsGlass(name: DsPagePatternName): boolean {
  return pagePatterns[name].allowGlass;
}
