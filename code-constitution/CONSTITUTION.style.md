# CONSTITUTION.style.md — qc-portal Visual Law

This document has the same authority as `CONSTITUTION.md` and `CONSTITUTION.ts.md`.
If a task conflicts with it, stop and escalate. Never silently violate it.

Scope: applies to **qc-portal** only. It governs everything the user sees.

## 1. Design Philosophy

Minimalist. Calm. Low cortisol. Boring on purpose.

- The interface should feel quiet. Nothing competes for attention.
- If an element can be removed without losing function or clarity, remove it.
- Whitespace is a feature, not wasted space. When in doubt, add space, not decoration.
- Novelty is forbidden. Familiar patterns, executed cleanly, win every time.

## 2. Color — The Only Palette

Three families. Nothing else exists.

| Token        | Value     | Use                                        |
| ------------ | --------- | ------------------------------------------ |
| `ink`        | `#000000` | Primary text, primary buttons, icons |
| `paper`      | `#FAFAF8` | Page background (off-white, never `#FFF` as page bg) |
| `surface`    | `#FFFFFF` | Cards/panels sitting on `paper` (only place pure white is allowed) |
| `gray-strong`| `#4A4A4A` | Secondary text                             |
| `gray-mid`   | `#8A8A8A` | Tertiary text, placeholders, disabled text |
| `gray-line`  | `#E4E4E1` | Hairline borders, dividers                 |
| `gray-fill`  | `#F1F1EF` | Subtle backgrounds, hover states, disabled fills |

Rules:

- These tokens are defined **once** in the Tailwind theme. Arbitrary color values
  (`text-[#333]`, `bg-[rgb(...)]`, hex in CSS) are **forbidden** everywhere.
- No other hues. No accent color. Links and actions are `ink` (see §6).
- Semantic states (error, success) are expressed with text + icon + weight,
  not with color. If a genuine need for a functional color arises, it is a
  constitution amendment, escalated to the human — not a local decision.

## 3. Contrast Floor — Non-Negotiable

- All text meets **WCAG AA**: ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥ 24px or 19px bold).
- `gray-mid` is the lightest gray ever allowed for text, and only at ≥ 14px.
- `gray-line` and `gray-fill` are **never** text colors.
- No gray text on gray fills unless the pair passes AA. When unsure, use `ink`.

## 4. Shape & Structure

- **Border radius: 0. Everywhere.** Buttons, inputs, cards, images, modals. Sharp corners are the identity.
- Hairline borders are allowed and encouraged as structure: `1px` solid `gray-line`. Never thicker for decoration.
- **No shadows.** Elevation is expressed with borders and background shifts (`paper` vs `surface`), never `box-shadow`. (Exception: a functional overlay like a modal may use a plain `ink` scrim at low opacity.)
- No gradients, no blurs, no glassmorphism, no decorative images or illustrations.
- Layout is a visible or implied grid. Alignment is exact — nothing "roughly" lines up.

## 5. Typography

Two families, frozen:

- **Sans — `Inter`** (fallback: `system-ui, sans-serif`). Headings, body, UI.
- **Mono — `JetBrains Mono`** (fallback: `ui-monospace, monospace`). Labels,
  metadata, technical annotations, timestamps, stream IDs, keyboard hints.

Rules:

- Type scale is fixed and tokenized: `12 / 14 / 16 / 20 / 28 / 40 px`
  (`text-xs` … `text-4xl` mapped in the theme). No arbitrary font sizes.
- Weights: `400` and `600` only. No thin, no black, no italics for emphasis
  (use weight or mono instead).
- Mono is seasoning, not the meal: small labels in uppercase with
  `tracking-wide` — never body copy.
- Line length for reading text: 60–75 characters max.

## 6. Components — Baseline Law

- **Primary button**: `ink` background, `paper` text, 0 radius. Hover: `gray-strong` background. That's the entire animation budget for it.
- **Secondary button**: `surface` background, `ink` text, `1px gray-line` border. Hover: `gray-fill` background.
- **Links**: `ink`, underlined. Hover: `gray-strong`. Never rely on color alone to mark a link.
- **Inputs**: `surface` background, `1px gray-line` border, 0 radius. Focus: border becomes `ink` + visible focus ring (`outline`), never `outline: none` without a replacement.
- **Focus states are mandatory** on every interactive element. Keyboard users see exactly where they are, always.
- Disabled: `gray-fill` background, `gray-mid` text, `not-allowed` cursor.

## 7. Motion — Calm or Nothing

- Transitions limited to `opacity`, `background-color`, `border-color`, `color`. Duration 100–200ms, `ease-out`.
- **Forbidden**: bounces, springs, parallax, scroll-jacking, auto-playing carousels, attention-seeking pulses, skeleton shimmer (use plain `gray-fill` placeholders), layout-shifting animations.
- `prefers-reduced-motion: reduce` is always respected: transitions drop to none.
- Nothing moves unless the user caused it.

## 8. Dark Mode

Out of scope for now. Do not build it, do not half-build it. The token system
makes it a future amendment, not a present concern.

## 9. Code Rules — TS + Tailwind + CSS + HTML

- **Tailwind is the default.** Utilities compose the design tokens; that is the point of tokenizing.
- A separate CSS file (or `@layer components`) is justified only when a pattern
  repeats enough that utilities become noise, or for things utilities express
  poorly (complex states, `@supports`, keyframes). CSS must still consume the
  same tokens via `theme()` / CSS variables — never raw values.
- **No inline `style=` attributes** except for genuinely dynamic values computed
  at runtime (e.g. a progress width). Static styling in `style=` is a violation.
- Semantic HTML first: `button` is a `<button>`, navigation is `<nav>`, headings
  are hierarchical. `div` soup is a violation of the elegance clause.
- Class lists stay readable: consistent ordering (layout → spacing → typography
  → color → state), extracted into a component when they stop being scannable.
- Markup, styles, and logic follow `CONSTITUTION.ts.md`: boring, simple, elegant.
  A clever one-liner that no one can read loses to three obvious lines.

## 10. The Litmus Test

Before shipping any UI, ask:

1. Could anything be removed? → Remove it.
2. Does anything move, glow, or shout? → Silence it.
3. Is every color one of the tokens? → If not, fix it.
4. Does it pass AA contrast? → If not, fix it.
5. Would a tired user at 2 AM find this calm and obvious? → If not, it's not done.

## 11. Tooling & Escalation Exception

- qc-portal may use the **`frontend-design` plugin** for design work.
- qc-portal may ask the **human direct design questions** without routing
  through the team lead. This is the standing exception to the communication
  rule — but the team lead must always be informed afterward so the openspec
  history stays complete.
- Ambiguity about *style* → this document first, then the human directly.
  Ambiguity about *scope or contracts* → team lead, as always.
