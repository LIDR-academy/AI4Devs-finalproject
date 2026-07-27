<script lang="ts">
  import CopyGuide from './CopyGuide.svelte';
  import { extractFields, formatCurrency } from '$lib/utils/format';
  import type { ExtractedFields } from '$lib/utils/format';

  export let url: string = '';
  export let manualText: string = '';
  export let urlBlocked: boolean = false;
  export let disabled: boolean = false;
  export let onAnalize: (data: { url: string; manualText: string }) => void;

  let activeTab: 'text' | 'url' = 'text';
  let showGuide = false;
  let extracted: ExtractedFields | null = null;
  let showExtraction = false;

  $: if (urlBlocked && activeTab === 'url') {
    activeTab = 'text';
  }

  $: if (manualText.length > 50 && !extracted) {
    extracted = extractFields(manualText);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (activeTab === 'text' && manualText.trim()) {
      showExtraction = true;
    } else {
      onAnalize({ url, manualText });
    }
  }

  function confirmAndAnalyze() {
    showExtraction = false;
    onAnalize({ url, manualText });
  }

  function editExtraction() {
    showExtraction = false;
  }

  function closeGuide() {
    showGuide = false;
  }

  function guideReady() {
    showGuide = false;
    setTimeout(() => {
      const ta = document.getElementById('manualText');
      ta?.focus();
    }, 100);
  }
</script>

<form on:submit={handleSubmit}>
  {#if showGuide}
    <CopyGuide onClose={closeGuide} onReady={guideReady} />
  {/if}

  <div class="tabs" role="tablist">
    <button
      type="button"
      role="tab"
      data-tab="text"
      class:active={activeTab === 'text'}
      aria-selected={activeTab === 'text'}
      on:click={() => (activeTab = 'text')}
    >
      Texto
    </button>
    <button
      type="button"
      role="tab"
      data-tab="url"
      class:active={activeTab === 'url'}
      class:blocked={urlBlocked}
      aria-selected={activeTab === 'url'}
      on:click={() => (activeTab = 'url')}
    >
      URL
      {#if urlBlocked}<span class="x-icon" aria-label="no disponible">✕</span>{/if}
    </button>
  </div>

  {#if urlBlocked}
    <div class="banner-error" role="alert">
      <strong>Portal no accesible</strong>
      <p>Los portales inmobiliarios bloquean los accesos automáticos.</p>
      <button type="button" class="link-btn" on:click={() => (showGuide = true)}>
        Cómo copiar el texto del anuncio →
      </button>
    </div>
  {/if}

  {#if activeTab === 'text'}
    <label for="manualText">Texto del anuncio</label>
    <textarea
      id="manualText"
      bind:value={manualText}
      placeholder="Pega aquí el texto completo del anuncio (Ctrl+V / Cmd+V)..."
      rows="8"
      {disabled}
    ></textarea>
    <button type="button" class="link-btn" on:click={() => (showGuide = true)}>
      ¿Cómo copiar el anuncio?
    </button>
  {:else}
    <label for="url">URL del anuncio</label>
    <input
      id="url"
      type="url"
      bind:value={url}
      placeholder="https://www.idealista.com/inmueble/..."
      {disabled}
    />
    <p class="hint">La URL solo funciona con algunos portales. Si falla, usa la pestaña "Texto".</p>
  {/if}

  {#if showExtraction && extracted}
    <div class="extraction-card">
      <h3>Datos detectados</h3>
      <p class="text-muted">Revisa los datos que hemos extraído del texto. Puedes confirmarlos o editarlos.</p>
      <div class="fields">
        <div class="field-row">
          <span class="field-label">Precio</span>
          <span class="field-value">{extracted.price ? formatCurrency(extracted.price) : 'No detectado'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Superficie</span>
          <span class="field-value">{extracted.squareMeters ? `${extracted.squareMeters} m²` : 'No detectado'}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Habitaciones</span>
          <span class="field-value">{extracted.bedrooms ? `${extracted.bedrooms} hab.` : 'No detectado'}</span>
        </div>
      </div>
      <div class="extraction-actions">
        <button type="button" class="btn-secondary" on:click={editExtraction}>Editar texto</button>
        <button type="button" class="btn-primary" on:click={confirmAndAnalyze}>Confirmar y analizar</button>
      </div>
    </div>
  {/if}

  {#if !showExtraction}
    <button class="btn-primary" type="submit" disabled={disabled || (!url.trim() && !manualText.trim())}>
      {activeTab === 'url' ? 'Analizar URL' : 'Analizar texto'}
    </button>
  {/if}
</form>

<style>
  .tabs {
    display: flex;
    background: var(--color-bg-soft);
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 1rem;
  }
  .tabs button {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-muted);
    cursor: pointer;
    position: relative;
  }
  .tabs button.active {
    background: var(--color-bg);
    color: var(--color-brand);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
  .tabs button.blocked {
    color: var(--color-text-muted);
    text-decoration: line-through;
    opacity: 0.7;
    cursor: not-allowed;
  }
  .x-icon {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--color-danger);
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }
  .banner-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .banner-error strong {
    color: var(--color-danger);
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.25rem;
  }
  .banner-error p {
    color: #7f1d1d;
    font-size: 0.8rem;
    margin: 0;
  }
  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  textarea {
    width: 100%;
    font-family: inherit;
    resize: vertical;
  }
  button[type="submit"] {
    margin-top: 0.75rem;
    width: 100%;
  }
  .link-btn {
    background: none;
    border: none;
    color: var(--color-primary);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0.25rem 0;
    text-decoration: underline;
  }
  .link-btn:hover {
    color: var(--color-brand);
  }
  .hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0.25rem 0 0;
  }
  .extraction-card {
    background: var(--color-bg-soft);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;
  }
  .extraction-card h3 {
    font-size: 1rem;
    margin: 0 0 0.25rem;
  }
  .fields {
    margin: 0.75rem 0;
  }
  .field-row {
    display: flex;
    justify-content: space-between;
    padding: 0.35rem 0;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.85rem;
  }
  .field-row:last-child {
    border-bottom: none;
  }
  .field-label {
    color: var(--color-text-muted);
  }
  .field-value {
    font-weight: 600;
  }
  .extraction-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .extraction-actions button {
    flex: 1;
  }
  .btn-secondary {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .btn-primary {
    width: 100%;
  }
</style>
