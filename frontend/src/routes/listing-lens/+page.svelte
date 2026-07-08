<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import LoadingState from '$lib/components/LoadingState.svelte';
  import RedFlagCard from '$lib/components/RedFlagCard.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import { formatCurrency, formatDate, scoreColor } from '$lib/utils/format';
  import type { AnalyzeListingResponse, RedFlagItem } from '$lib/api/types';

  let url = '';
  let loading = false;
  let error: string | null = null;
  let result: AnalyzeListingResponse | null = null;
  let currentStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  async function analyzeListing(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (!url.trim()) return;
    loading = true;
    error = null;
    result = null;
    currentStep = 'fetching_html';

    // Simulate progress events (real impl would use SSE)
    const stepTimer = setInterval(() => {
      if (currentStep === 'fetching_html') currentStep = 'resolving_location';
      else if (currentStep === 'resolving_location') currentStep = 'analyzing';
      else if (currentStep === 'analyzing') currentStep = 'cross_referencing_cadastro';
    }, 3000);

    try {
      result = await apiClient.post<AnalyzeListingResponse>('/api/listings/analyze', { url });
    } catch (e) {
      if (e instanceof ApiError) {
        error = `${e.code}: ${e.message}`;
      } else {
        error = 'Error de red. Inténtalo de nuevo.';
      }
    } finally {
      clearInterval(stepTimer);
      loading = false;
      currentStep = null;
    }
  }
</script>

<div class="container">
  <h1>Analizar anuncio</h1>
  <AIDisclaimer />

  <form on:submit={analyzeListing}>
    <label for="url">URL del anuncio</label>
    <input
      id="url"
      type="url"
      bind:value={url}
      placeholder="https://www.idealista.com/inmueble/..."
      required
      disabled={loading}
    />
    <button class="btn-primary" type="submit" disabled={loading || !url}>
      {loading ? 'Analizando…' : 'Analizar'}
    </button>
  </form>

  {#if loading}
    <LoadingState activeStep={currentStep} />
  {/if}

  {#if error}
    <div class="card error">
      <p>{error}</p>
      <p class="text-muted">
        Si el portal está bloqueando peticiones, pega el texto del anuncio manualmente.
      </p>
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
  form {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  button {
    margin-top: 0.75rem;
    width: 100%;
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
</style>
