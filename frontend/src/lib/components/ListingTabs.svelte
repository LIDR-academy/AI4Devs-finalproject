<script lang="ts">
  export let url: string = '';
  export let manualText: string = '';
  export let urlBlocked: boolean = false;
  export let disabled: boolean = false;
  export let onAnalize: (data: { url: string; manualText: string }) => void;

  let activeTab: 'url' | 'text' = 'url';

  $: if (urlBlocked && activeTab === 'url') {
    activeTab = 'text';
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    onAnalize({ url, manualText });
  }
</script>

<form on:submit={handleSubmit}>
  <div class="tabs" role="tablist">
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
  </div>

  {#if urlBlocked}
    <div class="banner-error" role="alert">
      <strong>URL no disponible</strong>
      <p>Este portal bloqueó la petición. Pega el texto del anuncio.</p>
    </div>
  {/if}

  {#if activeTab === 'url'}
    <label for="url">URL del anuncio</label>
    <input
      id="url"
      type="url"
      bind:value={url}
      placeholder="https://www.idealista.com/inmueble/..."
      {disabled}
    />
  {:else}
    <label for="manualText">Texto del anuncio</label>
    <textarea
      id="manualText"
      bind:value={manualText}
      placeholder="Copia el texto del anuncio y pégalo aquí…"
      rows="6"
      {disabled}
    ></textarea>
  {/if}

  <button class="btn-primary" type="submit" disabled={disabled || (!url.trim() && !manualText.trim())}>
    {activeTab === 'url' ? 'Analizar' : 'Analizar texto'}
  </button>
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
</style>
