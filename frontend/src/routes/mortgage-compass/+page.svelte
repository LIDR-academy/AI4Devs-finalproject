<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import { formatCurrency } from '$lib/utils/format';
  import { onMount } from 'svelte';

  let savings = 45_000;
  let monthlyIncome = 3_500;
  let existingDebts = 0;
  let region = 'Madrid';
  let loading = false;
  let error: string | null = null;
  let computed: unknown = null;

  const REGIONS = [
    'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias',
    'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña',
    'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja',
    'Madrid', 'Murcia', 'Navarra', 'País Vasco',
  ];

  async function loadDashboard(): Promise<void> {
    try {
      const dashboard = await apiClient.get<{ process?: { propertyPrice: number | null } }>('/api/dashboard');
      // propertyPrice is read-only — we don't edit it here
      void dashboard;
    } catch (e) {
      // ignore — user can still configure manually
    }
  }

  async function computeFinancials(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    loading = true;
    error = null;
    try {
      const profile = { savings, monthlyIncome, existingDebts, region };
      const process = await apiClient.post<{ id: string; propertyPrice: number | null }>('/api/purchase-processes', { financialProfile: profile });
      computed = await apiClient.get(`/api/purchase-processes/${process.id}`);
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al calcular';
    } finally {
      loading = false;
    }
  }

  onMount(loadDashboard);
</script>

<div class="container">
  <h1>Perfil financiero</h1>
  <AIDisclaimer />

  <form on:submit={computeFinancials}>
    <div class="field">
      <label for="savings">Ahorros disponibles (€)</label>
      <input id="savings" type="number" bind:value={savings} min="0" required />
    </div>
    <div class="field">
      <label for="income">Ingresos netos mensuales (€)</label>
      <input id="income" type="number" bind:value={monthlyIncome} min="0" required />
    </div>
    <div class="field">
      <label for="debts">Deudas existentes (€)</label>
      <input id="debts" type="number" bind:value={existingDebts} min="0" />
    </div>
    <div class="field">
      <label for="region">Comunidad autónoma</label>
      <select id="region" bind:value={region}>
        {#each REGIONS as r}
          <option value={r}>{r}</option>
        {/each}
      </select>
    </div>
    <button class="btn-primary" type="submit" disabled={loading}>
      {loading ? 'Calculando…' : 'Calcular'}
    </button>
  </form>

  {#if error}
    <div class="card error">
      <p>{error}</p>
    </div>
  {/if}

  {#if computed}
    <section class="card">
      <h2>Gastos ocultos</h2>
      <p class="text-muted">
        Estos son los costes adicionales que necesitarás para formalizar la compra.
      </p>
      <pre>{JSON.stringify(computed, null, 2)}</pre>
    </section>
  {/if}
</div>

<style>
  .field {
    margin-bottom: 0.75rem;
  }
  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  button {
    margin-top: 0.5rem;
    width: 100%;
  }
  pre {
    background: var(--color-bg-soft);
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    overflow-x: auto;
    font-size: 0.8rem;
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
