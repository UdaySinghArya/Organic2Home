---
name: Farm Fresh Direct
colors:
  surface: '#f0fdf0'
  surface-dim: '#d1ddd1'
  surface-bright: '#f0fdf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf7ea'
  surface-container: '#e4f1e5'
  surface-container-high: '#dfecdf'
  surface-container-highest: '#d9e6d9'
  on-surface: '#131e16'
  on-surface-variant: '#3f493f'
  inverse-surface: '#28332b'
  inverse-on-surface: '#e7f4e7'
  outline: '#6f7a6e'
  outline-variant: '#becabc'
  surface-tint: '#006d33'
  primary: '#006b31'
  on-primary: '#ffffff'
  primary-container: '#238545'
  on-primary-container: '#f7fff3'
  inverse-primary: '#7cda91'
  secondary: '#a93707'
  on-secondary: '#ffffff'
  secondary-container: '#fe7443'
  on-secondary-container: '#651c00'
  tertiary: '#735800'
  on-tertiary: '#ffffff'
  tertiary-container: '#917000'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#98f7ab'
  primary-fixed-dim: '#7cda91'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005225'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59d'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#832600'
  tertiary-fixed: '#ffdf95'
  tertiary-fixed-dim: '#f0c03e'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#f0fdf0'
  on-background: '#131e16'
  surface-variant: '#d9e6d9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.04em
  price-num:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 22px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-2xs: 4px
  space-xs: 8px
  space-sm: 12px
  space-md: 16px
  space-lg: 20px
  space-xl: 24px
  space-2xl: 32px
  space-3xl: 40px
  space-4xl: 48px
  gutter-mobile: 16px
  gutter-desktop: 24px
  container-max: 1080px
---

## Brand & Style

The design system embodies the warmth, honesty, and grounded optimism of a direct-from-the-soil morning harvest. Built for households seeking wholesome, unadulterated produce, the interface communicates zero warehouse latency: picked today at dusk, placed on your doorstep tomorrow dawn. 

The aesthetic is Tactile Farm-Minimalism:
- Abundant, breathable warm cream whitespace replacing cold tech neutrals.
- Natural, organic rounded geometries that mimic garden beds and fresh produce.
- Crisp, unpretentious editorial hierarchy that treats daily harvests like a handwritten morning chalkboard menu.
- High-contrast touch targets prioritizing effortless mobile ordering for busy early mornings and relaxed evenings.
- No cold clinical glass surfaces, dark themes, techy maps, or cluttered admin sidebars; every screen feels like an open-air morning market stand bathed in sunlight.

## Colors

The palette directly reflects the cycle of planting, sunlight, and soil. 

- **Primary (`#2F8F4E` - Leaf Green)**: Symbolizes vitality, life, and freshness. Used for brand markers, active navigation states, product category pills, success indicators, and secondary outlined interactive states.
- **Secondary (`#F06A3A` - Harvest Orange)**: Strictly reserved for high-intent primary calls to action ("Add to Basket", "Place Morning Order", "Confirm Harvest Slot"). It holds an exclusive visual monopoly across the UI so checkout vectors are instantly recognizable.
- **Tertiary (`#F5C542` - Sun Yellow)**: Dedicated to time-critical harvest alerts, cutoff countdowns ("Order in next 42 mins for tomorrow 6 AM delivery"), and the iconic signature "Kal Aayega" (Harvested for Tomorrow) badge.
- **Neutral Primary (`#1F2A22` - Deep Ink)**: An earthy, ultra-deep woodland green-charcoal used for all body text, headings, and high-contrast structural iconography. It avoids the harshness of pure black while retaining AA/AAA compliance on all cream and white surfaces.
- **Canvas Base (`#FFF8EE` - Warm Cream)**: The non-negotiable global canvas ground. Provides a soft, morning glow that reduces eye fatigue and eliminates clinical sterility.
- **Surface Elevation (`#FFFFFF` - Pure Card White)**: Used purely on elevated product cards, modals, and bottom action sheets to create crisp, appetizing separation from the warm cream canvas.
- **Subtle Surface Border (`#F0E6D6` - Soft Earth)**: A delicate, warm separator used for card outlines, dividers, and inactive input strokes.

## Typography

The typographic hierarchy utilizes Plus Jakarta Sans throughout, deploying its humanist geometric proportions to maintain an approachable, community-oriented storefront cadence. 

- Large display headlines focus on freshness propositions and harvest timers.
- Tight negative tracking (`-0.01em` to `-0.02em`) on headings keeps bold weights compact and punchy.
- Numerical characters in prices and harvest quantities use bold tabular metrics (`800` weight) for instant glanceability.
- Micro-labels (`label-sm`) use uppercase styling with positive letter spacing (`0.04em`) to ensure legibility when overlaid on Sun Yellow badges or Leaf Green tags.

## Layout & Spacing

This design system uses a centered, fluid-responsive container model without complex multi-tiered sidebars, keeping full attention on the morning harvest inventory.

- **Mobile (< 768px)**: 
  - Single-column flow with a fixed 2-column card grid for catalog views.
  - Page gutters set strictly to `16px`.
  - Bottom navigation bar floating cleanly above safe areas.
  - Sticky bottom action drawer for checkout and cart state.
- **Tablet & Desktop (≥ 768px)**:
  - Max container width constrained to `1080px` centered against the warm cream canvas, preserving an intimate boutique market feel rather than an endless enterprise warehouse catalog.
  - Catalog shifts to an ergonomic 3 or 4-column responsive grid with `20px` to `24px` gutters.
- **Vertical Rhythm**:
  - Components adhere strictly to an 8px baseline rhythm (multiples of 4px for micro badge offsets).
  - Generous section padding (`32px` to `48px`) ensures whitespace feels tranquil, uncluttered, and unhurried.

## Elevation & Depth

Visual depth is achieved through gentle ambient warmth rather than synthetic grey dropshadows, ensuring white cards feel naturally resting upon the cream earth canvas.

- **Card Level (Resting)**:
  `box-shadow: 0 4px 16px -2px rgba(60, 40, 10, 0.05), 0 2px 6px -1px rgba(60, 40, 10, 0.03);`
  Tinted with deep warm umber rather than cold black, creating a sunny morning radiance. Cards also carry a subtle `1px solid #F0E6D6` border to define crisp bounds.
- **Interactive Hover / Tap**:
  `box-shadow: 0 10px 24px -4px rgba(60, 40, 10, 0.08), 0 4px 8px -2px rgba(60, 40, 10, 0.04);`
  Transform translateY(-2px) for gentle organic lift.
- **Floating Cart & Sticky Bars**:
  `box-shadow: 0 -4px 20px 0 rgba(31, 42, 34, 0.06);` with a top border in `#F0E6D6`.
- **Modals & Bottom Drawers**:
  Elevated with a deep atmospheric shadow `0 20px 40px -8px rgba(31, 42, 34, 0.16)` backed by an earth-tinted backdrop scrim: `rgba(31, 42, 34, 0.4)`.

## Shapes

The design system embraces an ultra-soft, friendly geometry:

- **Cards**: Fixed precisely at `20px` corner radii (`1.25rem`), creating an organic pebble-like foundation that avoids sharp industrial corners.
- **Buttons, Badges, and Chips**: Full pill shape (`9999px`), offering inviting, finger-friendly targets that feel tactile and playful.
- **Inputs & Form Controls**: Rounded pill (`9999px`) for search and quantity steppers; `16px` for multi-line inputs and checkout panels.
- **Imagery**: Produce photos always sit with matched internal radii (`16px` inside cards) or soft circular silhouettes for farmer profiles and harvest origins.

## Components

### Buttons
- **Primary Action (CTA)**: Harvest Orange (`#F06A3A`) fill, pure white bold text, pill-shaped (`9999px`). High-hit touch targets (`height: 48px` minimum on mobile). Strictly reserved for cart checkout and main conversion triggers.
- **Secondary Action**: White fill or transparent with a 2px Leaf Green (`#2F8F4E`) stroke, Leaf Green bold text. Used for "View Farm Details", filters, or category navigation.
- **Quantity Selector Pill**: Leaf Green background or soft cream fill with deep ink icons (`+` / `-`) and bold quantity number, housed in a unified pill container for quick incremental changes.

### Harvest & Delivery Badges
- **"Kal Aayega" Badge**: Vibrant Sun Yellow (`#F5C542`) background with Deep Ink (`#1F2A22`) bold text (`label-sm`), styled as a compact pill with a small sun or sprout glyph. Pinned to the top corner of product cards to continuously reinforce next-morning arrival.
- **Harvest Cutoff Alert Banner**: Soft Sun Yellow fill (`#FEF7DC`), deep ink typography, placed prominently on top of the catalog to show live countdowns ("Harvest starting at 6 PM. Order within 1 hr 12 m").

### Product Cards
- Pure White (`#FFFFFF`) surface, fixed `20px` border radius, subtle `1px solid #F0E6D6` stroke, and warm ambient drop shadow.
- Top section houses the farm photograph or fresh produce image on clean transparent/neutral background with the Sun Yellow "Kal Aayega" badge anchored top-left.
- Bottom section features: Produce name in `headline-sm`, unit size/weight in muted `body-sm` (`#6B776D`), harvest location tag, price formatted in `price-num`, and the pill-shaped add/stepper button.

### Category Chips
- Horizontal scrolling carousel of pill buttons (`roundedness: 3`).
- **Active State**: Leaf Green (`#2F8F4E`) fill with pure white text.
- **Inactive State**: Pure White (`#FFFFFF`) fill with `1px solid #F0E6D6` border and Deep Ink text.

### Inputs & Search
- Generously padded (`14px 20px`), full pill shape, white background with soft earth border (`#F0E6D6`).
- Focus state activates a distinct 2px Leaf Green outline without harsh browser rings.

### Farm Origin Tag
- Micro-component showing the specific farmer's name and village km distance, rendered in muted leafy tones to anchor trust and soil authenticity before the customer adds to bag.