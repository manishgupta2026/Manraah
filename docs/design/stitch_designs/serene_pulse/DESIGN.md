---
name: Serene Pulse
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded6f0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f1ff'
  surface-container: '#f2ebff'
  surface-container-high: '#ece4fe'
  surface-container-highest: '#e6dff8'
  on-surface: '#1d192b'
  on-surface-variant: '#484551'
  inverse-surface: '#322e41'
  inverse-on-surface: '#f5eeff'
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
  tertiary: '#874959'
  on-tertiary: '#ffffff'
  tertiary-container: '#a46172'
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
  tertiary-fixed: '#ffd9e0'
  tertiary-fixed-dim: '#ffb1c3'
  on-tertiary-fixed: '#38091a'
  on-tertiary-fixed-variant: '#6e3444'
  background: '#fdf7ff'
  on-background: '#1d192b'
  surface-variant: '#e6dff8'
typography:
  display-lg:
    fontFamily: Quicksand
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-padding-mobile: 20px
  container-padding-desktop: 64px
---

## Brand & Style

The design system is centered on "Compassionate Clarity." It aims to bridge the gap between high-tech AI capabilities and the soft, organic nature of human wellness. The brand personality is that of a supportive companion—calm, observant, and unfailingly warm. It avoids the cold, sterile aesthetic of clinical health apps in favor of a lifestyle-oriented "Wellness Sanctuary."

The visual style utilizes a refined **Modern-Organic** approach. This involves:
- **Softness over Structure:** Using high-radius curvatures to eliminate visual tension.
- **Atmospheric Depth:** Implementing multi-layered, low-opacity shadows and gentle background blurs to create a sense of lightness and breathability.
- **Human-Centric Illustration:** Integrating hand-drawn, diverse characters in serene environments to reinforce the feeling of being understood and represented.
- **Dynamic Adaptability:** The system uses "Mood Accents"—shifting primary highlights based on the user's emotional state or demographic category (e.g., warmer tones for Seniors, energetic mints for Students).

## Colors

The palette is designed to be soothing yet functional, using a lavender-tinted neutral base to keep the interface feeling premium and intentional.

- **Primary Purple (#7C6BC4):** Used for core brand moments, primary actions, and navigational active states.
- **Secondary Mint/Teal (#5FCFB0):** Reserved for "Calm" zones, breathing exercises, and success states.
- **Mood Accents:** 
  - **Soft Pink (#F4A6B8):** Emotional tracking and empathy-driven feedback.
  - **Peach (#F5C99B):** Professional support and human-led interactions.
  - **Pale Yellow (#F5E6A8):** Reflection, journaling, and light-hearted moments.
- **Text & UI:** Headings use a deep charcoal-purple (#2E2A3D) to maintain contrast without the harshness of true black. Body text should use a 70% opacity version of this color for a softened, more approachable reading experience.

## Typography

This design system uses a dual-type strategy to balance personality with legibility. 

**Quicksand** is used for all headlines and display text. Its rounded terminals and open apertures feel inherently friendly and optimistic. Large display sizes should use a slightly tighter letter-spacing to maintain a modern, cohesive look.

**Work Sans** is used for all body copy, inputs, and labels. It provides a grounded, professional contrast to the rounded headlines, ensuring that long-form content (like journal entries or therapeutic articles) remains highly readable and doesn't feel overly juvenile. 

For mobile devices, headline sizes are scaled down by ~15% to ensure they don't overpower the limited screen real estate, while maintaining the characteristic "soft-bold" weights.

## Layout & Spacing

The layout philosophy relies on **Generous Whitespace** to reduce cognitive load and promote a sense of calm. 

- **Grid Model:** A 12-column fluid grid for desktop with 24px gutters. On mobile, a 4-column grid with 16px gutters.
- **Vertical Rhythm:** A strict 8px baseline grid ensures alignment. Use larger vertical gaps (48px+) between distinct sections to allow the content to "breathe."
- **Content Widths:** To ensure readability, body text containers should never exceed 680px, even on wide desktop screens. 
- **Safe Areas:** Maintain a minimum 20px margin from screen edges on mobile to ensure UI elements don't feel cramped near the device bezel.

## Elevation & Depth

Depth in this design system is created through "Soft Diffusion" rather than physical edges. 

- **Ambient Shadows:** Surfaces use multi-layered shadows with a high blur radius (30px-50px) and very low opacity (5-8%). Shadows should be slightly tinted with the Primary Purple (#7C6BC4) to avoid "dirty" grey looks.
- **Tonal Layering:** The main background is `#FAF9FC`. Interactive cards should use pure white `#FFFFFF` to subtly lift off the background without needing heavy borders.
- **Glassmorphism:** For overlays like navigation bars or modal backdrops, use a 20px background blur with a 60% white tint. This maintains context of the screen behind while focusing the user's attention.
- **Gradients:** Use very subtle, linear gradients (Top-Left to Bottom-Right) for primary buttons and progress bars to create a tactile, "squishy" feel.

## Shapes

The shape language is defined by the **Total Absence of Sharp Corners**. 

Standard UI components like cards and input fields utilize a `16px` radius (`rounded-lg`). For larger containers or prominent feature cards, use a `24px` radius (`rounded-xl`). 

Buttons and small chips should utilize "Full Rounding" (Pill-shaped) to maximize the friendly, approachable aesthetic. These circular shapes help guide the eye and make the interface feel safe and non-threatening.

## Components

- **Buttons:** Primary buttons are pill-shaped with a soft gradient of Primary Purple. They should have a subtle "lift" shadow that expands slightly on hover to provide tactile feedback.
- **Cards:** Cards use a `24px` corner radius and a white background. They should not have borders; instead, they rely on the Ambient Shadow to define their boundaries against the off-white background.
- **Input Fields:** Search bars and text inputs use a `16px` radius and a very light purple-tinted stroke (1px). Focus states should glow with a soft Primary Purple outer shadow.
- **Chips & Tags:** Small, pill-shaped tags used for mood categories or user tags. They should use 15% opacity versions of the Mood Accent colors with dark text to ensure accessibility while maintaining softness.
- **Lists:** List items are separated by generous padding rather than lines. When a divider is necessary, use a subtle 1px dashed line in a light lavender tint to keep the look "sketch-like" and informal.
- **Progress Bars:** Use thick, rounded tracks (12px height) with the Mint/Teal secondary color for a sense of healthy growth and progress.