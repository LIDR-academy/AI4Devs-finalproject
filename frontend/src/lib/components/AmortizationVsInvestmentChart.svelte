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
