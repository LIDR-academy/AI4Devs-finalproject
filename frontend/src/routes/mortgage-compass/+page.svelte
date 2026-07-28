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
  let booting = true;

  onMount(async () => {
    try {
      const dash = await apiClient.get<DashboardResponse>('/api/dashboard');
      if (dash.empty) {
        booting = false;
        return;
      }
      const detail = await apiClient.get<PurchaseProcessDetail>(
        `/api/purchase-processes/${dash.process.id}`,
      );
      processId = detail.id;
      sourceListingId = detail.sourceListingId;
      const price = detail.propertyPrice
        ? Number(detail.propertyPrice)
        : null;
      financialProfile.update((p) => ({
        ...p,
        propertyPrice: price ?? p.propertyPrice,
        ...(detail.financialProfile
          ? {
              savings: detail.financialProfile.savings ?? p.savings,
              monthlyIncome: detail.financialProfile.monthlyIncome ?? p.monthlyIncome,
              existingDebts: detail.financialProfile.existingDebts ?? p.existingDebts,
              region: detail.financialProfile.region ?? p.region,
              persona: detail.financialProfile.persona ?? p.persona,
              interestRate: detail.financialProfile.interestRate ?? p.interestRate,
              isFirstHome: detail.financialProfile.isFirstHome ?? p.isFirstHome,
              buyerAge: detail.financialProfile.buyerAge ?? p.buyerAge,
              isProtectedHousing: detail.financialProfile.isProtectedHousing ?? p.isProtectedHousing,
            }
          : {}),
      }));
      computed = detail.computed;
      if (computed) step = 'strategies';
    } catch (e) {
      console.error(e);
      error = 'No se pudo cargar tu proceso anterior. Puedes continuar desde cero.';
    } finally {
      booting = false;
    }
  });

  async function saveProfile(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    saving = true;
    error = null;
    try {
      const fp = $financialProfile;
      const profile = {
        savings: fp.savings,
        monthlyIncome: fp.monthlyIncome,
        existingDebts: fp.existingDebts,
        region: fp.region,
        persona: fp.persona ?? undefined,
        interestRate: fp.interestRate,
        isFirstHome: fp.isFirstHome,
        buyerAge: fp.buyerAge ?? undefined,
        isProtectedHousing: fp.isProtectedHousing,
      };
      if (processId) {
        await apiClient.patch(`/api/purchase-processes/${processId}`, {
          propertyPrice: fp.propertyPrice ?? 0,
          financialProfile: profile,
        });
      } else {
        const created = await apiClient.post<PurchaseProcessDetail>(
          '/api/purchase-processes',
          { propertyPrice: fp.propertyPrice ?? 0, financialProfile: profile },
        );
        processId = created.id;
      }
      const detail = await apiClient.get<PurchaseProcessDetail>(
        `/api/purchase-processes/${processId}`,
      );
      computed = detail.computed;
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
      const fp = $financialProfile;
      await apiClient.patch(`/api/purchase-processes/${processId}`, {
        financialProfile: {
          savings: fp.savings,
          monthlyIncome: fp.monthlyIncome,
          existingDebts: fp.existingDebts,
          region: fp.region,
          persona: fp.persona ?? undefined,
          interestRate: fp.interestRate,
          isFirstHome: fp.isFirstHome,
          buyerAge: fp.buyerAge ?? undefined,
          isProtectedHousing: fp.isProtectedHousing,
        },
      });
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

  $: amortization = computed?.amortizationScenarios ?? [];
  $: investment = computed?.investmentScenarios ?? [];
  $: moderateAmort = amortization.find((s) => s.monthlyExtra === 300) ?? null;
  $: baselineAmort = amortization.find((s) => s.monthlyExtra === 0) ?? null;
  $: moderateInvest = investment.find((s) => s.name.startsWith('moderado')) ?? null;
</script>

<div class="container">
  <h1>Perfil hipotecario</h1>
  <AIDisclaimer />

  {#if booting}
    <p class="text-muted">Cargando tu perfil…</p>
  {:else}

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
      aria-current={step === 'profile' ? 'step' : undefined}
    >1. Perfil</button>
    <button
      class:active={step === 'costs'}
      on:click={() => setStep('costs')}
      disabled={!computed}
      aria-current={step === 'costs' ? 'step' : undefined}
    >2. Gastos ocultos</button>
    <button
      class:active={step === 'strategies'}
      on:click={() => setStep('strategies')}
      disabled={!computed}
      aria-current={step === 'strategies' ? 'step' : undefined}
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
      <div class="field-inline">
        <input type="checkbox" id="firstHome" bind:checked={$financialProfile.isFirstHome} />
        <label for="firstHome">Vivienda habitual (aplica bonificaciones ITP)</label>
      </div>
      {#if $financialProfile.isFirstHome}
        <div class="field">
          <label for="buyerAge">Edad del comprador</label>
          <input id="buyerAge" type="number" min="18" max="99" bind:value={$financialProfile.buyerAge} />
          <small class="hint">Muchas CCAA bonifican el ITP a menores de 35-40 años</small>
        </div>
        <div class="field-inline">
          <input type="checkbox" id="protectedHousing" bind:checked={$financialProfile.isProtectedHousing} />
          <label for="protectedHousing">Vivienda protegida (VPO)</label>
        </div>
      {/if}
      <div class="field">
        <label for="rate">TIN (%)</label>
        <input
          id="rate"
          type="number"
          min="0"
          max="15"
          step="0.01"
          value={$financialProfile.interestRate * 100}
          on:input={(e) => {
            const pct = parseFloat(e.currentTarget.value);
            if (!isNaN(pct)) financialProfile.update((p) => ({ ...p, interestRate: pct / 100 }));
          }}
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
        Cuota mensual con hipoteca a 30 años al {($financialProfile.interestRate * 100).toFixed(2)}%:
        <strong>{formatCurrency(computed.monthlyPayment30yr)}</strong>.
      </p>
      <div class="insight">
        <strong>💡 Idea destacada:</strong>
        {#if moderateAmort && baselineAmort && moderateInvest}
          Amortizando {formatCurrency(moderateAmort.monthlyExtra)}/mes eliminas {Math.round(moderateAmort.yearsReduced)} años de hipoteca
          y ahorras {formatCurrency(baselineAmort.totalInterest - moderateAmort.totalInterest)} en intereses.
          Si en lugar de amortizar inviertes esos {formatCurrency(moderateAmort.monthlyExtra)}/mes al {(moderateInvest.annualReturn * 100).toFixed(0)}%,
          acumularías {formatCurrency(moderateInvest.nominalValue)} en 30 años
          ({formatCurrency(moderateInvest.realValue)} en valor actual).
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
      <details class="investment-narrative">
        <summary>¿Amortizar hipoteca o invertir? ¿Qué conviene más?</summary>
        <div class="narrative-content">
          <p><strong>Amortizar</strong> reduce la deuda con el banco: acortas años de hipoteca y ahorras intereses seguros. Es un ahorro <em>garantizado</em> porque cada euro que amortizas deja de generar intereses al tipo de tu hipoteca (ej. 3,5%).</p>
          <p><strong>Invertir</strong> destina ese mismo dinero a activos financieros. A largo plazo (30 años), la rentabilidad media de una cartera diversificada (~6%) supera el coste del interés hipotecario (~3,5%). Pero implica <em>riesgo</em>: no hay garantía de rentabilidades futuras.</p>
          <p class="highlight">💡 <strong>Regla general:</strong> si tu tipo de interés es bajo (&lt;3%), suele salir mejor invertir. Si es alto (&gt;5%), conviene amortizar. Entre 3% y 5%, depende de tu tolerancia al riesgo y tus objetivos.</p>
        </div>
      </details>
      <details class="investment-narrative">
        <summary>¿Qué representa cada escenario de inversión?</summary>
        <ul>
          <li><strong>Conservador (4%):</strong> Renta fija, depósitos, letras del tesoro. Riesgo bajo, rentabilidad modesta pero predecible.</li>
          <li><strong>Moderado (6%):</strong> Fondos indexados globales (MSCI World). Riesgo medio, diversificación mundial.</li>
          <li><strong>Agresivo (8%):</strong> Cartera con sesgo a renta variable (S&P 500). Más volatilidad, más potencial a largo plazo.</li>
        </ul>
        <p class="text-muted">Las rentabilidades pasadas no garantizan futuras. Tributación: ~19-26% sobre ganancias. Esto no es consejo financiero.</p>
      </details>
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
    <div class="card error" role="alert">
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
          aria-pressed={$financialProfile.persona === 'conservador'}
        >🛡️ Conservador</button>
        <button
          class="persona"
          class:selected={$financialProfile.persona === 'equilibrado'}
          on:click={() => setPersona('equilibrado')}
          type="button"
          aria-pressed={$financialProfile.persona === 'equilibrado'}
        >⚖️ Equilibrado</button>
        <button
          class="persona"
          class:selected={$financialProfile.persona === 'arriesgado'}
          on:click={() => setPersona('arriesgado')}
          type="button"
          aria-pressed={$financialProfile.persona === 'arriesgado'}
        >🚀 Arriesgado</button>
      </div>
    </section>
  {/if}
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
  .field-inline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
  }
  .field-inline input[type='checkbox'] {
    width: auto;
    margin: 0;
  }
  .field-inline label {
    margin: 0;
    display: inline;
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
  .investment-narrative {
    margin-top: 1rem;
    font-size: 0.85rem;
  }
  .investment-narrative summary {
    cursor: pointer;
    color: var(--color-primary);
    font-weight: 500;
    padding: 0.25rem 0;
  }
  .investment-narrative ul {
    padding-left: 1.25rem;
    margin: 0.5rem 0;
  }
  .investment-narrative li {
    margin-bottom: 0.4rem;
    line-height: 1.4;
  }
  .narrative-content p {
    font-size: 0.83rem;
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
  .narrative-content .highlight {
    background: var(--color-bg-soft);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
  }
</style>
