<script lang="ts">
  import { onMount } from 'svelte';
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import { formatCurrency, formatDate, scoreColor } from '$lib/utils/format';
  import type { DashboardResponse } from '$lib/api/types';

  let data: DashboardResponse | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      data = await apiClient.get<DashboardResponse>('/api/dashboard');
    } catch (e) {
      if (e instanceof ApiError) {
        error = e.message;
      } else {
        error = 'No se pudo cargar el dashboard';
      }
    } finally {
      loading = false;
    }
  });
</script>

<div class="container">
  <h1>Tu proceso</h1>

  {#if loading}
    <p class="text-muted">Cargando…</p>
  {:else if error}
    <div class="card">
      <p class="text-muted">Error: {error}</p>
    </div>
  {:else if data?.empty}
    <AIDisclaimer compact />
    <div class="card empty-state">
      <p>Aún no has analizado ningún anuncio ni configurado tu perfil financiero.</p>
      <p>Empieza por una de estas opciones:</p>
      {#each data.ctas ?? [] as cta}
        <a href={cta.href} class="btn-primary cta">{cta.label}</a>
      {/each}
    </div>
  {:else if data}
    <AIDisclaimer compact />

    <section class="card">
      <h2>Último anuncio analizado</h2>
      {#if data.latestListing}
        <div class="score" style="color: {scoreColor(data.latestListing.transparencyScore)}">
          {data.latestListing.transparencyScore}/100
        </div>
        <p class="text-muted">
          {data.latestListing.redFlagsCount} bandera{data.latestListing.redFlagsCount === 1 ? '' : 's'} roja{data.latestListing.redFlagsCount === 1 ? '' : 's'}
          · {formatDate(data.latestListing.createdAt)}
        </p>
        <a href="/listing-lens">Volver a analizar</a>
      {:else}
        <p class="text-muted">Sin análisis aún.</p>
        <a href="/listing-lens" class="btn-primary">Analizar un anuncio</a>
      {/if}
    </section>

    {#if data.process}
      <section class="card">
        <h2>Tu hipoteca</h2>
        <p><strong>Etapa actual:</strong> {data.process.currentStage}</p>
        {#if data.process.propertyPrice !== null}
          <p><strong>Precio de la vivienda:</strong> {formatCurrency(Number(data.process.propertyPrice))}</p>
        {/if}
        <a href="/mortgage-compass">Ver perfil financiero</a>
      </section>
    {/if}

    {#if data.checklist}
      <section class="card">
        <h2>Checklist documental</h2>
        <p>
          {data.checklist.completedItems} de {data.checklist.totalItems} documentos completados
        </p>
        <progress value={data.checklist.progress} max="1" />
        <a href="/checklist">Ver checklist</a>
      </section>
    {/if}
  {/if}
</div>

<style>
  .empty-state {
    text-align: center;
  }
  .cta {
    display: block;
    margin: 0.75rem auto;
    max-width: 280px;
  }
  .score {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0.5rem 0;
  }
  progress {
    width: 100%;
    height: 8px;
    margin: 0.5rem 0;
  }
  section {
    margin-bottom: 1rem;
  }
</style>
