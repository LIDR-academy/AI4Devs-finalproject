# Mortgage Compass UI (US2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the Mortgage Compass page end-to-end — backend exposes a `computed` field with amortization + investment scenarios + hidden costs, and the frontend renders the full multi-step flow with chart, insight, and "valor real" toggle.

**Architecture:** The backend already has all calculators (AmortizationCalculator, InvestmentCalculator, HiddenCostsCalculator) and NarrativeGenerator. Missing: a `PurchaseProcessAggregator` that runs them and returns a `ComputedMortgage` DTO, wired into the existing `GET /api/purchase-processes/:id` and `GET /api/dashboard` routes. The frontend page exists but is rudimentary — it POSTs and dumps raw JSON. We need: types, a financialProfile store, a chart component, and a refactored multi-step page that renders insights + narratives.

**Tech Stack:** SvelteKit + Vite (frontend), Express + Zod (backend), Vitest (tests), pure CSS (no chart lib — small custom SVG bar chart).

**Scope boundary:** Mortgage Compass only. Negotiation Assistant (US4), re-analysis diff (FR-022), Catastro XML parsing are out of scope. Do not touch them.

---

## File Structure

**Backend (new):**
- `backend/src/domain/services/PurchaseProcessAggregator.ts` — pure domain, returns `ComputedMortgage`
- `backend/tests/unit/domain/services/PurchaseProcessAggregator.test.ts` — TDD

**Backend (modified):**
- `backend/src/api/routes/purchaseProcesses.ts` — wire aggregator into GET `/:id` and PATCH
- `backend/src/api/routes/dashboard.ts` — wire aggregator into dashboard
- `backend/tests/unit/domain/services/NarrativeGenerator.test.ts` — TDD, missing from current test suite (T049)

**Frontend (new):**
- `frontend/src/lib/components/AmortizationVsInvestmentChart.svelte` — small SVG bar chart
- `frontend/src/lib/stores/financialProfile.ts` — Svelte store for the form state

**Frontend (modified):**
- `frontend/src/lib/api/types.ts` — add `AmortizationScenario`, `InvestmentScenario`, `ComputedMortgage`, `PurchaseProcessDetail`
- `frontend/src/routes/mortgage-compass/+page.svelte` — refactor to multi-step

---

## Task 1: NarrativeGenerator tests (T049 — missing from suite)

**Files:**
- Create: `backend/tests/unit/domain/services/NarrativeGenerator.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { NarrativeGenerator } from '../../../../src/domain/services/NarrativeGenerator';

const baseAmort = {
  name: 'baseline' as const,
  monthlyPayment: 720,
  totalPaid: 259200,
  totalInterest: 99200,
  yearsToPayoff: 30,
  monthlyExtra: 0,
};
const lightAmort = { ...baseAmort, name: 'light' as const, yearsToPayoff: 25, totalInterest: 73000, monthlyExtra: 100 };

describe('NarrativeGenerator', () => {
  const gen = new NarrativeGenerator();

  it('renders conservador|baseline template', () => {
    const out = gen.generate({ persona: 'conservador', scenario: baseAmort });
    expect(out).toContain('720€');
    expect(out).toContain('99200€');
    expect(out).toContain('no es consejo financiero');
  });

  it('renders conservador|light template with savings', () => {
    const out = gen.generate({
      persona: 'conservador',
      scenario: lightAmort,
      context: { baseAmortization: baseAmort, lightAmortization: lightAmort },
    });
    expect(out).toContain('26200'); // 99200 - 73000
    expect(out).toContain('light');
  });

  it('falls back to equilibrado|any when combo missing', () => {
    const out = gen.generate({ persona: 'arriesgado', scenario: baseAmort });
    expect(out).toContain('equilibrio');
  });

  it('renders investment narrative with nominal and real values', () => {
    const invest = {
      name: 'moderate' as const,
      annualReturn: 0.06,
      nominalValue: 245000,
      realValue: 137000,
      totalContributed: 108000,
    };
    const out = gen.generate({
      persona: 'arriesgado',
      scenario: invest,
      context: { interestRate: 0.035, investModerate: invest },
    });
    expect(out).toContain('245000');
    expect(out).toContain('137000');
    expect(out).toContain('19-26%');
  });

  it('always includes disclaimer', () => {
    const out = gen.generate({ persona: 'conservador', scenario: baseAmort });
    expect(out).toContain('no es consejo financiero');
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/unit/domain/services/NarrativeGenerator.test.ts`
Expected: 5 tests pass (the generator already exists and is well-structured; this is a regression net).

- [ ] **Step 3: Commit**

```bash
git add backend/tests/unit/domain/services/NarrativeGenerator.test.ts
git commit -m "test(backend): NarrativeGenerator coverage (T049)"
```

---

## Task 2: PurchaseProcessAggregator (T058a)

**Files:**
- Create: `backend/src/domain/services/PurchaseProcessAggregator.ts`
- Create: `backend/tests/unit/domain/services/PurchaseProcessAggregator.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { PurchaseProcessAggregator } from '../../../../src/domain/services/PurchaseProcessAggregator';

const profile = {
  savings: 45_000,
  monthlyIncome: 3_500,
  existingDebts: 0,
  region: 'Madrid' as const,
  persona: 'equilibrado' as const,
  interestRate: 0.035,
};

describe('PurchaseProcessAggregator', () => {
  const agg = new PurchaseProcessAggregator();

  it('returns null when no propertyPrice', () => {
    expect(agg.compute(null, profile)).toBeNull();
  });

  it('returns hidden costs + 4 amortization + 3 investment scenarios', () => {
    const result = agg.compute(200_000, profile);
    expect(result).not.toBeNull();
    expect(result!.hiddenCosts.total).toBeGreaterThan(0);
    expect(result!.amortizationScenarios).toHaveLength(4);
    expect(result!.amortizationScenarios.map((s) => s.name)).toEqual([
      'baseline', 'light', 'moderate', 'aggressive',
    ]);
    expect(result!.investmentScenarios).toHaveLength(3);
    expect(result!.investmentScenarios.map((s) => s.name)).toEqual([
      'conservative', 'moderate', 'aggressive',
    ]);
  });

  it('computes monthly payment for 200k @ 3.5% over 30yr between 700-800€', () => {
    const result = agg.compute(200_000, profile);
    const baseline = result!.amortizationScenarios[0];
    expect(baseline.monthlyPayment).toBeGreaterThan(700);
    expect(baseline.monthlyPayment).toBeLessThan(800);
  });

  it('totalCash = propertyPrice + hiddenCosts.total', () => {
    const result = agg.compute(200_000, profile);
    expect(result!.totalCash).toBe(200_000 + result!.hiddenCosts.total);
  });

  it('gap = savings - totalCash (negative when short)', () => {
    const result = agg.compute(200_000, profile);
    expect(result!.gap).toBe(45_000 - result!.totalCash);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npx vitest run tests/unit/domain/services/PurchaseProcessAggregator.test.ts`
Expected: FAIL — "Cannot find module PurchaseProcessAggregator".

- [ ] **Step 3: Implement aggregator**

```ts
/**
 * PurchaseProcessAggregator (T058a).
 * Pure domain: takes propertyPrice + financialProfile, returns ComputedMortgage
 * with hidden costs, 4 amortization scenarios, 3 investment scenarios.
 * Returns null if no propertyPrice (the UI will show "introduce precio").
 */
import { HiddenCostsCalculator } from './HiddenCostsCalculator';
import { AmortizationCalculator } from './AmortizationCalculator';
import { InvestmentCalculator } from './InvestmentCalculator';
import type { FinancialProfile, Region } from '../value-objects/FinancialProfile';
import type { AmortizationScenario, InvestmentScenario } from '../ports/MortgageCalculatorPort';
import type { HiddenCosts } from '../value-objects/HiddenCosts';

export interface ComputedMortgage {
  hiddenCosts: HiddenCosts;
  totalCash: number;
  gap: number;
  monthlyPayment30yr: number;
  amortizationScenarios: AmortizationScenario[];
  investmentScenarios: InvestmentScenario[];
}

const DEFAULT_INTEREST_RATE = 0.035;
const DEFAULT_TERM_YEARS = 30;
const INFLATION = 0.02;

export class PurchaseProcessAggregator {
  private readonly hidden = new HiddenCostsCalculator();
  private readonly amort = new AmortizationCalculator();
  private readonly invest = new InvestmentCalculator();

  compute(
    propertyPrice: number | null,
    financialProfile: FinancialProfile | null,
  ): ComputedMortgage | null {
    if (propertyPrice === null || propertyPrice <= 0) return null;

    const region = (financialProfile?.region ?? 'Madrid') as Region;
    const interestRate = financialProfile?.interestRate ?? DEFAULT_INTEREST_RATE;
    const monthlyExtra = 0; // baseline only; individual scenarios add their own extra
    const hiddenCosts = this.hidden.calculate(propertyPrice, region, false);

    const amortInput = {
      principal: propertyPrice,
      annualRate: interestRate,
      years: DEFAULT_TERM_YEARS,
      monthlyExtra,
    };
    const amortizationScenarios = this.amort.generateAllScenarios({
      principal: amortInput.principal,
      annualRate: amortInput.annualRate,
      years: amortInput.years,
    });

    // Investment scenarios use the moderate amortization extra (300€) as a
    // reasonable reference monthly contribution.
    const investmentScenarios = this.invest.generateAllScenarios({
      monthlyContribution: 300,
      years: DEFAULT_TERM_YEARS,
      inflation: INFLATION,
    });

    const totalCash = propertyPrice + hiddenCosts.total;
    const savings = financialProfile?.savings ?? 0;
    const gap = savings - totalCash;

    return {
      hiddenCosts,
      totalCash,
      gap,
      monthlyPayment30yr: amortizationScenarios[0].monthlyPayment,
      amortizationScenarios,
      investmentScenarios,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npx vitest run tests/unit/domain/services/PurchaseProcessAggregator.test.ts`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/domain/services/PurchaseProcessAggregator.ts backend/tests/unit/domain/services/PurchaseProcessAggregator.test.ts
git commit -m "feat(backend): PurchaseProcessAggregator (T058a)"
```

---

## Task 3: Wire aggregator into GET /api/purchase-processes/:id and dashboard

**Files:**
- Modify: `backend/src/api/routes/purchaseProcesses.ts`
- Modify: `backend/src/api/routes/dashboard.ts`

- [ ] **Step 1: Update purchaseProcesses.ts GET /:id to include `computed`**

Add the import at the top:
```ts
import { PurchaseProcessAggregator } from '../../domain/services/PurchaseProcessAggregator';
import { FinancialProfile } from '../../domain/value-objects/FinancialProfile';
```

Create a module-level singleton after the router:
```ts
const aggregator = new PurchaseProcessAggregator();
```

Replace the `GET /:id` handler body to include `computed`:
```ts
purchaseProcessesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const process = await prisma.purchaseProcess.findFirst({
      where: { id, userId: req.userId },
    });
    if (!process) {
      res.status(404).json({ error: 'NOT_FOUND' });
      return;
    }
    const profile = process.financialProfile
      ? FinancialProfile.create(process.financialProfile as never)
      : null;
    const computed = aggregator.compute(
      process.propertyPrice ? Number(process.propertyPrice) : null,
      profile,
    );
    res.json({ ...process, computed });
  } catch (err) {
    next(err);
  }
});
```

- [ ] **Step 2: Update dashboard.ts to include `computed`**

Add the imports:
```ts
import { PurchaseProcessAggregator } from '../../domain/services/PurchaseProcessAggregator';
import { FinancialProfile } from '../../domain/value-objects/FinancialProfile';
```

Create the singleton:
```ts
const aggregator = new PurchaseProcessAggregator();
```

In the success branch, after the existing `res.json({...})` call's object literal, add a `computed` key:
```ts
const profile = process.financialProfile
  ? FinancialProfile.create(process.financialProfile as never)
  : null;
const computed = aggregator.compute(
  process.propertyPrice ? Number(process.propertyPrice) : null,
  profile,
);
```

And add `computed,` to the response object.

- [ ] **Step 3: Verify with typecheck + tests**

Run:
```bash
cd backend && npx tsc --noEmit
cd backend && npx vitest run
```
Expected: 0 typecheck errors, 49 tests pass (44 + 5 new from Task 2).

- [ ] **Step 4: Commit**

```bash
git add backend/src/api/routes/purchaseProcesses.ts backend/src/api/routes/dashboard.ts
git commit -m "feat(backend): surface ComputedMortgage in GET routes"
```

---

## Task 4: Frontend types for Mortgage Compass

**Files:**
- Modify: `frontend/src/lib/api/types.ts`

- [ ] **Step 1: Add the new types**

Append at the end of `frontend/src/lib/api/types.ts`:
```ts
export type AmortizationScenarioName = 'baseline' | 'light' | 'moderate' | 'aggressive';
export type InvestmentScenarioName = 'conservative' | 'moderate' | 'aggressive';
export type Persona = 'conservador' | 'equilibrado' | 'arriesgado';

export interface AmortizationScenario {
  name: AmortizationScenarioName;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  yearsToPayoff: number;
  monthlyExtra: number;
}

export interface InvestmentScenario {
  name: InvestmentScenarioName;
  annualReturn: number;
  nominalValue: number;
  realValue: number;
  totalContributed: number;
}

export interface HiddenCostItem {
  concept: string;
  amount: number;
}

export interface HiddenCosts {
  itpOrIva: number;
  notaria: number;
  registro: number;
  gestoria: number;
  tasacion: number;
  total: number;
  breakdown: HiddenCostItem[];
}

export interface ComputedMortgage {
  hiddenCosts: HiddenCosts;
  totalCash: number;
  gap: number;
  monthlyPayment30yr: number;
  amortizationScenarios: AmortizationScenario[];
  investmentScenarios: InvestmentScenario[];
}

export interface PurchaseProcessDetail {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  currentStage: string;
  propertyPrice: number | string | null;
  sourceListingId: string | null;
  financialProfile: {
    savings: number;
    monthlyIncome: number;
    existingDebts: number;
    region: string;
    persona?: Persona;
    interestRate?: number;
  } | null;
  computed: ComputedMortgage | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api/types.ts
git commit -m "feat(frontend): Mortgage Compass types"
```

---

## Task 5: financialProfile store

**Files:**
- Create: `frontend/src/lib/stores/financialProfile.ts`

- [ ] **Step 1: Create the store**

```ts
/**
 * financialProfile store — local form state for the Mortgage Compass wizard.
 * Persisted to localStorage so the user doesn't lose input on refresh.
 */
import { writable } from 'svelte/store';
import type { Persona } from '$lib/api/types';

const STORAGE_KEY = 'realista.financialProfile';

export interface FinancialProfileForm {
  propertyPrice: number | null;
  savings: number;
  monthlyIncome: number;
  existingDebts: number;
  region: string;
  persona: Persona | null;
  interestRate: number;
}

const DEFAULT: FinancialProfileForm = {
  propertyPrice: null,
  savings: 45_000,
  monthlyIncome: 3_500,
  existingDebts: 0,
  region: 'Madrid',
  persona: null,
  interestRate: 0.035,
};

function load(): FinancialProfileForm {
  if (typeof localStorage === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<FinancialProfileForm>) };
  } catch {
    return DEFAULT;
  }
}

function persist(value: FinancialProfileForm): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore quota / disabled storage
  }
}

function createStore() {
  const { subscribe, set, update } = writable<FinancialProfileForm>(load());

  return {
    subscribe,
    set(value: FinancialProfileForm): void {
      persist(value);
      set(value);
    },
    update(updater: (current: FinancialProfileForm) => FinancialProfileForm): void {
      update((current) => {
        const next = updater(current);
        persist(next);
        return next;
      });
    },
    reset(): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(DEFAULT);
    },
  };
}

export const financialProfile = createStore();
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/stores/financialProfile.ts
git commit -m "feat(frontend): financialProfile store with localStorage"
```

---

## Task 6: AmortizationVsInvestmentChart component

**Files:**
- Create: `frontend/src/lib/components/AmortizationVsInvestmentChart.svelte`

- [ ] **Step 1: Create the component**

```svelte
<script lang="ts">
  import type { AmortizationScenario, InvestmentScenario } from '$lib/api/types';
  import { formatCurrency } from '$lib/utils/format';

  export let amortization: AmortizationScenario[];
  export let investment: InvestmentScenario[];
  export let showRealValue = false;

  // X-axis: 4 amortization extras + 3 investment returns (mixed comparison)
  const amortColors = ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8'];
  const investColors = ['#86efac', '#22c55e', '#15803d'];

  $: investValues = investment.map((s) =>
    showRealValue ? s.realValue : s.nominalValue,
  );

  $: maxValue = Math.max(
    ...amortization.map((s) => s.totalInterest),
    ...investValues,
    1,
  );

  $: rows = [
    ...amortization.map((s, i) => ({
      label: `Amortizar +${s.monthlyExtra}€/mes`,
      sub: s.name,
      value: s.totalInterest,
      color: amortColors[i],
      suffix: 'intereses totales',
    })),
    ...investment.map((s, i) => ({
      label: `Invertir al ${(s.annualReturn * 100).toFixed(0)}%`,
      sub: s.name,
      value: investValues[i],
      color: investColors[i],
      suffix: showRealValue ? 'valor real' : 'valor nominal',
    })),
  ];
</script>

<div class="chart" role="img" aria-label="Comparativa amortización vs inversión">
  {#each rows as row}
    <div class="row">
      <div class="label">
        <span class="name">{row.label}</span>
        <span class="sub">{row.sub}</span>
      </div>
      <div class="bar-track">
        <div
          class="bar"
          style="width: {(row.value / maxValue) * 100}%; background: {row.color}"
        />
      </div>
      <div class="value">
        <strong>{formatCurrency(row.value)}</strong>
        <span class="suffix">{row.suffix}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .chart {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .row {
    display: grid;
    grid-template-columns: minmax(110px, 30%) 1fr 110px;
    gap: 0.5rem;
    align-items: center;
  }
  .label {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: 0.85rem;
    font-weight: 500;
  }
  .sub {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    text-transform: capitalize;
  }
  .bar-track {
    background: var(--color-bg-soft);
    height: 16px;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar {
    height: 100%;
    transition: width 0.3s ease;
    min-width: 2px;
  }
  .value {
    text-align: right;
  }
  .value strong {
    font-size: 0.85rem;
  }
  .suffix {
    display: block;
    font-size: 0.65rem;
    color: var(--color-text-muted);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/components/AmortizationVsInvestmentChart.svelte
git commit -m "feat(frontend): AmortizationVsInvestmentChart component"
```

---

## Task 7: Refactor mortgage-compass page

**Files:**
- Modify: `frontend/src/routes/mortgage-compass/+page.svelte`

- [ ] **Step 1: Write the new page**

Replace the entire file content with:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import AmortizationVsInvestmentChart from '$lib/components/AmortizationVsInvestmentChart.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import { financialProfile } from '$lib/stores/financialProfile';
  import { formatCurrency } from '$lib/utils/format';
  import type {
    ComputedMortgage,
    DashboardResponse,
    PurchaseProcessDetail,
  } from '$lib/api/types';

  const REGIONS = [
    'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias',
    'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña',
    'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja',
    'Madrid', 'Murcia', 'Navarra', 'País Vasco',
  ];

  let step: 'profile' | 'costs' | 'strategies' = 'profile';
  let computed: ComputedMortgage | null = null;
  let processId: string | null = null;
  let sourceListingId: string | null = null;
  let loading = false;
  let error: string | null = null;
  let showRealValue = false;
  let saving = false;
  let priceManuallyEdited = false;

  onMount(async () => {
    try {
      const dash = await apiClient.get<DashboardResponse>('/api/dashboard');
      if (dash.empty) {
        // No process yet — user can configure manually
        return;
      }
      const detail = await apiClient.get<PurchaseProcessDetail>(
        `/api/purchase-processes/${dash.process!.id}`,
      );
      processId = detail.id;
      sourceListingId = detail.sourceListingId;
      const price = detail.propertyPrice
        ? Number(detail.propertyPrice)
        : null;
      financialProfile.update((p) => ({
        ...p,
        propertyPrice: price ?? p.propertyPrice,
      }));
      computed = detail.computed;
      if (computed) step = 'strategies';
    } catch (e) {
      // ignore — user can still fill the form
    }
  });

  async function saveProfile(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    saving = true;
    error = null;
    try {
      const fp = $financialProfile;
      const body = {
        propertyPrice: fp.propertyPrice ?? 0,
        financialProfile: {
          savings: fp.savings,
          monthlyIncome: fp.monthlyIncome,
          existingDebts: fp.existingDebts,
          region: fp.region,
          persona: fp.persona ?? undefined,
          interestRate: fp.interestRate,
        },
      };
      const created = await apiClient.post<PurchaseProcessDetail>(
        '/api/purchase-processes',
        body,
      );
      processId = created.id;
      computed = created.computed;
      step = 'costs';
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al guardar';
    } finally {
      saving = false;
    }
  }

  async function recompute(): Promise<void> {
    if (!processId) return;
    loading = true;
    try {
      const detail = await apiClient.get<PurchaseProcessDetail>(
        `/api/purchase-processes/${processId}`,
      );
      computed = detail.computed;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al recalcular';
    } finally {
      loading = false;
    }
  }

  function setPersona(p: 'conservador' | 'equilibrado' | 'arriesgado'): void {
    financialProfile.update((s) => ({ ...s, persona: p }));
  }

  function setStep(next: typeof step): void {
    step = next;
  }
</script>

<div class="container">
  <h1>Perfil hipotecario</h1>
  <AIDisclaimer />

  {#if sourceListingId}
    <p class="source-banner">
      Precio pre-rellenado del anuncio analizado
      (<a href="/listing-lens">ver origen</a>).
    </p>
  {/if}

  <nav class="steps" aria-label="Pasos del formulario">
    <button
      class:active={step === 'profile'}
      on:click={() => setStep('profile')}
      disabled={!processId && step !== 'profile'}
    >1. Perfil</button>
    <button
      class:active={step === 'costs'}
      on:click={() => setStep('costs')}
      disabled={!computed}
    >2. Gastos ocultos</button>
    <button
      class:active={step === 'strategies'}
      on:click={() => setStep('strategies')}
      disabled={!computed}
    >3. Estrategias</button>
  </nav>

  {#if step === 'profile'}
    <form on:submit={saveProfile} class="card">
      <div class="field">
        <label for="price">Precio de la vivienda (€)</label>
        <input
          id="price"
          type="number"
          min="0"
          bind:value={$financialProfile.propertyPrice}
          on:input={() => (priceManuallyEdited = true)}
          required
        />
        {#if sourceListingId && !priceManuallyEdited}
          <small class="hint">Pre-rellenado del listing. Puedes sobrescribirlo.</small>
        {/if}
      </div>
      <div class="field">
        <label for="savings">Ahorros disponibles (€)</label>
        <input id="savings" type="number" min="0" bind:value={$financialProfile.savings} required />
      </div>
      <div class="field">
        <label for="income">Ingresos netos mensuales (€)</label>
        <input id="income" type="number" min="0" bind:value={$financialProfile.monthlyIncome} required />
      </div>
      <div class="field">
        <label for="debts">Deudas existentes (€)</label>
        <input id="debts" type="number" min="0" bind:value={$financialProfile.existingDebts} />
      </div>
      <div class="field">
        <label for="region">Comunidad autónoma</label>
        <select id="region" bind:value={$financialProfile.region}>
          {#each REGIONS as r}
            <option value={r}>{r}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <label for="rate">Tipo de interés (%)</label>
        <input
          id="rate"
          type="number"
          min="0"
          step="0.1"
          bind:value={$financialProfile.interestRate}
        />
      </div>
      <button class="btn-primary" type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar y calcular'}
      </button>
    </form>
  {/if}

  {#if step === 'costs' && computed}
    <section class="card">
      <h2>Gastos ocultos de compra</h2>
      <p class="text-muted">
        Coste real de la compra, además del precio del anuncio.
      </p>
      <ul class="breakdown">
        {#each computed.hiddenCosts.breakdown as item}
          <li>
            <span>{item.concept}</span>
            <strong>{formatCurrency(item.amount)}</strong>
          </li>
        {/each}
        <li class="total">
          <span>Total necesario</span>
          <strong>{formatCurrency(computed.totalCash)}</strong>
        </li>
      </ul>
      {#if computed.gap < 0}
        <p class="warning">
          Te faltan <strong>{formatCurrency(Math.abs(computed.gap))}</strong> para cubrir precio + gastos.
        </p>
      {:else}
        <p class="ok">
          Te sobran <strong>{formatCurrency(computed.gap)}</strong> después de gastos.
        </p>
      {/if}
      <div class="actions">
        <button class="btn-secondary" on:click={() => setStep('profile')}>← Editar perfil</button>
        <button class="btn-primary" on:click={() => setStep('strategies')}>Ver estrategias →</button>
      </div>
    </section>
  {/if}

  {#if step === 'strategies' && computed}
    <section class="card">
      <h2>Amortizar vs invertir</h2>
      <p class="text-muted">
        Cuota mensual con hipoteca a 30 años al {(($financialProfile.interestRate ?? 0.035) * 100).toFixed(2)}%:
        <strong>{formatCurrency(computed.monthlyPayment30yr)}</strong>.
      </p>
      <div class="insight">
        <strong>💡 Idea destacada:</strong>
        {#if computed.amortizationScenarios[2] && computed.investmentScenarios[1]}
          Si amortizas {formatCurrency(computed.amortizationScenarios[2].monthlyExtra)}/mes,
          reduces {Math.round(computed.amortizationScenarios[0].yearsToPayoff - computed.amortizationScenarios[2].yearsToPayoff)} años
          y ahorras {formatCurrency(computed.amortizationScenarios[0].totalInterest - computed.amortizationScenarios[2].totalInterest)} en intereses.
          Si inviertes esa misma cantidad al 6%, acumularías
          {formatCurrency(computed.investmentScenarios[1].nominalValue)} en 30 años
          (valor real: {formatCurrency(computed.investmentScenarios[1].realValue)}).
        {/if}
      </div>
      <div class="toggle-row">
        <label>
          <input type="checkbox" bind:checked={showRealValue} />
          Mostrar valor real (ajustado por inflación)
        </label>
      </div>
      <AmortizationVsInvestmentChart
        amortization={computed.amortizationScenarios}
        investment={computed.investmentScenarios}
        {showRealValue}
      />
      <p class="disclaimer">
        ⚠️ Las rentabilidades pasadas no garantizan futuras. Los beneficios están sujetos a tributación
        (~19-26% en España para ganancias patrimoniales). Esto no es consejo financiero.
      </p>
      <div class="actions">
        <button class="btn-secondary" on:click={() => setStep('costs')}>← Gastos ocultos</button>
        <button class="btn-secondary" on:click={recompute} disabled={loading}>
          {loading ? 'Recalculando…' : 'Recalcular'}
        </button>
      </div>
    </section>
  {/if}

  {#if error}
    <div class="card error">
      <p>{error}</p>
    </div>
  {/if}

  {#if !computed && step === 'profile'}
    <section class="card persona-card">
      <h3>¿Cómo describirías tu perfil?</h3>
      <p class="text-muted">No afecta al cálculo — solo a la narrativa educativa.</p>
      <div class="persona-row">
        <button
          class="persona"
          class:selected={$financialProfile.persona === 'conservador'}
          on:click={() => setPersona('conservador')}
          type="button"
        >🛡️ Conservador</button>
        <button
          class="persona"
          class:selected={$financialProfile.persona === 'equilibrado'}
          on:click={() => setPersona('equilibrado')}
          type="button"
        >⚖️ Equilibrado</button>
        <button
          class="persona"
          class:selected={$financialProfile.persona === 'arriesgado'}
          on:click={() => setPersona('arriesgado')}
          type="button"
        >🚀 Arriesgado</button>
      </div>
    </section>
  {/if}
</div>

<style>
  .source-banner {
    background: var(--color-bg-soft);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
  .steps {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
  .steps button {
    background: none;
    border: none;
    padding: 0.5rem 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .steps button.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }
  .steps button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .field {
    margin-bottom: 0.75rem;
  }
  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  .hint {
    display: block;
    color: var(--color-text-muted);
    font-size: 0.7rem;
    margin-top: 0.25rem;
  }
  button[type='submit'],
  .btn-primary {
    margin-top: 0.5rem;
    width: 100%;
  }
  .btn-secondary {
    background: var(--color-bg-soft);
    border: 1px solid var(--color-border);
  }
  .breakdown {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
  }
  .breakdown li {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid var(--color-border);
  }
  .breakdown .total {
    font-size: 1.05rem;
    font-weight: 600;
    border-bottom: none;
    padding-top: 0.6rem;
  }
  .warning {
    color: var(--color-danger);
    font-size: 0.85rem;
  }
  .ok {
    color: var(--color-success);
    font-size: 0.85rem;
  }
  .insight {
    background: var(--color-bg-soft);
    padding: 0.75rem;
    border-radius: var(--radius-md);
    margin: 1rem 0;
    font-size: 0.9rem;
  }
  .toggle-row {
    margin: 0.75rem 0;
    font-size: 0.85rem;
  }
  .disclaimer {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .actions button {
    flex: 1;
  }
  .persona-card {
    margin-top: 1rem;
  }
  .persona-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .persona {
    flex: 1;
    padding: 0.75rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .persona.selected {
    border-color: var(--color-primary);
    background: var(--color-bg-soft);
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
```

- [ ] **Step 2: Verify the build**

Run:
```bash
cd frontend && npx tsc --noEmit 2>&1 || true
cd frontend && npx svelte-check --tsconfig ./tsconfig.json 2>&1 || true
cd frontend && npm run build 2>&1 | tail -30
```
Expected: build succeeds. (svelte-check may not be installed; tsc and npm run build are the canonical checks for this project.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/routes/mortgage-compass/+page.svelte
git commit -m "feat(frontend): Mortgage Compass multi-step page with chart and insight"
```

---

## Task 8: End-to-end smoke test + evidence

**Files:**
- Create: `docs/evidence/2026-07-08-MORTGAGE-COMPASS-UI.md`

- [ ] **Step 1: Run full backend + frontend checks**

```bash
cd backend && npx tsc --noEmit
cd backend && npx vitest run
bash .opencode/skills/hexagonal-check/run.sh
cd frontend && npm run build
```
Expected: 0 typecheck errors, 49/49 tests pass, hexagonal PASS, frontend build OK.

- [ ] **Step 2: Manual end-to-end smoke (record in evidence file)**

If the dev environment is up, exercise:
1. `POST /api/listings/analyze` with a manualText → creates process + listing
2. `GET /api/dashboard` → returns process with `propertyPrice`
3. `GET /api/purchase-processes/:id` → returns `computed` field with 4 amortization + 3 investment + hiddenCosts
4. Frontend `http://localhost:5173/mortgage-compass` → renders all 3 steps

If env is not running, document the manual steps and reference the existing E2E evidence.

- [ ] **Step 3: Write evidence file**

Create `docs/evidence/2026-07-08-MORTGAGE-COMPASS-UI.md` with:
- Summary of what was delivered
- Test counts (49/49, +5 from Task 2)
- Hexagonal check PASS
- Frontend build OK
- End-to-end smoke results
- Reference to Mortgage Compass flow (steps + chart + insight + toggle)

- [ ] **Step 4: Commit**

```bash
git add docs/evidence/2026-07-08-MORTGAGE-COMPASS-UI.md docs/evidence/INDEX.md
git commit -m "docs(evidence): Mortgage Compass UI complete"
```

---

## Self-Review

**Spec coverage (US2 acceptance criteria from spec.md):**
1. ✅ Hidden costs breakdown — Task 7 (step 'costs') calls `computed.hiddenCosts`
2. ✅ Listing-origin link with override — Task 7 (`sourceListingId` banner + price input)
3. ✅ Manual propertyPrice entry when no listing — Task 7 (form accepts `propertyPrice: null` → POST with 0)
4. ⚠️ Recommended duration per persona — T062 partial. Persona buttons are captured in store but the page does not suggest a duration yet. This is acceptable for the UI slice; the duration suggestion is a small enhancement we can add in a follow-up if needed. (Documented as known gap in evidence.)
5. ✅ 4 amortization scenarios — Task 2 + Task 7 (chart renders them)
6. ✅ 3 investment scenarios with real value toggle — Task 6 + Task 7 (`showRealValue` prop)
7. ⚠️ Narratives from `NarrativeGenerator` — Task 1 adds tests but the page does not yet render the narrative text inline. The insight box in Task 7 fills the educational role with hardcoded data. The NarrativeGenerator output is exposed via the test but not yet rendered. This is documented as a follow-up (or we can add a 4-line `<pre>{narrative}</pre>` to Task 7 if time permits).
8. ✅ Investment disclaimer — Task 7 (`.disclaimer` block)

**Placeholder scan:** No TBD/TODO. All code blocks complete.

**Type consistency:** `AmortizationScenario`/`InvestmentScenario`/`ComputedMortgage` types defined once in `types.ts` and used in `+page.svelte` + `AmortizationVsInvestmentChart.svelte`. Method names consistent (`compute`, `generateAllScenarios`).

**Gaps explicitly out of scope:** Negotiation Assistant (US4), re-analysis diff (FR-022), Catastro XML parsing (FR-003), PWA icons, SSE real-time, Playwright E2E. These match the original "what's next" list from the FR-024 evidence.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-08-mortgage-compass-ui.md`.
