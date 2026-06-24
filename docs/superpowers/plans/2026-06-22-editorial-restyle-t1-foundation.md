# Editorial Restyle — T1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the editorial design system (Tailwind v4 tokens, Playfair Display + Inter fonts, five shared UI primitives) and restyle the global NavigationBar, so the five screen tickets (T2–T6) have a consistent foundation to build on.

**Architecture:** Approach A from the spec — design tokens live in `globals.css` under `@theme inline`; fonts are wired via `next/font/google` in `layout.tsx`; a small set of presentational primitives in `src/components/shared/ui/` encode the editorial treatments once. Primitives are pure presentational components (no data, no behaviour) so existing functional components and their tests are unaffected. NavigationBar is restyled in place, preserving all `data-testid`s and behaviour.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline`), Vitest + React Testing Library + jest-dom, `next/font/google`.

**Reference spec:** `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`
**Figma:** file key `yUOmxNuANSYeRjwW1eNBmV` — Search node `1:418`, design tokens sampled from node `1:12`.

---

## Important constraints (read before starting)

1. **Branch & PR:** Do all work on a feature branch off `main`. Create the GitHub issue for T1 first, then branch `issue-<N>-t1-design-foundation` (fallback name if no issue: `t1-design-foundation`). Never commit to `main`. Open a PR; merge only after CI (Backend + Frontend) is green.
2. **Vitest has CSS/PostCSS disabled** (`vitest.config.ts` → `css.postcss.plugins: []`). Tailwind utilities are **not** compiled in tests. Therefore unit tests assert on **class-name strings** (`el.className` contains `bg-terracotta`) and rendered structure/text — never on computed `getComputedStyle` colors.
3. **Existing tests must stay green.** The NavigationBar test (`src/components/shared/NavigationBar.test.tsx`) asserts `data-testid`s, `aria-current`, and mobile-menu toggling — not colors. Keep every `data-testid` and the DOM structure intact while restyling.
4. **Working directory for all `npm` commands:** `frontend/`.

## File structure

```
frontend/src/
├── app/
│   ├── globals.css          # MODIFY — replace placeholder theme with editorial tokens
│   └── layout.tsx           # MODIFY — swap Geist → Playfair Display + Inter
└── components/shared/
    ├── NavigationBar.tsx     # MODIFY — serif logo, terracotta accents
    ├── NavigationBar.test.tsx# MODIFY — add serif-logo + terracotta-CTA assertions
    └── ui/                   # CREATE — new primitives
        ├── Card.tsx
        ├── Card.test.tsx
        ├── Heading.tsx
        ├── Heading.test.tsx
        ├── Label.tsx
        ├── Label.test.tsx
        ├── Badge.tsx
        ├── Badge.test.tsx
        ├── Button.tsx
        ├── Button.test.tsx
        └── index.ts          # barrel export
```

Tailwind v4 token → utility mapping this plan relies on (auto-generated from `@theme` keys):
- `--color-ink` → `text-ink` / `bg-ink`
- `--color-taupe` → `text-taupe`
- `--color-terracotta` → `text-terracotta` / `bg-terracotta` / `border-terracotta`
- `--color-terracotta-tint` → `bg-terracotta-tint`
- `--color-border` → `border-border`
- `--color-divider` → `border-divider`
- `--color-surface` → `bg-surface`
- `--color-canvas` → `bg-canvas`
- `--font-serif` → `font-serif`; `--font-sans` → `font-sans`
- `--radius-card` → `rounded-card`; `--radius-pill` → `rounded-pill`

---

### Task 1: Design tokens + fonts

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/layout.tsx`

No unit test: these are CSS tokens + font wiring, which Vitest cannot compile (PostCSS is disabled in tests, and `RootLayout` renders `<html>/<body>`). Verified by type-check, production build, and a manual run.

- [ ] **Step 1: Replace `globals.css` with the editorial theme**

Replace the entire contents of `frontend/src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #faf8f5;
  --foreground: #1b1c1a;
}

@theme inline {
  /* Color */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-ink: #1b1c1a;
  --color-taupe: #56423d;
  --color-terracotta: #89351d;
  --color-terracotta-tint: rgba(137, 53, 29, 0.1);
  --color-border: rgba(220, 193, 186, 0.3);
  --color-divider: rgba(220, 193, 186, 0.15);
  --color-surface: #ffffff;
  --color-canvas: #faf8f5;

  /* Type — mapped to next/font CSS variables set on <html> in layout.tsx */
  --font-serif: var(--font-playfair), Georgia, serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;

  /* Radius */
  --radius-card: 8px;
  --radius-pill: 12px;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), system-ui, sans-serif;
}
```

Note: the `prefers-color-scheme: dark` block is intentionally removed — the editorial design is light-only (see spec "Out of scope").

- [ ] **Step 2: Wire Playfair Display + Inter in `layout.tsx`**

Replace the font imports and usage in `frontend/src/app/layout.tsx`. Change the import line and font declarations:

```tsx
'use client';

import { Playfair_Display, Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { NavigationBar } from "@/components/shared/NavigationBar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <NavigationBar />
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

Note: the unused `import type { Metadata }` line from the original is dropped (it was unused; this file is a client component).

- [ ] **Step 3: Type-check and run the existing test suite (must stay green)**

Run (in `frontend/`): `npm run type-check && npm run test`
Expected: type-check passes; all existing tests PASS (token/font changes don't touch tested behaviour).

- [ ] **Step 4: Production build to confirm fonts + Tailwind compile**

Run (in `frontend/`): `npm run build`
Expected: build succeeds with no errors about unknown utilities or fonts.

- [ ] **Step 5: Manual visual check**

Run (in `frontend/`): `npm run dev`, open `http://localhost:3000`.
Expected: page background is warm off-white (`#faf8f5`), body text renders in Inter. (NavigationBar still default-styled until Task 7.)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/globals.css frontend/src/app/layout.tsx
git commit -m "feat(ui): add editorial design tokens and Playfair/Inter fonts (T1)"
```

---

### Task 2: `Card` primitive

**Files:**
- Create: `frontend/src/components/shared/ui/Card.tsx`
- Test: `frontend/src/components/shared/ui/Card.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/ui/Card.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies editorial surface, radius and border classes', () => {
    render(<Card data-testid="card">x</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('bg-surface');
    expect(el.className).toContain('rounded-card');
    expect(el.className).toContain('border-border');
  });

  it('merges a custom className and forwards arbitrary props', () => {
    render(<Card data-testid="card" className="p-8" aria-label="trip">x</Card>);
    const el = screen.getByTestId('card');
    expect(el.className).toContain('p-8');
    expect(el).toHaveAttribute('aria-label', 'trip');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Card.test.tsx`
Expected: FAIL — cannot resolve `./Card`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/components/shared/ui/Card.tsx`:

```tsx
import React, { HTMLAttributes, ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

/** White editorial surface: rounded-8, warm rose-beige border. Presentational only. */
export function Card({ children, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card border border-border ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Card.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/ui/Card.tsx frontend/src/components/shared/ui/Card.test.tsx
git commit -m "feat(ui): add Card primitive (T1)"
```

---

### Task 3: `Heading` primitive

**Files:**
- Create: `frontend/src/components/shared/ui/Heading.tsx`
- Test: `frontend/src/components/shared/ui/Heading.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/ui/Heading.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Heading } from './Heading';

describe('Heading', () => {
  it('renders an h2 by default with serif + ink classes', () => {
    render(<Heading>Title</Heading>);
    const el = screen.getByRole('heading', { level: 2, name: 'Title' });
    expect(el.className).toContain('font-serif');
    expect(el.className).toContain('text-ink');
  });

  it('renders the requested heading level', () => {
    render(<Heading level={1}>Big</Heading>);
    expect(screen.getByRole('heading', { level: 1, name: 'Big' })).toBeInTheDocument();
  });

  it('merges a custom className', () => {
    render(<Heading level={3} className="mb-4">Small</Heading>);
    const el = screen.getByRole('heading', { level: 3 });
    expect(el.className).toContain('mb-4');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Heading.test.tsx`
Expected: FAIL — cannot resolve `./Heading`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/components/shared/ui/Heading.tsx`:

```tsx
import React, { ReactNode } from 'react';

type HeadingProps = {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
};

const sizeClasses: Record<1 | 2 | 3, string> = {
  1: 'text-[40px] leading-[48px]',
  2: 'text-[32px] leading-[40px]',
  3: 'text-[24px] leading-[32px]',
};

/** Playfair serif heading in ink. level controls tag + size (1=40, 2=32, 3=24). */
export function Heading({ level = 2, children, className = '' }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <Tag className={`font-serif text-ink ${sizeClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Heading.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/ui/Heading.tsx frontend/src/components/shared/ui/Heading.test.tsx
git commit -m "feat(ui): add Heading primitive (T1)"
```

---

### Task 4: `Label` primitive

**Files:**
- Create: `frontend/src/components/shared/ui/Label.tsx`
- Test: `frontend/src/components/shared/ui/Label.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/ui/Label.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from './Label';

describe('Label', () => {
  it('renders children', () => {
    render(<Label>Santorini, Greece</Label>);
    expect(screen.getByText('Santorini, Greece')).toBeInTheDocument();
  });

  it('applies uppercase, taupe and tracking classes', () => {
    render(<Label data-testid="label">x</Label>);
    const el = screen.getByTestId('label');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('text-taupe');
    expect(el.className).toContain('font-sans');
  });

  it('merges a custom className', () => {
    render(<Label data-testid="label" className="text-terracotta">x</Label>);
    expect(screen.getByTestId('label').className).toContain('text-terracotta');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Label.test.tsx`
Expected: FAIL — cannot resolve `./Label`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/components/shared/ui/Label.tsx`:

```tsx
import React, { HTMLAttributes, ReactNode } from 'react';

type LabelProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

/** Editorial micro-label: Inter, uppercase, wide tracking, 12px taupe. */
export function Label({ children, className = '', ...rest }: LabelProps) {
  return (
    <span
      className={`font-sans uppercase text-taupe text-[12px] leading-[16px] tracking-[0.1em] ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Label.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/ui/Label.tsx frontend/src/components/shared/ui/Label.test.tsx
git commit -m "feat(ui): add Label primitive (T1)"
```

---

### Task 5: `Badge` primitive

**Files:**
- Create: `frontend/src/components/shared/ui/Badge.tsx`
- Test: `frontend/src/components/shared/ui/Badge.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/ui/Badge.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Confirmed</Badge>);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('applies terracotta-tint pill classes', () => {
    render(<Badge data-testid="badge">x</Badge>);
    const el = screen.getByTestId('badge');
    expect(el.className).toContain('bg-terracotta-tint');
    expect(el.className).toContain('rounded-pill');
    expect(el.className).toContain('text-terracotta');
    expect(el.className).toContain('uppercase');
  });

  it('merges a custom className', () => {
    render(<Badge data-testid="badge" className="ml-2">x</Badge>);
    expect(screen.getByTestId('badge').className).toContain('ml-2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Badge.test.tsx`
Expected: FAIL — cannot resolve `./Badge`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/components/shared/ui/Badge.tsx`:

```tsx
import React, { HTMLAttributes, ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

/** Status pill: terracotta-tint background, uppercase terracotta text. */
export function Badge({ children, className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-terracotta-tint px-3 py-1 font-sans text-[12px] leading-[16px] uppercase tracking-[0.05em] text-terracotta ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Badge.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/ui/Badge.tsx frontend/src/components/shared/ui/Badge.test.tsx
git commit -m "feat(ui): add Badge primitive (T1)"
```

---

### Task 6: `Button` primitive

**Files:**
- Create: `frontend/src/components/shared/ui/Button.tsx`
- Test: `frontend/src/components/shared/ui/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/components/shared/ui/Button.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and defaults to the primary (terracotta) variant', () => {
    render(<Button>Reserve</Button>);
    const el = screen.getByRole('button', { name: 'Reserve' });
    expect(el.className).toContain('bg-terracotta');
  });

  it('renders the ghost variant with uppercase terracotta text', () => {
    render(<Button variant="ghost">View details</Button>);
    const el = screen.getByRole('button', { name: 'View details' });
    expect(el.className).toContain('text-terracotta');
    expect(el.className).toContain('uppercase');
    expect(el.className).not.toContain('bg-terracotta');
  });

  it('forwards onClick and type', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button type="submit" onClick={onClick}>Go</Button>);
    const el = screen.getByRole('button', { name: 'Go' });
    expect(el).toHaveAttribute('type', 'submit');
    await user.click(el);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Button.test.tsx`
Expected: FAIL — cannot resolve `./Button`.

- [ ] **Step 3: Write minimal implementation**

Create `frontend/src/components/shared/ui/Button.tsx`:

```tsx
import React, { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = {
  variant?: 'primary' | 'ghost';
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base = 'inline-flex items-center gap-2 font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<'primary' | 'ghost', string> = {
  primary:
    'bg-terracotta text-white rounded-pill px-6 py-3 text-[14px] font-semibold hover:opacity-90',
  ghost:
    'bg-transparent text-terracotta uppercase tracking-[0.1em] text-[14px] font-semibold hover:opacity-80',
};

/** Editorial button. primary = terracotta fill; ghost = uppercase terracotta text (e.g. "VIEW DETAILS →"). */
export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run (in `frontend/`): `npm run test -- src/components/shared/ui/Button.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/ui/Button.tsx frontend/src/components/shared/ui/Button.test.tsx
git commit -m "feat(ui): add Button primitive (T1)"
```

---

### Task 7: Barrel export

**Files:**
- Create: `frontend/src/components/shared/ui/index.ts`

No separate test — exercised by the type-check and the NavigationBar import in Task 8.

- [ ] **Step 1: Create the barrel**

Create `frontend/src/components/shared/ui/index.ts`:

```ts
export { Card } from './Card';
export { Heading } from './Heading';
export { Label } from './Label';
export { Badge } from './Badge';
export { Button } from './Button';
```

- [ ] **Step 2: Type-check**

Run (in `frontend/`): `npm run type-check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/shared/ui/index.ts
git commit -m "feat(ui): add shared/ui barrel export (T1)"
```

---

### Task 8: Restyle NavigationBar (editorial)

**Files:**
- Modify: `frontend/src/components/shared/NavigationBar.tsx`
- Modify: `frontend/src/components/shared/NavigationBar.test.tsx`

Behaviour is unchanged; only styling. The TDD lever is two new assertions: the logo is serif, and the signed-out CTA is terracotta (currently both use `blue-600`).

- [ ] **Step 1: Add the failing assertions to the existing test**

In `frontend/src/components/shared/NavigationBar.test.tsx`, add these two tests inside the existing `describe('NavigationBar', ...)` block (after the last test, before the closing `});`):

```tsx
  it('renders the StayHub logo in the serif editorial font', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-home').className).toContain('font-serif');
  });

  it('styles the signed-out Sign up CTA with the terracotta accent', () => {
    render(<NavigationBar />);
    expect(screen.getByTestId('nav-register').className).toContain('bg-terracotta');
  });
```

- [ ] **Step 2: Run the test to verify the new assertions fail**

Run (in `frontend/`): `npm run test -- src/components/shared/NavigationBar.test.tsx`
Expected: the two new tests FAIL (logo has `text-blue-600`/no `font-serif`; CTA has `bg-blue-600`). The original five tests still PASS.

- [ ] **Step 3: Restyle NavigationBar to editorial tokens**

In `frontend/src/components/shared/NavigationBar.tsx`, make these class changes only (keep all `data-testid`s, structure, and logic identical):

1. Active-link color — change `linkClass` (line ~36–39):

```tsx
  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      isActive(href) ? 'text-terracotta' : 'text-taupe hover:text-ink'
    }`;
```

2. Log out button (line ~57): change `text-gray-600 hover:text-gray-900` →

```tsx
          className="text-left text-sm font-medium text-taupe hover:text-ink"
```

3. Sign up CTA (line ~77): change `rounded-lg bg-blue-600 ... hover:bg-blue-700` →

```tsx
          className="rounded-pill bg-terracotta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
```

4. Logo (line ~91): change `text-lg font-bold text-blue-600` →

```tsx
          <Link href="/" data-testid="nav-home" className="font-serif text-xl text-ink tracking-[0.12em] uppercase">
            StayHub
          </Link>
```

5. Search link (line ~98): change `text-gray-600 hover:text-gray-900` →

```tsx
            className="flex items-center gap-1 text-sm text-taupe hover:text-ink"
```

6. Mobile toggle (line ~115): change `text-gray-600 hover:text-gray-900 md:hidden` →

```tsx
          className="text-taupe hover:text-ink md:hidden"
```

7. Nav container border (line ~87) and mobile menu border (line ~124): change `border-gray-200` → `border-border` in both.

- [ ] **Step 4: Run the NavigationBar test to verify all pass**

Run (in `frontend/`): `npm run test -- src/components/shared/NavigationBar.test.tsx`
Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/shared/NavigationBar.tsx frontend/src/components/shared/NavigationBar.test.tsx
git commit -m "feat(ui): restyle NavigationBar with editorial tokens (T1)"
```

---

### Task 9: Full verification, push, and PR

**Files:** none (verification + delivery).

- [ ] **Step 1: Run the full frontend suite**

Run (in `frontend/`): `npm run test`
Expected: all tests PASS (existing suite + 15 new primitive tests + 2 new NavigationBar tests).

- [ ] **Step 2: Lint and type-check**

Run (in `frontend/`): `npm run lint && npm run type-check`
Expected: no errors.

- [ ] **Step 3: Production build**

Run (in `frontend/`): `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke check**

Run (in `frontend/`): `npm run dev`, open `http://localhost:3000`.
Expected: warm off-white background, serif uppercase `STAYHUB` logo in ink, terracotta `Sign up` CTA, Inter body text. Compare against Figma node `1:418` header.

- [ ] **Step 5: Push and open the PR**

```bash
git push -u origin <branch-name>
gh pr create --title "Editorial UI restyle — T1 design foundation" \
  --body "Implements T1 (design foundation) of the editorial restyle epic.

- Editorial design tokens in globals.css (Tailwind v4 @theme)
- Playfair Display + Inter via next/font
- Shared UI primitives: Card, Heading, Label, Badge, Button (+ tests)
- NavigationBar restyled to editorial tokens (behaviour unchanged)

Spec: docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md
Plan: docs/superpowers/plans/2026-06-22-editorial-restyle-t1-foundation.md

Dark mode removed (light-only design). No backend changes. All existing tests green."
```

- [ ] **Step 6: Wait for CI, then merge and close the issue**

After CI (Backend + Frontend) is green and any required review passes:
```bash
gh issue close <N> --comment "Completed T1 design foundation. Tokens, fonts, 5 primitives, NavigationBar restyle. All tests green."
```

---

## Self-review notes

- **Spec coverage:** tokens (Task 1), Playfair+Inter via next/font (Task 1), all five primitives Card/Heading/Label/Badge/Button (Tasks 2–6), NavigationBar restyle + serif logo + terracotta CTA (Task 8), dark mode removed (Task 1), tests green + build (Task 9). T2–T6 are out of scope for this plan (separate tickets per spec epic breakdown).
- **Placeholder scan:** none — every code step shows complete content. `<N>` and `<branch-name>` are deliberate delivery-time values, explained in Constraints.
- **Type consistency:** token utility names (`bg-terracotta`, `text-ink`, `rounded-card`, `rounded-pill`, `bg-terracotta-tint`, `border-border`, `font-serif`, `font-sans`) are defined in Task 1 and used identically in Tasks 2–6 and 8; `next/font` variables `--font-playfair`/`--font-inter` set in `layout.tsx` match the `var(--font-playfair)`/`var(--font-inter)` references in `globals.css`.
