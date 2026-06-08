# Aura Planning Style Guide

> Design system documentation extracted from `business-documentation/Aura.pen`

---

## Design Principles

1. **Warm & Elegant** — Use cream backgrounds with earthy tones to create a sophisticated, inviting feel
2. **Organic Shapes** — Prefer generous corner radii (12-16px) over sharp corners
3. **Subtle Depth** — Use soft shadows and light borders for layering without heavy contrast
4. **Typography Hierarchy** — Playfair Display for headings (elegant serif), Inter for body (clean sans-serif)
5. **Consistent Spacing** — Follow 4px base unit with multiples: 4, 8, 12, 16, 24, 32, 40, 48, 64

---

## Color Palette

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#7C9A72` | Primary actions, success states, logo arc |
| `primary-dark` | `#5C7A52` | Hover states for primary |
| `primary-light` | `#A8C5A0` | Light backgrounds, subtle accents |
| `accent` | `#C9A96E` | Secondary accent, logo middle arc, highlights |
| `accent-light` | `#E0C992` | Hover states for accent elements |
| `secondary` | `#C4918E` | Complementary accent |
| `secondary-light` | `#DDB5B2` | Light secondary backgrounds |

### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-cream` | `#FDFBF7` | Page background (default) |
| `bg-surface` | `#F5F0E8` | Card backgrounds on cream, input backgrounds |
| `bg-dark` | `#2D2A26` | Footer, dark sections |
| `card-bg` | `#FFFFFF` | Elevated cards |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#2D2A26` | Headings, primary content |
| `text-secondary` | `#6B6560` | Body text, descriptions |
| `text-muted` | `#9B9590` | Captions, placeholders, muted labels |
| `text-inverse` | `#FDFBF7` | Text on dark backgrounds |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `border` | `#E8E0D4` | Default borders on light backgrounds |
| `border-light` | `#F0EBE3` | Subtle card borders |

### Semantic Colors

| Token | Hex | Background | Usage |
|-------|-----|-----------|-------|
| `color-success` | `#7C9A72` | `color-success-bg` (`#F0F5EE`) | Confirmed states |
| `color-warning` | `#D4A054` | `color-warning-bg` (`#FDF6EC`) | Pending states |
| `color-error` | `#C47070` | `color-error-bg` (`#FDF0EF`) | Error, cancelled states |
| `color-info` | `#7A9EB5` | `color-info-bg` (`#EEF5F9`) | Informational states |

---

## Typography

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `font-heading` | `Playfair Display` | Headlines, titles, brand name |
| `font-body` | `Inter` | Body text, labels, UI elements |
| `font-caption` | `Inter` | Small captions, metadata |

### Type Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Display | Playfair Display | 56px | Normal (400) | 1.2 |
| H1 | Playfair Display | 36px | Normal (400) | 1.2 |
| H2 | Playfair Display | 28px | Normal (400) | 1.2 |
| H3 | Playfair Display | 24px | Normal (400) | 1.2 |
| H4 | Playfair Display | 20px | Normal (400) | 1.2 |
| H5 | Playfair Display | 18px | Normal (400) | 1.2 |
| Body Large | Inter | 18px | Normal (400) | 1.5 |
| Body | Inter | 16px | Normal (400) | 1.5 |
| Body Small | Inter | 14px | Normal (400) | 1.5 |
| Caption | Inter | 13px | Normal (400) | 1.4 |
| Label | Inter | 12px | Medium (500) | 1.4 |
| Overline | Inter | 10px | Normal (400) | 1.4, letter-spacing: 3px |

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px | Tight spacing, icon gaps |
| `spacing-2` | 8px | Small gaps between related elements |
| `spacing-3` | 12px | Medium-small spacing |
| `spacing-4` | 16px | Default spacing between elements |
| `spacing-6` | 24px | Section gaps, padding |
| `spacing-8` | 32px | Large gaps between sections |
| `spacing-10` | 40px | XL spacing |
| `spacing-12` | 48px | XXL spacing |
| `spacing-16` | 64px | Section dividers |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Small elements, badges |
| `radius-md` | 12px | Buttons, inputs, medium cards |
| `radius-lg` | 16px | Large cards, modals |
| `radius-full` | 999px | Pills, avatars, fully rounded |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `#00000008` (8% opacity) | Subtle elevation, hover states |
| `shadow-md` | `#0000000D` (13% opacity) | Cards, dropdowns |
| `shadow-lg` | `#00000012` (18% opacity) | Modals, elevated panels |

---

## Components

### Buttons

**Primary Button**
- Background: `primary` (`#7C9A72`)
- Text: White (`#FFFFFF`)
- Font: Inter 14px Medium
- Padding: 12px vertical, 24px horizontal
- Corner radius: `radius-md` (12px)
- States: Hover darkens to `primary-dark`

**Secondary Button**
- Background: Transparent
- Text: `text-primary`
- Border: 1px `border`
- Padding: 12px vertical, 24px horizontal
- Corner radius: `radius-md` (12px)

**Ghost Button**
- Background: Transparent
- Text: `text-primary`
- No border
- Padding: 12px vertical, 24px horizontal
- Corner radius: `radius-md` (12px)

**Danger Button**
- Background: `color-error` (`#C47070`)
- Text: White
- Font: Inter 14px Medium
- Padding: 12px vertical, 24px horizontal
- Corner radius: `radius-md` (12px)

### Form Inputs

**Text Input Field**
- Label: Inter 13px Medium, `text-primary`
- Input container: `card-bg` with 1px `border`
- Placeholder: Inter 14px, `text-muted`
- Error message: Inter 12px, `color-error`
- Corner radius: `radius-md` (12px)
- Padding: 12px vertical, 16px horizontal

### Badges / Status Pills

**Structure**
- Padding: 6px vertical, 12px horizontal
- Corner radius: `radius-full` (999px)
- Font: Inter 12px Medium

**Variants**

| State | Background | Text Color |
|-------|------------|------------|
| Pending | `color-warning-bg` (`#FDF6EC`) | `color-warning` (`#D4A054`) |
| Confirmed | `color-success-bg` (`#F0F5EE`) | `color-success` (`#7C9A72`) |
| Cancelled | `color-error-bg` (`#FDF0EF`) | `color-error` (`#C47070`) |

### Cards

**Standard Card**
- Background: `card-bg` (`#FFFFFF`)
- Border: 1px `border-light`
- Corner radius: `radius-lg` (16px)
- Padding: 24px
- Shadow: `shadow-md`

**Event Card**
- Image placeholder: `bg-surface`, 160px height
- Content padding: 16px
- Corner radius: `radius-lg` (16px)
- Border: 1px `border-light`

### Avatar

- Shape: Circle (`radius-full`)
- Size: 40px diameter (default)
- Background: `bg-surface`
- Text: Inter 14px Medium, `text-secondary`
- Content: Initials (2 characters)

### Navigation Bar

- Height: 64px
- Background: `card-bg`
- Border bottom: 1px `border-light`
- Horizontal padding: 32px
- Logo: Playfair Display 20px
- Nav links: Inter 14px, `text-secondary`, 32px gap
- User menu gap: 12px

### Empty State

- Icon container: 80px circle, `bg-surface`, centered icon stroke `text-muted`
- Title: Playfair Display 20px, `text-primary`
- Description: Inter 14px, `text-secondary`, max-width for text wrapping
- Padding: 48px
- Gap between elements: 16px

### Stats/Metric Card

- Background: `card-bg`
- Border: 1px `border-light`
- Corner radius: `radius-lg` (16px)
- Padding: 24px
- Label: Inter 13px, `text-secondary`
- Value: Playfair Display 32px, `text-primary`

---

## Layout Guidelines

### Page Structure

- Default page background: `bg-cream`
- Content max-width: 1200px
- Section padding: 32px horizontal (mobile: 16px)
- Vertical rhythm: 32px between major sections

### Card Layout

- Card gap: 24px
- Card width: 280-320px typical
- Grid: Auto-fit with min 280px columns

### Button Groups

- Button gap: 16px
- CTA buttons: 16px gap

---

## Accessibility

- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus states: Visible outline using brand colors
- Interactive elements: Minimum 44px touch target
- Text sizing: Use relative units where possible for scaling

---

## Icon Guidelines

- Library: Lucide (default), Feather (alternative)
- Stroke width: 2px
- Stroke cap: Round
- Default size: 20-24px for inline, 40px for standalone

---

## Logo Specifications

### Full Logo
- Icon mark: 40x40px
- Arc outer: 2.5px stroke, `primary` color
- Arc middle: 2px stroke, `accent` color
- Center dot: 8px, filled `primary`
- Wordmark: "Aura" (Playfair Display 24px) + "EVENTS" (Inter 10px, 3px letter-spacing)

### Icon Only
- Same as full logo icon mark
- Size: 40x40px

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 640px | Single column, reduced padding |
| Tablet | 640px - 1024px | 2-column grids |
| Desktop | > 1024px | Full layout, multi-column |

---

## Animation Guidelines

- Duration: 150-300ms for micro-interactions
- Easing: ease-out for entrances, ease-in for exits
- Hover transitions: 150ms
- Page transitions: 300ms

---

## Appendix: CSS Custom Properties Reference

```css
:root {
  /* Colors - Brand */
  --color-primary: #7C9A72;
  --color-primary-dark: #5C7A52;
  --color-primary-light: #A8C5A0;
  --color-accent: #C9A96E;
  --color-accent-light: #E0C992;
  --color-secondary: #C4918E;
  --color-secondary-light: #DDB5B2;

  /* Colors - Backgrounds */
  --color-bg-cream: #FDFBF7;
  --color-bg-surface: #F5F0E8;
  --color-bg-dark: #2D2A26;
  --color-card-bg: #FFFFFF;

  /* Colors - Text */
  --color-text-primary: #2D2A26;
  --color-text-secondary: #6B6560;
  --color-text-muted: #9B9590;
  --color-text-inverse: #FDFBF7;

  /* Colors - Borders */
  --color-border: #E8E0D4;
  --color-border-light: #F0EBE3;

  /* Colors - Semantic */
  --color-success: #7C9A72;
  --color-success-bg: #F0F5EE;
  --color-warning: #D4A054;
  --color-warning-bg: #FDF6EC;
  --color-error: #C47070;
  --color-error-bg: #FDF0EF;
  --color-info: #7A9EB5;
  --color-info-bg: #EEF5F9;

  /* Typography */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.13);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.18);
}
```