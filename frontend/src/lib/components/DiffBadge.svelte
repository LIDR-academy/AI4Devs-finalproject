<script lang="ts">
  import { formatCurrency } from '$lib/utils/format';
  import type { ListingDiff } from '$lib/api/types';

  export let diff: ListingDiff;

  $: priceClass = (() => {
    if (diff.unchanged || diff.priceDelta === undefined) return '';
    return diff.priceDelta < 0 ? 'down' : 'up';
  })();

  $: priceLabel = (() => {
    if (diff.unchanged || diff.priceDelta === undefined) return null;
    const sign = diff.priceDelta > 0 ? '+' : '';
    return `${sign}${formatCurrency(diff.priceDelta)}`;
  })();
</script>

{#if diff.unchanged}
  <p class="badge neutral">Sin cambios desde el último análisis</p>
{:else}
  <div class="diffs">
    {#if priceLabel}
      <span class="badge {priceClass}">Precio: {priceLabel}</span>
    {/if}
    {#if diff.addedRedFlags.length > 0}
      <span class="badge warn">+{diff.addedRedFlags.length} bandera(s) roja(s)</span>
    {/if}
    {#if diff.removedRedFlags.length > 0}
      <span class="badge ok">−{diff.removedRedFlags.length} bandera(s) resuelta(s)</span>
    {/if}
  </div>
{/if}

<style>
  .diffs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .badge {
    display: inline-block;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #e5e7eb;
    color: #1f2937;
  }
  .badge.neutral {
    background: #f3f4f6;
    color: #6b7280;
  }
  .badge.down {
    background: #d1fae5;
    color: #065f46;
  }
  .badge.up {
    background: #fee2e2;
    color: #991b1b;
  }
  .badge.warn {
    background: #fef3c7;
    color: #92400e;
  }
  .badge.ok {
    background: #d1fae5;
    color: #065f46;
  }
</style>
