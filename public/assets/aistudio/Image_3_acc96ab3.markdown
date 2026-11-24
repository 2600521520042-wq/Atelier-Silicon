---
name: Precision Retail Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d0d9fd'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#ebedff'
  surface-container-high: '#e3e7ff'
  surface-container-highest: '#dbe1ff'
  on-surface: '#111a36'
  on-surface-variant: '#45464d'
  inverse-surface: '#262f4c'
  inverse-on-surface: '#eff0ff'
  outline: '#76767e'
  outline-variant: '#c6c6ce'
  surface-tint: '#565d79'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131a33'
  on-primary-container: '#7b83a0'
  inverse-primary: '#bec5e5'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201c'
  on-tertiary-container: '#219385'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#bec5e5'
  on-primary-fixed: '#131a33'
  on-primary-fixed-variant: '#3e4660'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#8ff4e3'
  tertiary-fixed-dim: '#72d8c8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005047'
  background: '#faf8ff'
  on-background: '#111a36'
  surface-variant: '#dbe1ff'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  spec-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  badge:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style
The design system reflects a curated, high-end neighborhood electronics and computing boutique. It balances technical precision with warm retail service, conveying transparency, hardware mastery, and boutique care. 

The aesthetic is Modern High-Tech Editorial with functional minimalism:
- Crisp architectural lines and structured geometry.
- Balanced contrast between deep midnight navy foundation elements and immaculate, high-luminance canvas planes.
- Micro-luxuries: subtle luminous cyan highlights, micro-borders with translucent edge refraction, and deliberate, purposeful spacing.
- Direct conversational entry points via WhatsApp integration to reinforce neighborhood trust, on-demand consultation, and immediate hardware support.

## Colors
The palette balances authoritative hardware tones with vivid transactional accents:

- **Dominant Base & Contrast:** Primary `#0B132B` and Neutral `#1C2541` are reserved for structural framing, deep headers, top-tier badges, and high-emphasis typography.
- **Canvas & Surface Architecture:** Primary background surfaces rely on `#F8FAFC` to reduce mobile glare, transitioning to `#FFFFFF` for elevated product cards, spec sheets, and transactional sheets.
- **Tech Accent & Micro-glows:** `#2563EB` and `#3B82F6` drive standard navigational CTAs, active filters, and interactive selections. A controlled `#00D2FF` electric cyan glow token is used exclusively for live status pings, warranty validation badges, and high-performance spec callouts.
- **Direct-to-Consultant Channel:** Tertiary `#128C7E` paired with `#25D366` delivers an immediate, unmissable, yet visually harmonious conduit for real-time inventory checks, bespoke PC quote builds, and click-to-chat commerce.
- **Borders & Dividers:** Built using low-opacity tint overlays (`rgba(28, 37, 65, 0.08)` to `rgba(28, 37, 65, 0.12)`) on light canvases to preserve structural crispness without visual clutter.

## Typography
The system couples **Plus Jakarta Sans** for headlines and numeric product specifications with **Inter** for descriptions, micro-copy, and technical labels.

- **Plus Jakarta Sans:** Provides wide geometric apertures and deliberate terminal cuts, lending a modern, high-precision electronic display feel. Tightened negative tracking on all titles prevents layout drift on compact mobile screens.
- **Inter:** Ensures maximum legibility at small sizes across complex hardware specs (e.g., clock speeds, RAM variations, interface dimensions).
- **Tabular & Numeric Emphasis:** Use the `spec-num` style for benchmark metrics, serial pricing, and stock counters.
- **Micro-Badges:** Capitalized, letter-spaced `badge` tokens define technical categories (e.g., `OLED`, `DDR5`, `RTX READY`).

## Layout & Spacing
A 4-column fluid mobile grid built on an 8-point spatial base with an interpolated 4-point micro-scale.

- **Canvas Frame:** Outer screen margin is fixed at `1rem` (16px) on mobile viewports (<640px) to balance thumb reach with content width. 
- **Column Gaps:** Gutter of `0.75rem` (12px) permits high-density, twin-column product listings without horizontal clipping or text truncation.
- **Vertical Rhythm:** 
  - Micro distances (`space-xs`, `space-sm`) structure relationship between spec labels, stock indicators, and price tags.
  - Component padding uses `space-md` internally for badges and buttons, and `space-lg` for card internal framing.
  - Section separations utilize `space-xl` to establish clear visual breaks between hardware categories, flash deals, and consultation sections.

## Elevation & Depth
Elevation is rendered through layered surface tones paired with delicate ambient occlusions and low-contrast borders:

- **Flat/Canvas (Level 0):** `#F8FAFC` base screen layer, grounded and shadowless.
- **Elevated Interactive Card (Level 1):** Solid `#FFFFFF` surface accompanied by a hairline border (`1px solid rgba(28, 37, 65, 0.08)`) and an ultra-diffused shadow: `0px 4px 16px -2px rgba(11, 19, 43, 0.05)`.
- **Floating Modals, Quick-Cart & Fixed CTA Bar (Level 2):** Elevated `#FFFFFF` backdrop with a dual shadow: `0px 8px 24px -4px rgba(11, 19, 43, 0.08), 0px 2px 6px -1px rgba(11, 19, 43, 0.04)`.
- **Electric Accent Glow:** Used sparingly on primary action items and badge callouts. Rendered using a targeted cyan aura: `0px 0px 12px 0px rgba(0, 210, 255, 0.35)` to convey cutting-edge performance.
- **WhatsApp Consult Layer:** Floating or docked at bottom right with high-visibility separation: `0px 6px 20px -2px rgba(18, 140, 126, 0.35)`.

## Shapes
A roundedness tier of `2` provides a balance between technical precision and modern consumer tactile comfort:

- Standard elements (interactive inputs, action buttons, spec chips) adopt `0.5rem` (8px) corner radii.
- Product display cards, bottom sheets, and hero banners scale to `rounded-lg` (`1rem` / 16px).
- Bottom sheets and consultation dialogs extend to `rounded-xl` (`1.5rem` / 24px) along top edges for a clear mobile sheet visual cue.
- Status pings, stock tags, and micro-metric chips use pill geometry (`rounded-full`) to differentiate metadata from actionable rectangular UI blocks.

## Components

### Buttons
- **Primary Transactional:** Deep `#0B132B` background with crisp white typography, `0.5rem` radius, 48px target height for mobile touch ergonomics. Micro active state scales to `0.98`.
- **Tech Accent (Buy Now / Reserve):** Solid `#2563EB` fill with optional active micro-glow: `box-shadow: 0 0 14px rgba(37, 99, 235, 0.4)`.
- **WhatsApp Concierge:** `#128C7E` base transitioning to `#25D366` hover/active icon highlights. Accompanied by official chat vector icon and bold, high-clarity label: *"Chat with Hardware Tech"*.
- **Ghost/Outline:** `1px solid rgba(28, 37, 65, 0.15)` border, neutral `#1C2541` text, transparent background.

### Product Cards
- Contained `#FFFFFF` surfaces with subtle border stroke (`1px solid rgba(28, 37, 65, 0.07)`).
- Two-tier header structure: top metadata bar houses local store pickup availability (green dot) and category chip.
- High-fidelity square image container with ultra-soft cool gray background (`#F1F5F9`) providing natural isolation for laptops, components, and boxed hardware.
- Multi-tier typography grouping: Brand (small uppercase label), Model Name (semibold truncated), Technical Spec snippet (muted), followed by Price in `Plus Jakarta Sans` bold.

### Tech Chips & Spec Badges
- **Specification Pill:** Height 24px, `#F1F5F9` background, `#1C2541` text, `0.25rem` radius. Concise technical tags (e.g., `32GB DDR5`, `1TB NVMe`, `240Hz`).
- **Stock Indicators:** 
  - In Stock (Local Store): Light mint container (`#DCFCE7`) with deep green dot and text (`#166534`).
  - Low Inventory: Amber tone (`#FEF3C7`) with warning label.

### Form Inputs & Search
- Surface: `#FFFFFF` with `1px solid rgba(28, 37, 65, 0.16)`.
- Focus state: Border transitions to `#2563EB` with an ambient ring: `0 0 0 3px rgba(37, 99, 235, 0.12)`.
- Search bars include integrated clear action and instant filter shortcuts for local stock vs. online catalog.

### Checkboxes & Selection Toggles
- Custom `20x20px` checkboxes with `0.25rem` radius.
- Unchecked: Inset hairline border with `#FFFFFF` background.
- Checked: `#2563EB` fill with a high-contrast white check glyph.

### Sticky Bottom Mobile Action Bar
- Anchored to the mobile viewport base with a subtle top border and high-order shadow.
- Dual-action split layout: Left partition features instantaneous WhatsApp consultation button; right partition carries primary "Reserve for Pickup" or "Add to Build" button.