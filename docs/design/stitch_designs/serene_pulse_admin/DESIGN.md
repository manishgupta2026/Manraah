---
name: Serene Pulse Admin
colors:
  surface: '#faf9fc'
  surface-dim: '#dadadc'
  surface-bright: '#faf9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f6'
  surface-container: '#eeedf0'
  surface-container-high: '#e8e8eb'
  surface-container-highest: '#e3e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#484551'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f3'
  outline: '#797582'
  outline-variant: '#cac4d3'
  surface-tint: '#6251a8'
  primary: '#5f4ea5'
  on-primary: '#ffffff'
  primary-container: '#7867c0'
  on-primary-container: '#fffbff'
  inverse-primary: '#cbbeff'
  secondary: '#006b56'
  on-secondary: '#ffffff'
  secondary-container: '#88f7d6'
  on-secondary-container: '#00725c'
  tertiary: '#765631'
  on-tertiary: '#ffffff'
  tertiary-container: '#916e47'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cbbeff'
  on-primary-fixed: '#1d0061'
  on-primary-fixed-variant: '#4a388e'
  secondary-fixed: '#88f7d6'
  secondary-fixed-dim: '#6adaba'
  on-secondary-fixed: '#002018'
  on-secondary-fixed-variant: '#005140'
  tertiary-fixed: '#ffddba'
  tertiary-fixed-dim: '#eabf91'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#5e411e'
  background: '#faf9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e5'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Work Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 20px
  margin-mobile: 16px
  sidebar-width: 260px
---

## Brand & Style
The design system for the internal admin dashboard transitions from the consumer-facing serenity to a focus on **Operational Clarity**. It maintains a gentle, approachable atmosphere to reduce cognitive load for moderators and administrators handling sensitive data. 

The style is a blend of **Modern Corporate** efficiency and **Soft Minimalism**. It utilizes heavy whitespace and the signature soft roundedness of the consumer app to ensure that even high-pressure administrative tasks feel manageable and calm. The visual language emphasizes high-quality typography and a restrained use of the accent palette to highlight status and priority without inducing alarm.

## Colors
The palette is rooted in the **#FAF9FC** soft neutral background to keep the interface airy. 

- **Primary (#7C6BC4):** Used for primary actions, navigation states, and branding elements.
- **Accents (Mint & Peach):** Reserved for positive growth metrics and low-priority system notifications.
- **Severity Palette:** 
    - **Muted Amber (#FFB74D):** Denotes "Needs Review" or "Medium Priority" states.
    - **Muted Red (#E57373):** Reserved strictly for crisis tags, high-priority alerts, and destructive actions.

Surface colors for cards and containers should remain pure white (#FFFFFF) to pop against the off-white background.

## Typography
This design system employs a dual-font strategy to balance character with utility. 

- **Quicksand** is used for all headlines and page titles. Its rounded terminals mirror the UI’s geometry, maintaining the "Serene" brand identity.
- **Work Sans** is used for all functional text, data tables, and body copy. It provides the necessary professional rigor and legibility required for an administrative environment. 

Use `label-bold` in all-caps for table headers and small metadata tags to ensure clear distinction from interactive data points.

## Layout & Spacing
The layout follows a **Fixed Sidebar + Fluid Content** model. The sidebar remains at a constant 260px, while the main dashboard area expands to fill the screen, ensuring data tables can utilize the full horizontal real estate.

- **Grid:** A 12-column system is used within the main content area.
- **Rhythm:** An 8px base unit governs all padding and margins. 
- **Adaptation:** On tablet sizes, the sidebar collapses into a thin icon-only rail or a hamburger menu. Card gutters reduce from 24px to 16px to conserve space.

## Elevation & Depth
The design system uses **Tonal Layering** combined with **Ambient Shadows** to create a structured hierarchy.

1.  **Background:** #FAF9FC (Base level)
2.  **Cards & Containers:** White (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(124, 107, 196, 0.08)).
3.  **Modals & Popovers:** White (#FFFFFF) with a more pronounced shadow (0px 12px 32px rgba(0, 0, 0, 0.12)) to lift the element clearly above the data grid.

Avoid harsh borders; instead, use 1px solid strokes in a very light grey (#F0EEF5) only when elements need extra definition against a white background.

## Shapes
The shape language is a core differentiator. While typical admin panels are sharp and utilitarian, this design system uses generous radii to maintain the brand’s approachable nature.

- **Small Components (Buttons, Inputs):** 12px radius.
- **Medium Components (Cards, Tables):** 16px radius (`rounded-lg`).
- **Large Components (Modals, Feature Sections):** 24px radius (`rounded-xl`).
- **Status Tags:** Fully pill-shaped (rounded-full) to distinguish them from interactive buttons.

## Components

### Stat Cards
Standardized containers for KPIs. They should feature a `headline-sm` value, a `label-bold` title, and a small sparkline or percentage indicator using the Mint (positive) or Muted Red (negative) accents.

### Data Tables
Tables are the heart of the admin experience. 
- **Header:** Light grey background (#F8F7FA) with `label-bold` text.
- **Rows:** 1px border-bottom only. Use a subtle hover state (#F4F3F8).
- **Actions:** Grouped at the end of the row using ghost buttons (Primary color text, no background).

### Buttons
- **Primary:** Solid #7C6BC4 with white text.
- **Secondary:** Outlined Primary or Peach for less critical calls to action.
- **Severity:** Solid #E57373 for "Crisis" or "Block" actions.

### Search & Inputs
Search bars should be prominent, featuring a 12px radius and a subtle search icon. Input fields use a 1px #E0DEE7 border that thickens and changes to Primary color on focus.

### Crisis Tags
Specific to this dashboard, these tags use a light tint of the Severity Red as a background (e.g., #FEECEB) with the full #E57373 for the text, ensuring high visibility without visual vibration.