<script lang="ts">
  import { onMount } from 'svelte';
  import { negotiationApi, ApiError } from '$lib/api/client';
  import type { NegotiationPoint } from '$lib/api/types';

  export let listingId: string;

  let points: NegotiationPoint[] | null = null;
  let loading = true;
  let error: string | null = null;

  const CATEGORY_LABELS: Record<string, string> = {
    euphemistic_language: 'Lenguaje eufemístico',
    suspicious_price: 'Precio sospechoso',
    missing_energy_certificate: 'Sin certificado energético',
    inflated_square_meters: 'Metros cuadrados inflados',
    vague_location: 'Ubicación vaga',
    no_floor_plan: 'Sin plano',
    stale_listing: 'Anuncio antiguo',
    missing_community_costs: 'Gastos de comunidad',
    hidden_fees_mentioned: 'Cargos ocultos',
    photos_mismatch: 'Fotos inconsistentes',
    missing_year_built: 'Año de construcción',
    missing_orientation: 'Orientación',
    general: 'General',
  };

  const CATEGORY_COLOR: Record<string, string> = {
    euphemistic_language: '#eab308',
    suspicious_price: '#dc2626',
    missing_energy_certificate: '#f97316',
    inflated_square_meters: '#ef4444',
    vague_location: '#f59e0b',
    no_floor_plan: '#a855f7',
    stale_listing: '#6b7280',
    missing_community_costs: '#3b82f6',
    hidden_fees_mentioned: '#dc2626',
    photos_mismatch: '#ef4444',
    missing_year_built: '#6366f1',
    missing_orientation: '#0ea5e9',
    general: '#64748b',
  };

  function colorFor(category: string): string {
    return CATEGORY_COLOR[category] ?? '#64748b';
  }

  onMount(async () => {
    try {
      const res = await negotiationApi.getPoints(listingId);
      points = res.points;
    } catch (e) {
      error = e instanceof ApiError ? `${e.code}: ${e.message}` : 'No se pudieron cargar los puntos.';
    } finally {
      loading = false;
    }
  });
</script>

<section class="card negotiation">
  <h2>Puntos para negociar con el inmobiliario</h2>
  <p class="text-muted disclaimer">
    Generados desde plantillas educativas, no son consejo financiero.
  </p>

  {#if loading}
    <p class="text-muted">Cargando preguntas…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if points && points.length > 0}
    <ol class="points">
      {#each points as p}
        <li class="point" style="border-left-color: {colorFor(p.category)}">
          <p class="question">{p.question}</p>
          <details>
            <summary class="text-muted">Por qué esta pregunta</summary>
            <p class="rationale">{p.rationale}</p>
          </details>
          <span class="tag" style="background: {colorFor(p.category)}">{CATEGORY_LABELS[p.category] ?? p.category}</span>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="text-muted">No hay puntos de negociación.</p>
  {/if}
</section>

<style>
  .negotiation {
    margin-top: 1.5rem;
  }
  .disclaimer {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
  .points {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .point {
    border-left: 4px solid #64748b;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.75rem;
    background: #f9fafb;
    border-radius: 4px;
    position: relative;
  }
  .question {
    margin: 0 0 0.25rem 0;
    font-weight: 500;
  }
  .rationale {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
    color: #475569;
  }
  .tag {
    display: inline-block;
    font-size: 0.7rem;
    color: white;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-top: 0.25rem;
  }
  .error {
    color: #b91c1c;
  }
</style>
