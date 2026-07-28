<script lang="ts">
  import type { AmortizationScenario, InvestmentScenario } from '$lib/api/types';
  import { formatCurrency } from '$lib/utils/format';

  export let amortization: AmortizationScenario[];
  export let investment: InvestmentScenario[];
  export let showRealValue = false;

  const amortColors = ['#94a3b8', '#60a5fa', '#3b82f6', '#1d4ed8'];
  const investColors = ['#86efac', '#22c55e', '#15803d'];

  $: investValues = investment.map((s) =>
    showRealValue ? s.realValue : s.nominalValue,
  );

  $: maxInterest = Math.max(...amortization.map((s) => s.totalInterest), 1);
  $: maxInvest = Math.max(...investValues, 1);
  $: yearsLabel = (s: AmortizationScenario) => {
    if (s.yearsReduced <= 0) return `${s.yearsToPayoff.toFixed(1)} años`;
    return `${s.yearsToPayoff.toFixed(1)} años (−${s.yearsReduced.toFixed(1)} años)`;
  };
</script>

<div class="chart" role="img" aria-label="Comparativa amortización vs inversión">

  <div class="section-label">Amortización hipotecaria</div>
  <p class="section-desc">Intereses totales pagados según ritmo de amortización voluntaria</p>

  {#each amortization as s, i}
    <div class="row">
      <div class="label">
        <span class="name">{s.name}</span>
        <span class="sub">{yearsLabel(s)}</span>
      </div>
      <div class="bar-track">
        <div
          class="bar"
          style="width: {(s.totalInterest / maxInterest) * 100}%; background: {amortColors[i]}"
        />
      </div>
      <div class="value">
        <strong>{formatCurrency(s.totalInterest)}</strong>
        <span class="suffix">intereses</span>
      </div>
    </div>
  {/each}

  <div class="section-label">Alternativa de inversión</div>
  <p class="section-desc">Valor acumulado invirtiendo 300 €/mes durante 30 años</p>

  {#each investment as s, i}
    <div class="row">
      <div class="label">
        <span class="name">{s.name}</span>
        <span class="sub">Inversión: {formatCurrency(s.totalContributed)} → {formatCurrency(showRealValue ? s.realValue : s.nominalValue)}</span>
      </div>
      <div class="bar-track">
        <div
          class="bar"
          style="width: {(investValues[i] / maxInvest) * 100}%; background: {investColors[i]}"
        />
      </div>
      <div class="value">
        <strong>{formatCurrency(investValues[i])}</strong>
        <span class="suffix">{showRealValue ? 'valor real' : 'nominal'}</span>
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
  .section-label {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-text);
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }
  .section-label:first-child {
    border-top: none;
  }
  .section-desc {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    margin: 0;
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
  @media (max-width: 480px) {
    .row {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
    .value {
      text-align: left;
    }
    .suffix {
      display: inline;
      margin-left: 0.5rem;
    }
  }
</style>
