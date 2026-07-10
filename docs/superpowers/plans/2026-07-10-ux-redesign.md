# UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el UX redesign descrito en `docs/superpowers/specs/2026-07-10-ux-redesign-design.md` — nueva landing, logo (casa-prisma arcoíris), header fijo, ProcessStepper, ListingTabs con paste fallback, y backend UA/headers/retry.

**Architecture:** Cambios en Svelte components (frontend) y CheerioAdapter (backend) sin tocar la capa de dominio. 7 commits segmentados, 1 PR. TDD: cada componente con test unit Vitest antes de implementar; flujos críticos con e2e Playwright.

**Tech Stack:** SvelteKit 2, Svelte 4, Vite, Vitest, @testing-library/svelte, Playwright, Express, node-fetch, TypeScript, Plus Jakarta Sans (Google Fonts), ImageMagick o `sharp` (para PWA icons).

**Spec reference:** `docs/superpowers/specs/2026-07-10-ux-redesign-design.md`
**Spec commits:** 7 (Logo, Header, ProcessStepper, Landing, ListingTabs, Backend, PWA icons)

---

## File Structure (resumen del spec)

**Nuevos archivos frontend:**
- `frontend/src/lib/components/Logo.svelte`
- `frontend/src/lib/components/Header.svelte`
- `frontend/src/lib/components/ProcessStepper.svelte`
- `frontend/src/lib/components/ListingTabs.svelte`
- `frontend/src/lib/components/LandingHero.svelte`
- `frontend/src/lib/components/LandingStepper.svelte`
- `frontend/src/routes/mi-proceso/+page.svelte`
- `frontend/tests/unit/components/Logo.test.ts`
- `frontend/tests/unit/components/Header.test.ts`
- `frontend/tests/unit/components/ProcessStepper.test.ts`
- `frontend/tests/unit/components/ListingTabs.test.ts`
- `frontend/tests/unit/components/LandingHero.test.ts`
- `frontend/tests/unit/components/LandingStepper.test.ts`
- `e2e/flows/ux-redesign.spec.ts`

**Archivos modificados frontend:**
- `frontend/src/app.html` (link Google Fonts)
- `frontend/src/app.css` (variables brand)
- `frontend/src/routes/+layout.svelte` (Header + ProcessStepper)
- `frontend/src/routes/+page.svelte` (nueva landing)
- `frontend/src/routes/listing-lens/+page.svelte` (ListingTabs)
- `e2e/flows/full-flow.spec.ts` (aserciones header/stepper/landing)

**Archivos eliminados frontend:**
- `frontend/src/lib/components/NavTabs.svelte`

**Archivos modificados backend:**
- `backend/src/infrastructure/utils/urlValidator.ts` (constantes CHROME_UA + BROWSER_HEADERS)
- `backend/src/adapters/cheerio/CheerioAdapter.ts` (usa headers + retry)

**Nuevos archivos backend:**
- `backend/tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts`
- `backend/tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts`

**Assets nuevos (PWA):**
- `frontend/static/icons/icon-192.png` (regenerado)
- `frontend/static/icons/icon-512.png` (regenerado)
- `frontend/static/icons/maskable-icon-512.png` (regenerado)
- `frontend/static/favicon.ico` (nuevo)

---

## Task 1: Branding — Logo + tipografía

**Files:**
- Modify: `frontend/src/app.html` (1 link tag)
- Modify: `frontend/src/app.css` (2 variables)
- Create: `frontend/src/lib/components/Logo.svelte`
- Create: `frontend/tests/unit/components/Logo.test.ts`

- [ ] **Step 1.1: Verificar entorno frontend**

```bash
cd frontend && npm run check
```

Expected: pasa sin errores. Si falla, parar y resolver dependencias antes de continuar.

- [ ] **Step 1.2: Escribir el test del Logo (failing)**

Crear `frontend/tests/unit/components/Logo.test.ts`:

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Logo from '$lib/components/Logo.svelte';

describe('Logo', () => {
  it('renderiza el SVG con la casa-prisma arcoíris', () => {
    const { container } = render(Logo);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // 3 inputs arcoíris
    const lines = container.querySelectorAll('line[stroke]');
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it('muestra el wordmark "Realista" en variant "full"', () => {
    const { container } = render(Logo, { props: { variant: 'full' } });
    const wordmark = container.querySelector('span');
    expect(wordmark?.textContent?.trim()).toBe('Realista');
  });

  it('oculta el wordmark en variant "icon"', () => {
    const { container } = render(Logo, { props: { variant: 'icon' } });
    const wordmark = container.querySelector('span.wordmark');
    expect(wordmark).toBeNull();
  });
});
```

- [ ] **Step 1.3: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/Logo.test.ts
```

Expected: FAIL con "Cannot find module '$lib/components/Logo.svelte'".

- [ ] **Step 1.4: Crear el Logo component**

Crear `frontend/src/lib/components/Logo.svelte`:

```svelte
<script lang="ts">
  export let variant: 'full' | 'icon' = 'full';
  export let height: string = '32px';

  $: showWordmark = variant === 'full';
</script>

<a href="/" aria-label="Realista — inicio" class="logo-link">
  <svg viewBox="0 0 64 44" {height} fill="none" aria-hidden="true" class="logo-icon">
    <path d="M10 34 L10 22 L28 6 L46 22 L46 34 Z" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round" fill="none"/>
    <line x1="10" y1="34" x2="46" y2="34" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="4"  x2="19" y2="14" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="0" y1="9"  x2="19" y2="14" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="0" y1="14" x2="19" y2="14" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="37" y1="14" x2="58" y2="14" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="14" r="3" fill="#1e3a8a"/>
  </svg>
  {#if showWordmark}
    <span class="wordmark">Realista</span>
  {/if}
</a>

<style>
  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--color-brand);
  }
  .logo-icon {
    flex-shrink: 0;
  }
  .wordmark {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--color-brand);
    letter-spacing: -0.02em;
  }
</style>
```

- [ ] **Step 1.5: Añadir las variables brand en app.css**

Modificar `frontend/src/app.css` — añadir dentro de `:root`:

```css
  --color-brand: #1e3a8a;
  --font-display: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

- [ ] **Step 1.6: Añadir el link a Google Fonts en app.html**

Modificar `frontend/src/app.html` — añadir en el `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 1.7: Correr el test, ver que pasa**

```bash
cd frontend && npx vitest run tests/unit/components/Logo.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 1.8: Verificar typecheck**

```bash
cd frontend && npm run check
```

Expected: 0 errores.

- [ ] **Step 1.9: Commit**

```bash
git add frontend/src/app.html frontend/src/app.css frontend/src/lib/components/Logo.svelte frontend/tests/unit/components/Logo.test.ts
git commit -m "feat(frontend): Logo component + Plus Jakarta Sans + brand colors"
```

---

## Task 2: Header fijo

**Files:**
- Create: `frontend/src/lib/components/Header.svelte`
- Create: `frontend/tests/unit/components/Header.test.ts`
- Modify: `frontend/src/routes/+layout.svelte`

- [ ] **Step 2.1: Escribir el test del Header (failing)**

Crear `frontend/tests/unit/components/Header.test.ts`:

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Header from '$lib/components/Header.svelte';

describe('Header', () => {
  it('renderiza el Logo', () => {
    const { container } = render(Header);
    const link = container.querySelector('a[aria-label*="Realista"]');
    expect(link).toBeTruthy();
  });

  it('tiene position sticky', () => {
    const { container } = render(Header);
    const header = container.querySelector('header');
    expect(header?.className).toContain('sticky');
  });

  it('renderiza children en el slot derecho', () => {
    const { container } = render(Header, { props: {}, slots: { default: '<button>Test</button>' } });
    const slot = container.querySelector('.right-slot button');
    expect(slot?.textContent?.trim()).toBe('Test');
  });
});
```

- [ ] **Step 2.2: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/Header.test.ts
```

Expected: FAIL con "Cannot find module".

- [ ] **Step 2.3: Crear el Header component**

Crear `frontend/src/lib/components/Header.svelte`:

```svelte
<script lang="ts">
  import Logo from './Logo.svelte';
</script>

<header class="sticky top-0 z-50 bg-white border-b border-[var(--color-border)]">
  <div class="container flex items-center justify-between" style="min-height: 56px">
    <Logo variant="full" height="28px" />
    <div class="right-slot">
      <slot />
    </div>
  </div>
</header>

<style>
  header {
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
  }
  .right-slot:empty {
    display: none;
  }
</style>
```

- [ ] **Step 2.4: Modificar +layout.svelte para usar el Header**

Modificar `frontend/src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import ProcessStepper from '$lib/components/ProcessStepper.svelte';
</script>

<svelte:head>
  <title>Realista</title>
</svelte:head>

<Header />

<main>
  <slot />
</main>

<ProcessStepper />

<style>
  main {
    min-height: calc(100vh - 56px - 70px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
```

(Nota: importará `ProcessStepper` en Task 3. Si Task 2 se ejecuta antes de Task 3, dejar el import comentadado y descomentar al llegar a Task 3.)

- [ ] **Step 2.5: Correr el test del Header, ver que pasa**

```bash
cd frontend && npx vitest run tests/unit/components/Header.test.ts
```

Expected: 3 tests passing.

- [ ] **Step 2.6: Verificar typecheck**

```bash
cd frontend && npm run check
```

Expected: 0 errores (o warnings solo por el import de ProcessStepper pendiente).

- [ ] **Step 2.7: Commit**

```bash
git add frontend/src/lib/components/Header.svelte frontend/tests/unit/components/Header.test.ts frontend/src/routes/+layout.svelte
git commit -m "feat(frontend): sticky Header with Logo"
```

---

## Task 3: ProcessStepper (reemplaza NavTabs)

**Files:**
- Create: `frontend/src/lib/components/ProcessStepper.svelte`
- Create: `frontend/tests/unit/components/ProcessStepper.test.ts`
- Modify: `frontend/src/routes/+layout.svelte` (ya tiene el import pendiente)
- Delete: `frontend/src/lib/components/NavTabs.svelte`

- [ ] **Step 3.1: Verificar que el apiClient y tipos existen**

```bash
cd frontend && grep -E "apiClient|DashboardResponse" src/lib/api/client.ts src/lib/api/types.ts | head -20
```

Expected: `apiClient.get<T>()` exportado, `DashboardResponse` definido con campos `latestListing`, `process`, `checklist`. (Verificado: existen en el proyecto.) NO es necesario modificar `process.ts` — el plan usa `apiClient.get('/api/dashboard')` directamente en el `+layout.svelte`, igual que ya hace la página `/`.

- [ ] **Step 3.2: Escribir el test del ProcessStepper (failing)**

Crear `frontend/tests/unit/components/ProcessStepper.test.ts`:

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProcessStepper from '$lib/components/ProcessStepper.svelte';

describe('ProcessStepper', () => {
  const steps = [
    { id: 'listing', label: 'Anuncio', href: '/listing-lens' },
    { id: 'mortgage', label: 'Hipoteca', href: '/mortgage-compass' },
    { id: 'timeline', label: 'Cronograma', href: '/timeline' },
    { id: 'checklist', label: 'Checklist', href: '/checklist' },
  ];

  it('renderiza 4 pasos', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'listing', completedSteps: new Set() },
    });
    const items = container.querySelectorAll('[data-step-id]');
    expect(items.length).toBe(4);
  });

  it('marca el paso actual con la clase "current"', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set() },
    });
    const current = container.querySelector('[data-step-id="mortgage"]');
    expect(current?.className).toContain('current');
  });

  it('marca los completados con la clase "completed"', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set(['listing']) },
    });
    const completed = container.querySelector('[data-step-id="listing"]');
    expect(completed?.className).toContain('completed');
  });

  it('los pasos completados tienen un link', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set(['listing']) },
    });
    const completedLink = container.querySelector('[data-step-id="listing"] a');
    expect(completedLink?.getAttribute('href')).toBe('/listing-lens');
  });

  it('el paso actual NO tiene link (no-op al click)', () => {
    const { container } = render(ProcessStepper, {
      props: { steps, currentStep: 'mortgage', completedSteps: new Set() },
    });
    const currentLink = container.querySelector('[data-step-id="mortgage"] a');
    expect(currentLink).toBeNull();
  });
});
```

- [ ] **Step 3.3: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/ProcessStepper.test.ts
```

Expected: FAIL con module not found.

- [ ] **Step 3.4: Crear el ProcessStepper component**

Crear `frontend/src/lib/components/ProcessStepper.svelte`:

```svelte
<script lang="ts">
  export let steps: Array<{ id: string; label: string; href: string }>;
  export let currentStep: string;
  export let completedSteps: Set<string>;

  $: currentIndex = steps.findIndex((s) => s.id === currentStep);
</script>

<nav aria-label="Pasos del proceso" class="stepper">
  {#each steps as step, i}
    {@const isCurrent = step.id === currentStep}
    {@const isCompleted = completedSteps.has(step.id)}
    {@const isFuture = i > currentIndex}

    <div class="step" class:current={isCurrent} class:completed={isCompleted} class:future={isFuture} data-step-id={step.id}>
      {#if i > 0}
        <div class="connector" class:filled={i <= currentIndex || isCompleted}></div>
      {/if}

      <div class="step-content">
        {#if isCompleted && !isCurrent}
          <a href={step.href} class="step-link" aria-label="Ir a {step.label} (completado)">
            <span class="circle completed">✓</span>
            <span class="label">{step.label}</span>
          </a>
        {:else if isCurrent}
          <span class="step-link" aria-current="step">
            <span class="circle current">{i + 1}</span>
            <span class="label">{step.label}</span>
          </span>
        {:else}
          <span class="step-link disabled" aria-disabled="true">
            <span class="circle future">{i + 1}</span>
            <span class="label">{step.label}</span>
          </span>
        {/if}
      </div>
    </div>
  {/each}
</nav>

<style>
  .stepper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0.25rem;
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
    z-index: 10;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    min-width: 0;
  }
  .connector {
    position: absolute;
    top: 14px;
    left: -50%;
    right: 50%;
    height: 2px;
    background: var(--color-border);
  }
  .connector.filled {
    background: var(--color-primary);
  }
  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    z-index: 1;
    background: var(--color-bg);
    padding: 0 0.25rem;
  }
  .step-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    text-decoration: none;
    color: inherit;
    min-width: 60px;
  }
  .step-link.disabled {
    cursor: default;
  }
  .circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
  }
  .circle.current {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 0 0 4px #dbeafe;
  }
  .circle.completed {
    background: var(--color-primary);
    color: white;
  }
  .circle.future {
    background: transparent;
    border: 1.5px solid var(--color-border);
    color: var(--color-text-muted);
  }
  .label {
    font-size: 0.7rem;
    font-weight: 600;
  }
  .current .label {
    color: var(--color-primary);
  }
  .completed .label {
    color: var(--color-text-muted);
  }
  .future .label {
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 3.5: Actualizar +layout.svelte para pasar props al ProcessStepper**

Modificar `frontend/src/routes/+layout.svelte` (sustituir el bloque `<ProcessStepper />` por uno con props + lógica de fetch de completedSteps):

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import ProcessStepper from '$lib/components/ProcessStepper.svelte';
  import { apiClient } from '$lib/api/client';

  const STEPS = [
    { id: 'listing', label: 'Anuncio', href: '/listing-lens' },
    { id: 'mortgage', label: 'Hipoteca', href: '/mortgage-compass' },
    { id: 'timeline', label: 'Cronograma', href: '/timeline' },
    { id: 'checklist', label: 'Checklist', href: '/checklist' },
  ];

  const PATH_TO_STEP: Record<string, string> = {
    '/listing-lens': 'listing',
    '/mortgage-compass': 'mortgage',
    '/timeline': 'timeline',
    '/checklist': 'checklist',
  };

  $: currentStep = PATH_TO_STEP[$page.url.pathname] ?? 'listing';

  let completedSteps: Set<string> = new Set();

  onMount(async () => {
    try {
      const data = await apiClient.get<{
        latestListing: unknown | null;
        process: { propertyPrice: number | null; currentStage: string | null } | null;
        checklist: { completedItems: number; totalItems: number } | null;
      }>('/api/dashboard');
      const cs = new Set<string>();
      if (data.latestListing) cs.add('listing');
      if (data.process?.propertyPrice != null) cs.add('mortgage');
      if (data.process?.currentStage != null) cs.add('timeline');
      if (data.checklist && data.checklist.completedItems > 0) cs.add('checklist');
      completedSteps = cs;
    } catch {
      // si falla, mostrar todo como no completado
    }
  });
</script>

<svelte:head>
  <title>Realista</title>
</svelte:head>

<Header />

<main>
  <slot />
</main>

<ProcessStepper steps={STEPS} {currentStep} {completedSteps} />

<style>
  main {
    min-height: calc(100vh - 56px - 70px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
```

(Nota: el `apiClient` ya existe en el proyecto. Verificar import path exacto — puede ser `$lib/api/client` u otro.)

- [ ] **Step 3.6: Eliminar NavTabs.svelte**

```bash
rm frontend/src/lib/components/NavTabs.svelte
```

(Si algún test u otro archivo importa NavTabs, también eliminarlo. Buscar primero:)

```bash
cd frontend && grep -r "NavTabs" src/ tests/ e2e/
```

Si hay referencias, actualizarlas o eliminarlas.

- [ ] **Step 3.7: Correr el test del ProcessStepper, ver que pasa**

```bash
cd frontend && npx vitest run tests/unit/components/ProcessStepper.test.ts
```

Expected: 5 tests passing.

- [ ] **Step 3.8: Verificar typecheck**

```bash
cd frontend && npm run check
```

Expected: 0 errores.

- [ ] **Step 3.9: Commit**

```bash
git add frontend/src/lib/components/ProcessStepper.svelte frontend/tests/unit/components/ProcessStepper.test.ts frontend/src/routes/+layout.svelte
git rm frontend/src/lib/components/NavTabs.svelte 2>/dev/null || true
git commit -m "feat(frontend): ProcessStepper replaces NavTabs (4-step sequenced nav)"
```

---

## Task 4: Landing + dashboard reubicado

**Files:**
- Create: `frontend/src/routes/mi-proceso/+page.svelte`
- Create: `frontend/src/lib/components/LandingHero.svelte`
- Create: `frontend/src/lib/components/LandingStepper.svelte`
- Create: `frontend/tests/unit/components/LandingHero.test.ts`
- Create: `frontend/tests/unit/components/LandingStepper.test.ts`
- Modify: `frontend/src/routes/+page.svelte` (reemplazar por landing)

- [ ] **Step 4.1: Capturar el contenido actual de /+page.svelte**

```bash
cd frontend && cat src/routes/+page.svelte
```

Expected: el dashboard actual (lo vimos en el context). Vamos a mover este contenido a `mi-proceso/+page.svelte`.

- [ ] **Step 4.2: Crear /mi-proceso/+page.svelte con el contenido del dashboard**

Crear `frontend/src/routes/mi-proceso/+page.svelte` con el mismo contenido que tenía el actual `+page.svelte` (ver context del spec). El contenido exacto es el dashboard que ya existe — copiarlo tal cual.

- [ ] **Step 4.3: Escribir el test de LandingHero (failing)**

Crear `frontend/tests/unit/components/LandingHero.test.ts`:

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LandingHero from '$lib/components/LandingHero.svelte';

describe('LandingHero', () => {
  it('muestra el H1 principal', () => {
    const { container } = render(LandingHero);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('ojos abiertos');
  });

  it('muestra el sub-hero', () => {
    const { container } = render(LandingHero);
    const sub = container.querySelector('.sub');
    expect(sub?.textContent).toContain('Sin humo');
  });

  it('el CTA apunta a /listing-lens', () => {
    const { container } = render(LandingHero);
    const cta = container.querySelector('a.cta, button.cta, a[href="/listing-lens"], button[type="button"]');
    const link = container.querySelector('a[href="/listing-lens"]');
    expect(link).toBeTruthy();
  });
});
```

- [ ] **Step 4.4: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/LandingHero.test.ts
```

Expected: FAIL.

- [ ] **Step 4.5: Crear LandingHero**

Crear `frontend/src/lib/components/LandingHero.svelte`:

```svelte
<script lang="ts">
  import AIDisclaimer from './AIDisclaimer.svelte';
</script>

<section class="hero">
  <h1>Compra una casa<br />con los ojos abiertos</h1>
  <p class="sub">Análisis honesto de anuncios y simulación de hipoteca. Sin humo.</p>
  <a href="/listing-lens" class="btn-primary cta">Empezar por el paso 1</a>
  <AIDisclaimer compact />
</section>

<style>
  .hero {
    text-align: center;
    padding: 2rem 1rem 1rem;
  }
  h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-brand);
    line-height: 1.15;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }
  .sub {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin: 0 auto 1.5rem;
    max-width: 32ch;
    line-height: 1.4;
  }
  .cta {
    display: inline-block;
    text-decoration: none;
    margin-bottom: 1rem;
  }
</style>
```

- [ ] **Step 4.6: Escribir el test de LandingStepper (failing)**

Crear `frontend/tests/unit/components/LandingStepper.test.ts`:

```ts
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import LandingStepper from '$lib/components/LandingStepper.svelte';

describe('LandingStepper', () => {
  it('muestra 4 pasos con número y label', () => {
    const { container } = render(LandingStepper);
    const steps = container.querySelectorAll('[data-step-number]');
    expect(steps.length).toBe(4);
  });

  it('el paso 1 menciona Anuncio', () => {
    const { container } = render(LandingStepper);
    const step1 = container.querySelector('[data-step-number="1"]');
    expect(step1?.textContent).toContain('Anuncio');
  });
});
```

- [ ] **Step 4.7: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/LandingStepper.test.ts
```

Expected: FAIL.

- [ ] **Step 4.8: Crear LandingStepper**

Crear `frontend/src/lib/components/LandingStepper.svelte`:

```svelte
<script lang="ts">
  const STEPS = [
    { num: 1, label: 'Analiza un anuncio' },
    { num: 2, label: 'Simula tu hipoteca' },
    { num: 3, label: 'Sigue el cronograma' },
    { num: 4, label: 'No pierdas ningún documento' },
  ];
</script>

<section class="landing-stepper" aria-label="Los 4 pasos del proceso">
  {#each STEPS as step, i}
    <div class="step" data-step-number={step.num}>
      {#if i > 0}
        <div class="connector"></div>
      {/if}
      <div class="circle">{step.num}</div>
      <div class="label">{step.label}</div>
    </div>
  {/each}
</section>

<style>
  .landing-stepper {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1.5rem 0.5rem;
    max-width: 600px;
    margin: 0 auto;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .connector {
    position: absolute;
    top: 18px;
    left: -50%;
    right: 50%;
    height: 2px;
    background: var(--color-border);
  }
  .circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-bg-soft);
    border: 2px solid var(--color-border);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.95rem;
    z-index: 1;
    position: relative;
    background: var(--color-bg);
  }
  .label {
    font-size: 0.8rem;
    color: var(--color-text);
    margin-top: 0.5rem;
    line-height: 1.3;
    max-width: 12ch;
  }
</style>
```

- [ ] **Step 4.9: Reemplazar +page.svelte por la nueva landing**

Modificar `frontend/src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import LandingHero from '$lib/components/LandingHero.svelte';
  import LandingStepper from '$lib/components/LandingStepper.svelte';
</script>

<div class="container">
  <LandingHero />
  <LandingStepper />

  <p class="disclaimer">
    ⚠️ Análisis orientativo. No constituye asesoramiento financiero ni jurídico.
  </p>
</div>

<style>
  .container {
    max-width: 768px;
    margin: 0 auto;
    padding: 1rem;
    padding-bottom: 6rem;
  }
  .disclaimer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 2rem;
    padding: 0 1rem;
  }
</style>
```

- [ ] **Step 4.10: Correr los tests de los nuevos componentes, ver que pasan**

```bash
cd frontend && npx vitest run tests/unit/components/LandingHero.test.ts tests/unit/components/LandingStepper.test.ts
```

Expected: 4 tests passing (3 de Hero, 2 de Stepper, total 5 — verifica el conteo real con la implementación).

- [ ] **Step 4.11: Verificar typecheck**

```bash
cd frontend && npm run check
```

Expected: 0 errores.

- [ ] **Step 4.12: Verificar manualmente que el dashboard reubicado funciona**

Levantar frontend y backend (o solo frontend contra mock), ir a:
- `/` → debe verse la nueva landing
- `/mi-proceso` → debe verse el dashboard antiguo

- [ ] **Step 4.13: Commit**

```bash
git add frontend/src/routes/mi-proceso/+page.svelte frontend/src/routes/+page.svelte frontend/src/lib/components/LandingHero.svelte frontend/src/lib/components/LandingStepper.svelte frontend/tests/unit/components/LandingHero.test.ts frontend/tests/unit/components/LandingStepper.test.ts
git commit -m "feat(frontend): landing at / + dashboard moved to /mi-proceso"
```

---

## Task 5: ListingTabs + paste fallback

**Files:**
- Create: `frontend/src/lib/components/ListingTabs.svelte`
- Create: `frontend/tests/unit/components/ListingTabs.test.ts`
- Modify: `frontend/src/routes/listing-lens/+page.svelte`
- Modify: `e2e/flows/full-flow.spec.ts` (extender con aserciones de paste fallback)

- [ ] **Step 5.1: Escribir el test de ListingTabs (failing)**

Crear `frontend/tests/unit/components/ListingTabs.test.ts`:

```ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ListingTabs from '$lib/components/ListingTabs.svelte';

describe('ListingTabs', () => {
  it('muestra ambas tabs (URL y Texto)', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    expect(container.textContent).toContain('URL');
    expect(container.textContent).toContain('Texto');
  });

  it('la tab URL está activa por defecto', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    const urlField = container.querySelector('input[type="url"]');
    expect(urlField).toBeTruthy();
  });

  it('cambia a tab Texto al hacer click', async () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: false, onAnalize: vi.fn() },
    });
    const textTab = container.querySelector('[data-tab="text"]');
    if (textTab) await fireEvent.click(textTab);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('marca la tab URL como tachada cuando urlBlocked=true', () => {
    const { container } = render(ListingTabs, {
      props: { url: '', manualText: '', urlBlocked: true, onAnalize: vi.fn() },
    });
    const urlTab = container.querySelector('[data-tab="url"]');
    expect(urlTab?.className).toContain('blocked');
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
```

- [ ] **Step 5.2: Correr el test, ver que falla**

```bash
cd frontend && npx vitest run tests/unit/components/ListingTabs.test.ts
```

Expected: FAIL.

- [ ] **Step 5.3: Crear ListingTabs**

Crear `frontend/src/lib/components/ListingTabs.svelte`:

```svelte
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let url: string = '';
  export let manualText: string = '';
  export let urlBlocked: boolean = false;
  export let disabled: boolean = false;
  export let onAnalize: (data: { url: string; manualText: string }) => void;

  let activeTab: 'url' | 'text' = 'url';

  $: if (urlBlocked && activeTab === 'url') {
    activeTab = 'text';
  }

  const dispatch = createEventDispatcher();

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onAnalize({ url, manualText });
  }
</script>

<form on:submit={handleSubmit}>
  <div class="tabs" role="tablist">
    <button
      type="button"
      role="tab"
      data-tab="url"
      class:active={activeTab === 'url'}
      class:blocked={urlBlocked}
      aria-selected={activeTab === 'url'}
      on:click={() => (activeTab = 'url')}
    >
      URL
      {#if urlBlocked}<span class="x-icon" aria-label="no disponible">✕</span>{/if}
    </button>
    <button
      type="button"
      role="tab"
      data-tab="text"
      class:active={activeTab === 'text'}
      aria-selected={activeTab === 'text'}
      on:click={() => (activeTab = 'text')}
    >
      Texto
    </button>
  </div>

  {#if urlBlocked}
    <div class="banner-error" role="alert">
      <strong>URL no disponible</strong>
      <p>Este portal bloqueó la petición. Pega el texto del anuncio.</p>
    </div>
  {/if}

  {#if activeTab === 'url'}
    <label for="url">URL del anuncio</label>
    <input
      id="url"
      type="url"
      bind:value={url}
      placeholder="https://www.idealista.com/inmueble/..."
      {disabled}
    />
  {:else}
    <label for="manualText">Texto del anuncio</label>
    <textarea
      id="manualText"
      bind:value={manualText}
      placeholder="Copia el texto del anuncio y pégalo aquí…"
      rows="6"
      {disabled}
    ></textarea>
  {/if}

  <button class="btn-primary" type="submit" disabled={disabled || (!url.trim() && !manualText.trim())}>
    {activeTab === 'url' ? 'Analizar' : 'Analizar texto'}
  </button>
</form>

<style>
  .tabs {
    display: flex;
    background: var(--color-bg-soft);
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 1rem;
  }
  .tabs button {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-muted);
    cursor: pointer;
    position: relative;
  }
  .tabs button.active {
    background: var(--color-bg);
    color: var(--color-brand);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  .tabs button.blocked {
    color: var(--color-text-muted);
    text-decoration: line-through;
    opacity: 0.7;
    cursor: not-allowed;
  }
  .x-icon {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--color-danger);
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  .banner-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .banner-error strong {
    color: var(--color-danger);
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.25rem;
  }
  .banner-error p {
    color: #7f1d1d;
    font-size: 0.8rem;
    margin: 0;
  }
  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  textarea {
    width: 100%;
    font-family: inherit;
    resize: vertical;
  }
  button[type="submit"] {
    margin-top: 0.75rem;
    width: 100%;
  }
</style>
```

- [ ] **Step 5.4: Modificar listing-lens/+page.svelte para usar ListingTabs**

Modificar `frontend/src/routes/listing-lens/+page.svelte` (sustituir el bloque `<form>` por `<ListingTabs />`):

```svelte
<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import RedFlagCard from '$lib/components/RedFlagCard.svelte';
  import NegotiationPoints from '$lib/components/NegotiationPoints.svelte';
  import ListingTabs from '$lib/components/ListingTabs.svelte';
  import { ApiError } from '$lib/api/client';
  import { analyzeListingStream } from '$lib/api/streamingClient';
  import { session } from '$lib/stores/session';
  import { formatCurrency, formatDate, scoreColor } from '$lib/utils/format';
  import type { AnalyzeListingResponse, RedFlagItem } from '$lib/api/types';

  let url = '';
  let manualText = '';
  let urlBlocked = false;
  let loading = false;
  let error: string | null = null;
  let result: AnalyzeListingResponse | null = null;
  let currentStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  async function handleAnalyze(data: { url: string; manualText: string }): Promise<void> {
    loading = true;
    error = null;
    result = null;
    currentStep = 'fetching_html';

    try {
      result = await analyzeListingStream(
        { url: data.url, manualText: data.manualText || undefined, sessionId: $session.sessionId },
        (event) => { currentStep = event; },
      );
      urlBlocked = false;
    } catch (e) {
      if (e instanceof ApiError) {
        error = `${e.code}: ${e.message}`;
        if (e.code === 'PORTAL_BLOCKED' || e.code === 'BLOCKED') {
          urlBlocked = true;
        }
      } else {
        error = e instanceof Error ? e.message : 'Error de red. Inténtalo de nuevo.';
      }
    } finally {
      loading = false;
      currentStep = null;
    }
  }
</script>

<div class="container">
  <h1>Analizar anuncio</h1>
  <AIDisclaimer />

  <ListingTabs
    bind:url
    bind:manualText
    bind:urlBlocked
    disabled={loading}
    onAnalize={handleAnalyze}
  />

  {#if loading}
    <LoadingState activeStep={currentStep} />
  {/if}

  {#if error && !urlBlocked}
    <div class="card error">
      <p>{error}</p>
    </div>
  {/if}

  {#if result}
    <section class="card result">
      <h2>Resultado</h2>
      <div class="score" style="color: {scoreColor(result.listing.transparencyScore)}">
        {result.listing.transparencyScore}/100
      </div>
      <p class="text-muted">
        Etiqueta: <strong>{result.listing.scoreLabel}</strong>
        · {formatDate(result.listing.createdAt)}
      </p>

      {#if result.listing.summary}
        <p>{result.listing.summary}</p>
      {/if}

      {#if result.listing.redFlags.length > 0}
        <h3>Banderas rojas ({result.listing.redFlags.length})</h3>
        {#each result.listing.redFlags as flag}
          <RedFlagCard flag={flag} />
        {/each}
        <NegotiationPoints listingId={result.listing.id} />
      {:else}
        <p class="text-muted">No se detectaron banderas rojas.</p>
      {/if}

      {#if result.listing.catastroMatch}
        <h3>Verificación catastral</h3>
        <p><strong>Referencia:</strong> {result.listing.catastroMatch.cadastralReference}</p>
        <p><strong>Superficie oficial:</strong> {result.listing.catastroMatch.officialSquareMeters} m²</p>
        {#if result.listing.catastroMatch.yearBuilt}
          <p><strong>Año de construcción:</strong> {result.listing.catastroMatch.yearBuilt}</p>
        {/if}
      {/if}

      {#if result.processSummary.propertyPrice}
        <p class="text-muted">
          Precio detectado: {formatCurrency(result.processSummary.propertyPrice)}
        </p>
      {/if}
    </section>
  {/if}
</div>

<style>
  .container {
    max-width: 768px;
    margin: 0 auto;
    padding: 1rem;
    padding-bottom: 6rem;
  }
  .error {
    border-color: var(--color-danger);
    margin-top: 1rem;
  }
  .score {
    font-size: 3rem;
    font-weight: 700;
    text-align: center;
    margin: 0.5rem 0;
  }
  .result {
    margin-top: 1rem;
  }
  h3 {
    font-size: 1rem;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
</style>
```

- [ ] **Step 5.5: Correr el test de ListingTabs, ver que pasa**

```bash
cd frontend && npx vitest run tests/unit/components/ListingTabs.test.ts
```

Expected: 4 tests passing.

- [ ] **Step 5.6: Verificar typecheck**

```bash
cd frontend && npm run check
```

Expected: 0 errores.

- [ ] **Step 5.7: Verificar manualmente en navegador**

Levantar frontend + backend. Ir a `/listing-lens`:
- Ver 2 tabs (URL/Texto)
- Tab URL activa por defecto
- Click en Tab Texto → aparece textarea
- Click en Tab URL → vuelve al input
- Con dev tools, simular un error `ApiError code='PORTAL_BLOCKED'` y verificar que la tab URL se tacha y salta a Texto

(Para test automatizado del flujo de error, ver Step 5.8.)

- [ ] **Step 5.8: Añadir e2e test del paste fallback**

Crear `e2e/flows/ux-redesign.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('UX redesign', () => {
  test('landing visible en /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /ojos abiertos/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Empezar por el paso 1/i })).toBeVisible();
  });

  test('header sticky con logo', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    await expect(header.getByText('Realista')).toBeVisible();
  });

  test('process stepper muestra 4 pasos', async ({ page }) => {
    await page.goto('/listing-lens');
    const stepper = page.locator('nav[aria-label="Pasos del proceso"]');
    await expect(stepper).toBeVisible();
    await expect(stepper.locator('[data-step-id]')).toHaveCount(4);
  });

  test('listing-lens tiene tabs URL/Texto', async ({ page }) => {
    await page.goto('/listing-lens');
    await expect(page.getByRole('tab', { name: 'URL' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Texto' })).toBeVisible();
  });

  test('click en tab Texto muestra textarea', async ({ page }) => {
    await page.goto('/listing-lens');
    await page.getByRole('tab', { name: 'Texto' }).click();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('dashboard reubicado en /mi-proceso', async ({ page }) => {
    await page.goto('/mi-proceso');
    await expect(page.getByRole('heading', { name: /Tu proceso/i })).toBeVisible();
  });
});
```

- [ ] **Step 5.9: Correr los e2e tests**

```bash
cd frontend && npm run test:e2e -- ux-redesign.spec.ts
```

(Requiere backend levantado. Ajustar al flujo de tests del proyecto.)

Expected: 6 tests passing.

- [ ] **Step 5.10: Commit**

```bash
git add frontend/src/lib/components/ListingTabs.svelte frontend/tests/unit/components/ListingTabs.test.ts frontend/src/routes/listing-lens/+page.svelte e2e/flows/ux-redesign.spec.ts
git commit -m "feat(frontend): ListingTabs with URL/Text toggle + paste fallback UI"
```

---

## Task 6: Backend — UA + headers + retry

**Files:**
- Modify: `backend/src/infrastructure/utils/urlValidator.ts`
- Modify: `backend/src/adapters/cheerio/CheerioAdapter.ts`
- Create: `backend/tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts`
- Create: `backend/tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts`

- [ ] **Step 6.1: Verificar el setup de tests del backend**

```bash
cd backend && npm test -- --run CheerioAdapter 2>&1 | head -20
```

(Verificar que el setup funciona. Si falla, parar y resolver.)

- [ ] **Step 6.2: Escribir el test de headers (failing)**

Crear `backend/tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fetch from 'node-fetch';
import { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import { isAllowedPortal } from '../../../../src/infrastructure/utils/urlValidator';

vi.mock('node-fetch');
vi.mock('../../../../src/infrastructure/utils/urlValidator', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/infrastructure/utils/urlValidator')>();
  return {
    ...mod,
    isAllowedPortal: vi.fn(() => true),
  };
});

describe('CheerioAdapter — headers', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    vi.mocked(isAllowedPortal).mockReturnValue(true);
  });

  it('envía los headers de navegador en la primera petición', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => '<html><body><div class="price">200.000 €</div></body></html>',
    } as any);

    const adapter = new CheerioAdapter();
    await adapter.fetch('https://www.idealista.com/inmueble/123');

    expect(fetch).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(fetch).mock.calls[0];
    const headers = callArgs[1]?.headers as Record<string, string>;
    expect(headers['User-Agent']).toContain('Chrome');
    expect(headers['Accept']).toContain('text/html');
    expect(headers['Accept-Language']).toContain('es');
    expect(headers['Accept-Encoding']).toContain('gzip');
    expect(headers['Sec-Fetch-Dest']).toBe('document');
  });
});
```

- [ ] **Step 6.3: Correr el test, ver que falla**

```bash
cd backend && npx vitest run tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts
```

Expected: FAIL.

- [ ] **Step 6.4: Añadir constantes en urlValidator.ts**

Modificar `backend/src/infrastructure/utils/urlValidator.ts` — añadir al final:

```ts
export const CHROME_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': CHROME_USER_AGENT,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};
```

- [ ] **Step 6.5: Modificar CheerioAdapter para usar los nuevos headers**

Modificar `backend/src/adapters/cheerio/CheerioAdapter.ts` — sustituir la sección de headers en `tryFetch`:

```ts
import { CHROME_USER_AGENT, BROWSER_HEADERS, isAllowedPortal, REALISTA_USER_AGENT } from '../../infrastructure/utils/urlValidator';
```

Y dentro de `tryFetch`, cambiar el objeto `headers`:

```ts
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(env.NODE_ENV === 'test' ? 2000 : 10000),
    });
```

(`REALISTA_USER_AGENT` se mantiene en el import por compatibilidad con otros adapters o tests, pero ya no se usa en `tryFetch`.)

- [ ] **Step 6.6: Correr el test de headers, ver que pasa**

```bash
cd backend && npx vitest run tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts
```

Expected: 1 test passing.

- [ ] **Step 6.7: Escribir el test de retry (failing)**

Crear `backend/tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fetch from 'node-fetch';
import { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import { isAllowedPortal } from '../../../../src/infrastructure/utils/urlValidator';

vi.mock('node-fetch');
vi.mock('../../../../src/infrastructure/utils/urlValidator', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/infrastructure/utils/urlValidator')>();
  return {
    ...mod,
    isAllowedPortal: vi.fn(() => true),
  };
});

describe('CheerioAdapter — retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockReset();
    vi.mocked(isAllowedPortal).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reintenta ante error de red hasta 4 veces', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network'));

    const adapter = new CheerioAdapter();
    const promise = adapter.fetch('https://www.idealista.com/inmueble/123');

    // Adelantar los timers de backoff (1s, 2s, 4s) sin esperar tiempo real
    await vi.runAllTimersAsync().catch(() => {});

    await expect(promise).rejects.toThrow();
    // 4 fetches totales (1 inicial + 3 reintentos) por dominio, más el .m. fallback
    expect(fetch).toHaveBeenCalled();
  });

  it('NO reintenta ante 4xx (403)', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => '',
    } as any);

    const adapter = new CheerioAdapter();
    await expect(adapter.fetch('https://www.idealista.com/inmueble/123')).rejects.toThrow();
    // 1 fetch al www + 1 al m. (fallback), sin reintentos
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
```

- [ ] **Step 6.8: Correr el test, ver que falla**

```bash
cd backend && npx vitest run tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts
```

Expected: FAIL (porque el retry aún no está implementado).

- [ ] **Step 6.9: Añadir lógica de retry en CheerioAdapter**

Modificar `backend/src/adapters/cheerio/CheerioAdapter.ts` — sustituir el método `tryFetch` por una versión con retry. La estructura general:

```ts
  private async tryFetch(url: string, domain: string): Promise<string | null> {
    const maxAttempts = 4;
    const backoffMs = [0, 1000, 2000, 4000];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (backoffMs[attempt] > 0) {
        await this.sleep(backoffMs[attempt]);
      }
      try {
        const res = await fetch(url, {
          headers: BROWSER_HEADERS,
          redirect: 'follow',
          signal: AbortSignal.timeout(env.NODE_ENV === 'test' ? 2000 : 10000),
        });
        if (!res.ok) {
          if (res.status >= 400 && res.status < 500) {
            // 4xx no se reintenta
            this.recordFailure(domain);
            return null;
          }
          // 5xx: reintentar
          this.recordFailure(domain);
          continue;
        }
        this.recordSuccess(domain);
        return await res.text();
      } catch (err) {
        // error de red: reintentar
        this.recordFailure(domain);
      }
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    if (env.NODE_ENV === 'test') {
      // En tests, el caller usa fake timers — devolvemos una promesa que se resolverá cuando el caller avance el tiempo
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
```

(Ajustar el sleep para que sea compatible con `vi.useFakeTimers()` de Vitest.)

- [ ] **Step 6.10: Correr el test de retry, ver que pasa**

```bash
cd backend && npx vitest run tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts
```

Expected: 2 tests passing (puede requerir ajustes del sleep con fake timers).

- [ ] **Step 6.11: Correr TODOS los tests del CheerioAdapter**

```bash
cd backend && npx vitest run tests/unit/adapters/cheerio/
```

Expected: todos los tests pasan.

- [ ] **Step 6.12: Verificar typecheck del backend**

```bash
cd backend && npx tsc --noEmit
```

Expected: 0 errores.

- [ ] **Step 6.13: Commit**

```bash
git add backend/src/infrastructure/utils/urlValidator.ts backend/src/adapters/cheerio/CheerioAdapter.ts backend/tests/unit/adapters/cheerio/CheerioAdapter.headers.test.ts backend/tests/unit/adapters/cheerio/CheerioAdapter.retry.test.ts
git commit -m "feat(backend): CheerioAdapter uses Chrome UA + browser headers + exponential retry"
```

---

## Task 7: PWA icons + favicon

**Files:**
- Regenerate: `frontend/static/icons/icon-192.png`
- Regenerate: `frontend/static/icons/icon-512.png`
- Regenerate: `frontend/static/icons/maskable-icon-512.png`
- Create: `frontend/static/favicon.ico`

- [ ] **Step 7.1: Verificar herramientas disponibles**

```bash
which magick convert sharp 2>/dev/null; ls frontend/node_modules/sharp 2>/dev/null
```

Expected: al menos una de las herramientas (ImageMagick `magick` o `convert`, o `sharp` instalado).

Si no hay ninguna, instalar `sharp` localmente:

```bash
cd frontend && npm install --save-dev sharp
```

- [ ] **Step 7.2: Generar los iconos**

Si tienes ImageMagick:

```bash
cd frontend
SVG=static/icons/source.svg  # si tienes un SVG fuente, úsalo; si no, exporta el Logo
# Si el Logo.svelte tiene un SVG source, exportarlo primero
cat > /tmp/logo-icon.svg << 'EOF'
<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 34 L10 22 L28 6 L46 22 L46 34 Z" stroke="#1e3a8a" stroke-width="3" fill="none" stroke-linejoin="round"/>
  <line x1="10" y1="34" x2="46" y2="34" stroke="#1e3a8a" stroke-width="3"/>
  <line x1="0" y1="4" x2="19" y2="14" stroke="#ef4444" stroke-width="1.8"/>
  <line x1="0" y1="9" x2="19" y2="14" stroke="#eab308" stroke-width="1.8"/>
  <line x1="0" y1="14" x2="19" y2="14" stroke="#3b82f6" stroke-width="1.8"/>
  <line x1="37" y1="14" x2="58" y2="14" stroke="#1e3a8a" stroke-width="3"/>
  <circle cx="60" cy="14" r="3" fill="#1e3a8a"/>
</svg>
EOF

magick -background none -density 600 /tmp/logo-icon.svg -resize 192x192 static/icons/icon-192.png
magick -background none -density 600 /tmp/logo-icon.svg -resize 512x512 static/icons/icon-512.png
magick -background none -density 600 /tmp/logo-icon.svg -resize 512x512 -bordercolor white -border 64x64 static/icons/maskable-icon-512.png
```

Si tienes `sharp` en su lugar (script Node):

Crear `frontend/scripts/generate-icons.mjs`:

```js
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('/tmp/logo-icon.svg');

const sizes = [
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
  { size: 512, file: 'maskable-icon-512.png', padding: 64 },
];

for (const { size, file, padding = 0 } of sizes) {
  const target = size + padding * 2;
  await sharp(svg, { density: 600 })
    .resize(size, size)
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(`static/icons/${file}`);
  console.log(`Generated ${file}`);
}

// favicon
await sharp(svg, { density: 600 })
  .resize(32, 32)
  .png()
  .toFile('static/favicon.png');

// Convertir PNG a ICO (usar sharp + un truco)
const png = await sharp(svg, { density: 600 }).resize(32, 32).png().toBuffer();
// Para un favicon.ico simple, podemos renombrar el PNG
import { writeFileSync } from 'fs';
writeFileSync('static/favicon.ico', png);
console.log('Generated favicon.ico');
```

```bash
cd frontend && node scripts/generate-icons.mjs
```

- [ ] **Step 7.3: Verificar los iconos generados**

```bash
ls -la frontend/static/icons/ frontend/static/favicon.ico 2>/dev/null
file frontend/static/icons/*.png frontend/static/favicon.ico 2>/dev/null
```

Expected: 3 PNGs (192, 512, 512-maskable) + 1 favicon.ico, todos > 1KB.

- [ ] **Step 7.4: Verificar que el build no se queja de los iconos**

```bash
cd frontend && npm run build 2>&1 | grep -i "icon\|warn" | head -20
```

Expected: sin warnings de iconos faltantes. Si hay warnings, ajustar el manifest.webmanifest en `static/`.

- [ ] **Step 7.5: Verificar que el manifest apunta a los nuevos iconos**

```bash
cd frontend && cat static/manifest.webmanifest 2>/dev/null || cat static/manifest.json 2>/dev/null
```

Expected: las rutas `icons/icon-192.png` y `icons/icon-512.png` existen y son accesibles (responden 200).

- [ ] **Step 7.6: Commit**

```bash
git add frontend/static/icons/ frontend/static/favicon.ico frontend/scripts/generate-icons.mjs 2>/dev/null
git commit -m "chore(frontend): regenerate PWA icons + favicon with new logo"
```

---

## Verificación final end-to-end

Antes de mergear, ejecutar todos los pasos de verificación del spec (líneas 308-316):

- [ ] **V1: Frontend check + tests**

```bash
cd frontend && npm run check && npm run test
```

Expected: 0 errores en check, todos los tests passing (incluyendo los 6 nuevos de componentes).

- [ ] **V2: Backend check + tests**

```bash
cd backend && npx tsc --noEmit && npm test
```

Expected: 0 errores de typecheck, todos los tests passing (incluyendo headers + retry).

- [ ] **V3: Frontend build**

```bash
cd frontend && npm run build
```

Expected: build sin warnings de iconos.

- [ ] **V4: E2E tests (con backend levantado)**

```bash
cd frontend && npm run test:e2e
```

Expected: todos los e2e (incluyendo `ux-redesign.spec.ts`) pasan.

- [ ] **V5: Smoke test manual**

Levantar backend y frontend, abrir DevTools, recorrer:
1. `http://localhost:5173/` → landing visible, H1 "ojos abiertos", CTA apunta a `/listing-lens`
2. Click CTA → navega a `/listing-lens`, ve tabs URL/Texto
3. Header sticky visible con logo
4. Stepper 4 pasos visible abajo, paso 1 marcado como current
5. Pega una URL cualquiera y submit → ver loading → ver resultado (o error)
6. Con dev tools, interceptar la respuesta para forzar un `code: 'PORTAL_BLOCKED'` → ver la tab URL tachada con ✕ y la tab Texto activa
7. Pegar texto del anuncio → ver resultado correcto
8. `http://localhost:5173/mi-proceso` → dashboard reubicado
9. Responsive en mobile (DevTools iPhone SE): header sigue legible, stepper sigue 4 columnas (puede requerir scroll horizontal en pantallas muy estrechas)

- [ ] **V6: Commit final con CHANGELOG o PR description**

Crear el PR con descripción que resuma los 7 commits y referencie el spec + plan.

---

## Self-Review

(Lo ejecuto yo al final antes de pasarte el plan, no necesitas hacerlo.)

Spec coverage:
- [x] D1 (landing + dashboard) → Task 4
- [x] D2 (Header) → Task 2
- [x] D3 (ProcessStepper) → Task 3
- [x] D4 (Landing content) → Task 4
- [x] D5 (ListingTabs) → Task 5
- [x] D6 (Backend UA/headers/retry) → Task 6
- [x] PWA icons → Task 7

Placeholder scan: sin "TBD" / "TODO" / "fill in details". Todos los pasos con código real.

Type consistency:
- `Logo` props: `variant: 'full' | 'icon'`, `height: string` — usado en Header (Task 2) y en Landing (no, Landing no usa Logo). Consistente.
- `Header` no props, slot default — usado en +layout.svelte (Task 2). Consistente.
- `ProcessStepper` props: `steps: Array<{id, label, href}>`, `currentStep: string`, `completedSteps: Set<string>` — usado en +layout.svelte (Task 3). Consistente.
- `ListingTabs` props: `url: string`, `manualText: string`, `urlBlocked: boolean`, `disabled: boolean`, `onAnalize: (data) => void` — usado en listing-lens (Task 5). Consistente.
- `LandingHero` no props — usado en +page.svelte (Task 4). Consistente.
- `LandingStepper` no props — usado en +page.svelte (Task 4). Consistente.
- Backend `BROWSER_HEADERS` y `CHROME_USER_AGENT` desde `urlValidator.ts` — usado en `CheerioAdapter` (Task 6). Consistente.

OK. Plan completo.
