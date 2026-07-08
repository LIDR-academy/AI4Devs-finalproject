<script lang="ts">
  import type { RedFlagItem } from '$lib/api/types';
  export let flag: RedFlagItem;

  const LABELS_ES: Record<string, string> = {
    euphemistic_language: 'Lenguaje eufemístico',
    vague_location: 'Ubicación vaga',
    missing_energy_certificate: 'Sin certificado energético',
    inflated_square_meters: 'Metros cuadrados inflados',
    no_floor_plan: 'Sin plano',
    suspicious_price: 'Precio sospechoso',
    stale_listing: 'Anuncio antiguo',
    missing_community_costs: 'Gastos de comunidad no especificados',
    hidden_fees_mentioned: 'Cargos ocultos mencionados',
    photos_mismatch: 'Fotos inconsistentes',
    missing_year_built: 'Año de construcción no indicado',
    missing_orientation: 'Orientación no indicada',
  };
</script>

<div class="red-flag" class:high={flag.severity === 'high'} class:medium={flag.severity === 'medium'}>
  <div class="header">
    <span class="category">{LABELS_ES[flag.flag] ?? flag.flag}</span>
    <span class="severity">{flag.severity}</span>
  </div>
  <p class="reasoning">{flag.reasoning}</p>
</div>

<style>
  .red-flag {
    background: var(--color-bg-soft);
    border-left: 4px solid var(--color-warning);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
  }
  .red-flag.high {
    border-left-color: var(--color-danger);
  }
  .red-flag.medium {
    border-left-color: var(--color-warning);
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  .category {
    font-weight: 600;
    font-size: 0.9rem;
  }
  .severity {
    font-size: 0.7rem;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }
  .reasoning {
    margin: 0;
    font-size: 0.85rem;
    color: var(--color-text);
    line-height: 1.4;
  }
</style>
