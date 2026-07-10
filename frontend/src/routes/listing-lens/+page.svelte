<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import ListingTabs from '$lib/components/ListingTabs.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import RedFlagCard from '$lib/components/RedFlagCard.svelte';
  import NegotiationPoints from '$lib/components/NegotiationPoints.svelte';
  import { ApiError } from '$lib/api/client';
  import { analyzeListingStream } from '$lib/api/streamingClient';
  import { session } from '$lib/stores/session';
  import { formatCurrency, formatDate, scoreColor } from '$lib/utils/format';
  import type { AnalyzeListingResponse } from '$lib/api/types';

  let url = '';
  let manualText = '';
  let urlBlocked = false;
  let loading = false;
  let error: string | null = null;
  let result: AnalyzeListingResponse | null = null;
  let currentStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  async function handleAnalyze(data: { url: string; manualText: string }): Promise<void> {
    loading = true;
    error = null;
    result = null;
    currentStep = 'fetching_html';

    try {
      result = await analyzeListingStream(
        { url: data.url, manualText: data.manualText, sessionId: $session.sessionId },
        (event) => { currentStep = event; },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error de red. Inténtalo de nuevo.';
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
</script>

<div class="container">
  <h1>Analizar anuncio</h1>
  <AIDisclaimer />

  <ListingTabs
    bind:url
    bind:manualText
    bind:urlBlocked
    disabled={loading}
    onAnalize={handleAnalyze}
  />

  {#if loading}
    <LoadingState activeStep={currentStep} />
  {/if}

  {#if error && !urlBlocked}
    <div class="card error">
      <p>{error}</p>
      {#if !urlBlocked}
        <p class="text-muted">
          Si el portal está bloqueando peticiones, pega el texto del anuncio manualmente.
        </p>
      {/if}
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
    </section>
  {/if}
</div>

<style>
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
</style>
