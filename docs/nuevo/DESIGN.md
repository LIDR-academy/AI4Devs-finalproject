---
name: Innovation & Traceability System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#747683'
  outline-variant: '#c4c6d3'
  surface-tint: '#3d5aad'
  primary: '#001851'
  on-primary: '#ffffff'
  primary-container: '#002b7f'
  on-primary-container: '#7c97ef'
  inverse-primary: '#b5c4ff'
  secondary: '#006970'
  on-secondary: '#ffffff'
  secondary-container: '#4df2ff'
  on-secondary-container: '#006c73'
  tertiary: '#001e3e'
  on-tertiary: '#ffffff'
  tertiary-container: '#003363'
  on-tertiary-container: '#4b9dff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#224194'
  secondary-fixed: '#7cf4ff'
  secondary-fixed-dim: '#24dbe8'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a5c8ff'
  on-tertiary-fixed: '#001c3a'
  on-tertiary-fixed-variant: '#004786'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  deep-navy: '#001A4D'
  electric-cyan: '#00E5FF'
  soft-glass: rgba(255, 255, 255, 0.7)
  accent-glow: rgba(30, 144, 255, 0.15)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built for a high-tech, AI-driven environment. It balances the rigor of software traceability with the fluid innovation of artificial intelligence. The aesthetic is **Modern Corporate** with a heavy influence of **Glassmorphism**, communicating transparency and precision.

The mood is authoritative yet accessible. We achieve this by using a high-contrast foundation—anchored by a deep institutional blue—layered with vibrant, luminous gradients that represent the "energy" of AI processing. The interface feels cutting-edge through the use of blurred background surfaces, subtle light-leaks, and generous negative space that allows complex data to breathe.

## Colors

The palette is centered around "Deep Blue" (#002B7F), extracted from the core of the brand identity to evoke stability and trust. This is contrasted against a "Luminous Cyan" gradient that serves as the primary action color, symbolizing the active state of AI.

The primary background is a very light gray (#F8FAFC) to ensure a clean, modern SaaS feel. Dark mode elements should be used for sidebars or specific "Intelligence" dashboards to create a clear visual hierarchy between standard management tools and AI insights. Gradients should always move from #002B7F toward #00D2DF at a 135-degree angle to mimic the flow of data within the logo.

## Typography

We use **Inter** exclusively to maintain a systematic and utilitarian feel that is essential for developer-centric tools. The typography system relies on significant weight contrast to establish hierarchy.

Headlines are bold and authoritative, using tighter letter-spacing to feel "locked-in" and professional. Body text maintains a generous line height (1.5x) to ensure legibility when reading long-form traceability reports or technical documentation. Labels should be used for metadata and chip components, utilizing medium weights and subtle uppercase styling to differentiate them from interactive body text.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, optimized for a maximum width of 1440px. We use generous external margins (64px) to create an expansive, premium feel that avoids the "cluttered" look often found in legacy enterprise software.

Spacing follows an 8px base grid. For content-heavy dashboards, use a "loose" spacing rhythm (32px between sections) to reduce cognitive load. On mobile, the 12-column grid collapses to a 4-column structure with reduced 20px margins, prioritizing vertical stack order for data tables and AI insights.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Tonal Layers**. Rather than traditional heavy shadows, we use:

1.  **Backdrop Blurs:** Surfaces should use a 12px to 20px blur with a semi-transparent white fill (70-80% opacity) to allow background colors to bleed through.
2.  **Inner Glows:** To simulate "active" high-tech components, cards can use a subtle 1px white inner border (top and left) to create a light-catching edge.
3.  **Ambient Shadows:** For floating elements like modals, use a very large, soft blue-tinted shadow (`rgba(0, 43, 127, 0.08)`) with a 40px blur to make them feel weightless.
4.  **Accentuation:** Use subtle external glows (5px-10px) on primary action buttons and active AI status indicators to highlight their importance.

## Shapes

The design system utilizes **Rounded** corners (minimum 16px for standard cards) to soften the technical nature of the product, making the AI feel more approachable and user-friendly. 

Interactive elements like buttons use a slightly smaller radius (8px to 12px) to feel more precise, while large layout containers and glassmorphic cards should use the full 16px to 24px radius to emphasize the "pod" or "module" look common in modern SaaS interfaces.

## Components

### Buttons
- **Primary:** Features a linear gradient from Deep Blue to Luminous Cyan. Text is white, bold, and center-aligned.
- **Secondary:** Transparent background with a 1.5px border in Deep Blue. 
- **AI-Action:** A specific glassmorphic button with an "Electric Cyan" outer glow to signify an AI-generated suggestion or action.

### Cards
- Standard cards use the glassmorphism style: `backdrop-filter: blur(16px)`, white fill at 75% opacity, and a 16px border radius.
- Cards should have a 1px border using a very light blue tint to define edges against the white background.

### Input Fields
- Fields are "soft-filled" with a 12px radius. The border is neutral-gray, turning into a 2px Deep Blue border on focus with a subtle Cyan outer glow.

### Chips & Badges
- Used for traceability status (e.g., "Linked", "Missing", "AI-Verified"). 
- AI-Verified badges should always use the Luminous Cyan background with white text and a small sparkle icon.

### Data Lists
- Lists should utilize horizontal dividers with 5% opacity to maintain a clean look. Hover states on list items should apply a very subtle blue tint (#F1F5FF) and increase the border-radius slightly to 8px.