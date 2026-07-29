<script lang="ts">
  import { onMount } from 'svelte';
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import ListingTabs from '$lib/components/ListingTabs.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import RedFlagCard from '$lib/components/RedFlagCard.svelte';
  import NegotiationPoints from '$lib/components/NegotiationPoints.svelte';
  import { ApiError } from '$lib/api/client';
  import { analyzeListingStream } from '$lib/api/streamingClient';
  import { session } from '$lib/stores/session';
  import { lastAnalysis } from '$lib/stores/lastAnalysis';
  import { formatCurrency, formatDate, scoreColor } from '$lib/utils/format';
  import type { AnalyzeListingResponse } from '$lib/api/types';

  let url = '';
  let manualText = '';
  let urlBlocked = false;
  let loading = false;
  let error: string | null = null;
  let result: AnalyzeListingResponse | null = null;
  let currentStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  onMount(() => {
    const prev = $lastAnalysis;
    if (prev) {
      url = prev.url;
      manualText = prev.manualText;
    }
  });

  async function handleAnalyze(data: { url: string; manualText: string }): Promise<void> {
    url = data.url;
    manualText = data.manualText;
    loading = true;
    error = null;
    result = null;
    currentStep = 'fetching_html';

    lastAnalysis.set({ url: data.url, manualText: data.manualText });

    try {
      result = await analyzeListingStream(
        { url: data.url, manualText: data.manualText, sessionId: $session.sessionId },
        (event) => { currentStep = event; },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error de red. Inténtalo de nuevo.';
      console.warn('[listing-lens] analyze error:', { name: (e as Error)?.name, code: (e as { code?: string })?.code, message });
      if (e instanceof ApiError) {
        error = `${e.code}: ${message}`;
        if (e.code === 'PORTAL_BLOCKED' || e.code === 'BLOCKED') urlBlocked = true;
      } else {
        error = message;
      }
    } finally {
      loading = false;
      currentStep = null;
    }
  }

  function resetForm() {
    result = null;
    error = null;
    urlBlocked = false;
    url = '';
    manualText = '';
  }

  function editAgain() {
    result = null;
    error = null;
  }
</script>

<div class="container">
  <h1>Analizar un anuncio</h1>
  <AIDisclaimer />

  {#if !loading && !result}
    <p class="intro">Pega el texto del anuncio que te interesa y descubre lo que oculta. También puedes probar con una URL.</p>
    <ListingTabs
      bind:url
      bind:manualText
      bind:urlBlocked
      disabled={loading}
      onAnalyze={handleAnalyze}
    />
  {/if}

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

      <div class="result-actions">
        <button class="btn-secondary" on:click={editAgain}>
          ← Editar texto
        </button>
        <button class="btn-secondary" on:click={resetForm}>
          Nuevo análisis
        </button>
      </div>
    </section>

    <section class="card next-steps">
      <h3>Siguientes pasos</h3>
      <p class="text-muted">El análisis se ha guardado en tu proceso. Ahora puedes:</p>
      <div class="actions">
        <a href="/mortgage-compass" class="btn-primary">
          Calcular hipoteca →
        </a>
        <a href="/timeline" class="btn-secondary">
          Ver proceso de compra
        </a>
        <a href="/mi-proceso" class="btn-secondary">
          Ir al dashboard
        </a>
      </div>
    </section>
  {/if}
</div>

<style>
  .intro {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    margin: 0 0 1rem;
    line-height: 1.4;
  }
  .error {
    border-color: var(--color-danger);
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
  .next-steps {
    margin-top: 1rem;
  }
  .next-steps h3 {
    margin-top: 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .actions a {
    text-align: center;
    text-decoration: none;
    padding: 0.65rem;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .result-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .result-actions button {
    flex: 1;
    padding: 0.5rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-secondary {
    background: var(--color-bg-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
  }
  .btn-primary {
    background: var(--color-primary);
    color: white;
  }
</style>
