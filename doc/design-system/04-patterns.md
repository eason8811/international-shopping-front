# 04 Patterns

## 1. Purpose

This document defines reusable product-level layout patterns. It is the layer that translates components into business-facing screens.

## 2. Editorial Masthead

### 2.1 Use Cases
- homepage hero
- user welcome area
- collection and category lead-in
- seasonal or campaign landing blocks
- account dashboard header

### 2.2 Structure
1. serif display headline
2. sans supporting copy
3. mono metadata or label
4. one strong CTA
5. optional secondary CTA
6. large editorial image

### 2.3 Rules
- mild overlap between text and image is allowed
- whitespace must remain generous
- the CTA must remain immediately visible
- avoid stuffing mastheads with operational UI

## 3. User Profile Dashboard

### 3.1 Pattern Goals
- feel premium without becoming decorative
- prioritize account confidence and quick scanning
- organize functional modules into clear groups

### 3.2 Suggested Structure
- welcome / profile intro area
- profile summary and status controls
- order tracking or key action card
- preferences group
- security, notifications, help, and support as secondary groups

### 3.3 Rules
- avoid mini-dashboard tile overload
- use surface hierarchy and spacing instead of dividers
- cards should feel grouped, not randomly scattered
- one dark editorial tracking card is allowed as the visual anchor
- keep block naming and information hierarchy consistent across breakpoints
- on mobile, collapse navigation into a hamburger entry instead of a bottom tab bar

## 4. Address Management

### 4.1 Structure
- section header with one Add Address CTA
- address list or grid
- default address chip
- edit flow via dialog on desktop, sheet on mobile
- empty state for first-time users

### 4.2 Rules
- use spacing rather than divider lines between addresses
- default chip should signal priority without overpowering the card
- destructive actions must not visually outrank primary actions

## 5. Product Listing

### 5.1 Desktop
- editorial intro or campaign header is allowed
- filter and listing can use `4 / 8`, `3 / 9`, or `5 / 7` variants
- keep grid rhythm consistent once products begin

### 5.2 Mobile
- single-column structure first
- filters in sheet or drawer
- maintain stable media ratio

### 5.3 Rules
- do not let promotional framing bury search and filter utility
- product cards should remain scannable at first glance

## 6. Product Detail Page

### 6.1 Structure
- left media, right purchase information on desktop
- stacked flow on mobile
- core blocks: media, title/price, variant, CTA, shipping/trust, details

### 6.2 Rules
- this page balances editorial tone and conversion clarity
- buying controls must never feel secondary to decorative content
- trust indicators should be calm and integrated, not loud

## 7. Checkout

### 7.1 Principle
Checkout prioritizes trust, clarity, and task completion over editorial flourish.

### 7.2 Structure
- address
- shipping method
- payment method
- order summary
- final confirmation CTA

### 7.3 Rules
- use tonal layering, not theatrics
- asymmetry should be minimal
- no decorative glass treatment on core decision blocks
- errors must be direct and easy to resolve

## 8. Order History

### 8.1 Structure
- filter / status controls
- order card list or grouped timeline
- key facts surfaced first: date, status, amount, item summary

### 8.2 Rules
- default density should be Balanced
- avoid over-segmentation of each order line
- status chips are preferred over heavy icons and badges

## 9. Order Detail

### 9.1 Structure
- order header
- item list
- shipment / tracking timeline
- payment summary
- support / after-sales entry points

### 9.2 Rules
- use block grouping rather than dozens of separators
- timeline should feel structured, not over-designed
- after-sales and support actions should be visible but not alarming

## 10. Empty / Loading / Error Patterns

### 10.1 Empty
Use a calm editorial tone:
- concise serif or strong sans heading
- short explanation
- one CTA

### 10.2 Loading
Skeletons should mirror the expected final layout.

### 10.3 Error
- preserve structure
- use destructive semantics only where needed
- present recovery action clearly

## 11. User / Admin Pattern Split

### User Side
- editorial, spacious, neutral
- cards and surfaces feel curated
- business-critical flows stay calm and readable

### Admin Side
- denser and more utilitarian
- analytics and chart tokens are allowed
- still inherits the same typography and interaction foundations

## 12. Implementation Sequence

Recommended rollout order for production adoption:
1. foundation tokens and alias mapping
2. Button / Input / Card / Badge / Dialog / Sheet updates
3. `EditorialMasthead`, `AddressCard`, `OrderSummaryCard`
4. User Profile page as the first validation surface
5. Product Listing and Checkout refinements after validation
