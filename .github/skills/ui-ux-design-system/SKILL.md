---
name: ui-ux-design-system
description: Enforce INKSPIRE UI/UX design system rules when creating or modifying frontend components. Ensures visual consistency across the entire site.
author: INKSPIRE
version: 1.0.0
---

# ui-ux-design-system Skill

Apply this skill whenever creating, modifying, or reviewing any frontend component, page, or style in `frontend/src/`.

---

## 1. Brand Identity

| Attribute      | Value                                                   |
| -------------- | ------------------------------------------------------- |
| Product name   | **INKSPIRE**                                            |
| Tagline        | La vitrina digital del tatuaje                          |
| Tone           | Premium, dark, editorial — think luxury tattoo magazine |
| Logo rendering | `✒ INKSPIRE` (pen emoji + Playfair Display, dot in gold) |

---

## 2. Color Palette (CSS Custom Properties)

All colors MUST be used via `var(--ink-*)` tokens. Never hard-code hex values inline.

```css
:root {
  /* Backgrounds */
  --ink-bg:             #0c0c0c;       /* Main background */
  --ink-bg-secondary:   #141414;       /* Slightly elevated surfaces */
  --ink-bg-card:        #1c1c1c;       /* Cards, panels */
  --ink-bg-elevated:    #252525;       /* Hover states, elevated elements */

  /* Brand accent */
  --ink-accent:         #c9a446;       /* Gold — primary CTA, links, highlights */
  --ink-accent-hover:   #ddb95e;       /* Gold hover state */

  /* Typography */
  --ink-text-primary:   #f0ede8;       /* Main body text (warm white) */
  --ink-text-secondary: #888888;       /* Secondary info, labels */
  --ink-text-muted:     #505050;       /* Disabled, tertiary */

  /* Structure */
  --ink-border:         rgba(255, 255, 255, 0.07);
  --ink-border-accent:  rgba(201, 164, 70, 0.25);

  /* Shadows */
  --ink-shadow-sm:      0 2px 8px rgba(0, 0, 0, 0.4);
  --ink-shadow-md:      0 4px 20px rgba(0, 0, 0, 0.5);
  --ink-shadow-lg:      0 8px 40px rgba(0, 0, 0, 0.65);

  /* Misc */
  --ink-radius:         12px;
  --ink-certified:      #34d399;       /* Verified badge green */
}
```

### Semantic usage rules

| Context                  | Token                             |
| ------------------------ | --------------------------------- |
| Page background          | `--ink-bg`                        |
| Card/panel background    | `--ink-bg-card`                   |
| Hover/active surface     | `--ink-bg-elevated`               |
| Primary CTA button bg    | `--ink-accent`                    |
| CTA button text          | `#111` (dark on gold)             |
| Link color               | `--ink-accent`                    |
| Section dividers         | `--ink-border`                    |
| Focus ring               | `--ink-border-accent`             |
| Error states             | `#ef4444` with 8% alpha bg        |
| Success / certified      | `--ink-certified`                 |

---

## 3. Typography

### Font stack

| Role       | Font family                          | Weight   |
| ---------- | ------------------------------------ | -------- |
| Headings   | `'Playfair Display', serif`          | 700      |
| Body       | `'Inter', 'Helvetica Neue', sans-serif` | 300–600 |
| UI/buttons | `'Inter', sans-serif`                | 500–600  |

### Scale (use `clamp()` for responsive)

| Element           | Size                             |
| ----------------- | -------------------------------- |
| Hero title        | `clamp(2.2rem, 5vw, 3.4rem)`    |
| Section title     | `1.35rem`                        |
| Card name         | `0.9rem`, weight 600             |
| Body / meta       | `0.78rem – 0.875rem`            |
| Eyebrow / badge   | `0.7rem – 0.75rem`, uppercase, letter-spacing 2–3px |

### Rules

- **All headings** use Playfair Display.
- **All body text, buttons, labels** use Inter.
- Letter-spacing: `0.3px` for buttons, `2–3px` for uppercase eyebrows.
- Line-height: `1.15` for headings, `1.65` for body text.
- Anti-aliasing: `-webkit-font-smoothing: antialiased`.

---

## 4. Layout & Spacing

| Guideline                   | Value                                               |
| --------------------------- | --------------------------------------------------- |
| Max content width           | `1200px`, centered with `margin: 0 auto`            |
| Content padding             | `16px` mobile, `24px` desktop                       |
| Card grid                   | 1 col mobile → 2 cols (600px) → 4 cols (960px)     |
| Grid gap                    | `16px`                                              |
| Section vertical spacing    | `48–56px`                                           |
| Card border-radius          | `var(--ink-radius)` (12px)                          |
| Button border-radius        | `6–8px`                                             |

---

## 5. Component Patterns

### 5.1 Navbar

- **Sticky**, `position: sticky; top: 0; z-index: 100`
- Background: `rgba(12, 12, 12, 0.88)` with `backdrop-filter: blur(14px)`
- Border-bottom: `1px solid var(--ink-border)`
- Height: `64px`
- Brand: pen icon in gold + "INKSPIRE" in Playfair Display
- Nav links: Inter, `0.875rem`, `--ink-text-secondary` → `--ink-text-primary` on hover
- Primary CTA: gold bg, dark text, rounded

### 5.2 Cards (Artist Cards)

- Dark card bg (`--ink-bg-card`) with `1px solid var(--ink-border)`
- Image: square aspect ratio (`1:1`), `object-fit: cover`
- Gradient overlay on image bottom for text readability
- Artist name + style overlaid on image bottom
- Hover: `translateY(-6px)`, `--ink-shadow-lg`, image `scale(1.06)`, border turns to `--ink-border-accent`
- Certified badge: top-right, circular, glassmorphism bg, `--ink-certified` icon
- Body section: minimal, shows location + rating

### 5.3 Sections

- Header: title (Playfair) + gold accent line (32×2px) underneath
- "Ver más →" link aligned right, gold color
- Section divider: `border-bottom: 1px solid var(--ink-border)`

### 5.4 Hero Sections

- Full-width, centered text
- Radial gradient glow (gold, 14% opacity) from top
- Eyebrow: uppercase, small, `--ink-accent`, `letter-spacing: 3px`
- Title: Playfair Display, `clamp()` sizing, key word in italic + gold
- Subtitle: Inter light (300), `--ink-text-secondary`

### 5.5 Forms (Login, Inputs)

- Use Angular Material `appearance="outline"`
- Card container: centered, max-width `440px`, `--ink-shadow-lg`
- Brand logo above card
- Error messages: left-border red, subtle red bg (8% alpha)
- Submit button: full-width, gold accent, 44px height, rounded
- Background page: radial gradient accents (subtle gold)

### 5.6 Account / Profile Pages

- Avatar: circular, gradient gold bg, user initials, `box-shadow` with gold glow
- Name: Playfair Display
- Role: uppercase, gold, small
- Info fields: `<dl>` with flex rows, separated by `--ink-border`

### 5.7 Buttons

| Type      | Style                                                             |
| --------- | ----------------------------------------------------------------- |
| Primary   | `background: var(--ink-accent)`, `color: #111`, rounded 6–8px    |
| Secondary | `border: 1px solid var(--ink-border)`, text `--ink-text-secondary` |
| Ghost     | No border, text `--ink-text-secondary`, hover: `--ink-text-primary` |

---

## 6. Animation & Transitions

| Element          | Transition                                     |
| ---------------- | ---------------------------------------------- |
| Card hover       | `transform 0.25s ease, box-shadow 0.25s ease`  |
| Image zoom       | `transform 0.35s ease`                         |
| Button hover     | `background 0.2s ease` or `border-color 0.2s ease` |
| Link hover       | `opacity 0.2s ease` or `color 0.2s ease`       |
| Skeleton shimmer | `background-position` animation, `1.4s infinite` |

- Use `ease` for most transitions.
- Hover cards lift: `translateY(-6px)`.
- Images scale: `scale(1.06)` on parent hover.

---

## 7. Skeleton / Loading States

- Use dark shimmer: linear-gradient between `--ink-bg-elevated` and `--ink-bg-card`
- Mimic final layout shape (same grid, same aspect ratios)
- Border-radius: `var(--ink-radius)`
- Animation: `shimmer 1.4s infinite`

---

## 8. Accessibility & Responsive

- Minimum tap target: `44px` for buttons and interactive elements
- Use `aria-label` on icon-only buttons
- Error messages: `role="alert"`
- Images: meaningful `alt` text, `loading="lazy"` for below-fold
- Breakpoints: `600px` (tablet), `960px` (desktop)
- Use `min-height: 100dvh` for full-page layouts

---

## 9. File Organization Rules

- Global tokens live in `frontend/src/styles.scss`
- Component-scoped styles in `.component.scss` files
- Never duplicate token values — always reference `var(--ink-*)`
- Angular Material overrides use `!important` only in component scopes, not globals

---

## 10. Do NOT

- ❌ Use light/white backgrounds for any page or card
- ❌ Use Roboto — the project uses Inter + Playfair Display
- ❌ Hard-code colors outside the design tokens
- ❌ Use Angular Material's `color="primary"` theming for backgrounds (override with custom tokens)
- ❌ Create components without hover/focus states
- ❌ Use `border-radius` values inconsistent with `--ink-radius` (12px for cards, 6–8px for buttons)
- ❌ Use flat/plain card designs without border + shadow treatment
- ❌ Skip the gradient overlay on image cards
- ❌ Use generic browser scrollbars (custom dark scrollbar is defined globally)

---

## Quick Reference Checklist (for every new component)

- [ ] Uses `var(--ink-*)` tokens for all colors
- [ ] Typography follows Inter (body) / Playfair Display (headings)
- [ ] Cards have dark bg, border, hover lift + shadow
- [ ] Buttons follow primary/secondary/ghost patterns
- [ ] Responsive at 600px and 960px breakpoints
- [ ] Transitions on interactive elements (0.2–0.35s ease)
- [ ] Accessible (aria labels, contrast, focus states)
- [ ] No hard-coded colors or font families
