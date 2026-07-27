<script lang="ts">
  let portal: 'idealista' | 'fotocasa' | 'otro' = 'idealista';
  export let onClose: () => void = () => {};
  export let onReady: () => void = () => {};

  const portalNames: Record<string, string> = {
    idealista: 'Idealista',
    fotocasa: 'Fotocasa',
    otro: 'otro portal',
  };

  $: portalName = portalNames[portal] ?? 'el portal';
</script>

<div class="overlay" role="dialog" aria-label="Cómo copiar un anuncio">
  <div class="guide">
    <button class="close-btn" on:click={onClose} aria-label="Cerrar">✕</button>
    <h2>Cómo analizar un anuncio</h2>

    <p class="explanation">
      Los portales inmobiliarios como <strong>Idealista</strong> o <strong>Fotocasa</strong>
      bloquean automáticamente los robots que intentan acceder a sus anuncios.
      Es una medida de protección estándar en el sector.
    </p>
    <p class="explanation">
      La solución es sencilla: <strong>copia tú mismo el texto del anuncio</strong> y pégalo aquí.
      El análisis que obtendrás es exactamente el mismo que si hubiera accedido automáticamente.
    </p>

    <div class="steps">
      <div class="step">
        <span class="step-num">1</span>
        <div>
          <strong>Abre el anuncio</strong>
          <p>Ve al anuncio en {portalName} y haz clic en la página del piso que te interesa.</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <div>
          <strong>Selecciona todo el texto</strong>
          <p>Pulsa <kbd>Ctrl+A</kbd> (Windows) o <kbd>Cmd+A</kbd> (Mac) para seleccionar todo el contenido del anuncio.</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <div>
          <strong>Copia el texto</strong>
          <p>Pulsa <kbd>Ctrl+C</kbd> (Windows) o <kbd>Cmd+C</kbd> (Mac) para copiarlo al portapapeles.</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">4</span>
        <div>
          <strong>Pégalo aquí</strong>
          <p>Vuelve a esta página y pulsa <kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd> en el campo de texto de abajo.</p>
        </div>
      </div>
    </div>

    <div class="portal-select">
      <label for="portal">Portal donde viste el anuncio:</label>
      <select id="portal" bind:value={portal}>
        <option value="idealista">Idealista</option>
        <option value="fotocasa">Fotocasa</option>
        <option value="otro">Otro</option>
      </select>
    </div>

    <button class="btn-primary" on:click={onReady}>
      Ya lo copié, pegar el texto
    </button>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
    overflow-y: auto;
  }
  .guide {
    background: var(--color-bg);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 480px;
    width: 100%;
    margin-top: 2rem;
    position: relative;
  }
  .close-btn {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.25rem;
    line-height: 1;
  }
  h2 {
    font-size: 1.25rem;
    margin: 0 0 0.75rem;
    color: var(--color-brand);
  }
  .explanation {
    font-size: 0.85rem;
    color: var(--color-text);
    line-height: 1.5;
    margin: 0 0 0.5rem;
  }
  .steps {
    margin: 1rem 0;
  }
  .step {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: flex-start;
  }
  .step-num {
    background: var(--color-brand);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .step strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.15rem;
  }
  .step p {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
  }
  kbd {
    background: var(--color-bg-soft);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.8em;
    font-family: inherit;
  }
  .portal-select {
    margin: 1rem 0;
  }
  .portal-select label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-muted);
  }
  .portal-select select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.9rem;
    background: var(--color-bg);
  }
  .btn-primary {
    width: 100%;
  }
</style>