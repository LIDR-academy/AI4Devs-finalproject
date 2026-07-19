---
name: ui-ux-design-system
description: Enforce INKSPIRE frontend design system for consistent UI/UX across all components.
mode: agent
---

# INKSPIRE UI/UX Design System

When working on any file inside `frontend/src/`, apply the design system rules from `.github/skills/ui-ux-design-system/SKILL.md`.

## Key Principles

1. **Dark theme only** — `--ink-bg` (#0c0c0c) backgrounds, never white
2. **Gold accent** — `--ink-accent` (#c9a446) for CTAs, links, highlights
3. **Typography** — Playfair Display for headings, Inter for body/UI
4. **Design tokens** — Always use `var(--ink-*)`, never hard-code colors
5. **Cards** — Dark bg, border, gradient overlay on images, hover lift + shadow
6. **Navbar** — Sticky, glassmorphism, gold brand, blur background
7. **Responsive** — 1col → 2col (600px) → 4col (960px)
8. **Animations** — Subtle (0.2–0.35s ease), card lift on hover

Refer to the full SKILL.md for complete specs, tokens, and component patterns.
