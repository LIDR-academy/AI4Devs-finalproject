<script lang="ts">
  export let activeStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  const STEPS = [
    { key: 'fetching_html', label: 'Obteniendo anuncio' },
    { key: 'resolving_location', label: 'Resolviendo ubicación' },
    { key: 'analyzing', label: 'Analizando con IA' },
    { key: 'cross_referencing_cadastro', label: 'Cruzando con Catastro' },
  ] as const;

  function stepIndex(key: string): number {
    return STEPS.findIndex((s) => s.key === key);
  }

  $: currentIdx = activeStep ? stepIndex(activeStep) : -1;
  $: progress = currentIdx >= 0 ? ((currentIdx + 1) / STEPS.length) * 100 : 0;
</script>

<div class="loading" role="status" aria-live="polite">
  <div class="progress-track">
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>
  <div class="steps">
    {#each STEPS as step, i}
      <div
        class="step"
        class:past={currentIdx > i}
        class:current={currentIdx === i}
        class:future={currentIdx < i}
      >
        <div class="dot" />
        <span class="label">{step.label}</span>
      </div>
    {/each}
  </div>
  <p class="eta">Unos segundos más…</p>
</div>

<style>
  .loading {
    padding: 2rem 1rem;
    max-width: 400px;
    margin: 0 auto;
  }
  .progress-track {
    width: 100%;
    height: 6px;
    background: var(--color-bg-soft);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .progress-fill {
    height: 100%;
    background: var(--color-primary);
    border-radius: 3px;
    transition: width 0.5s ease;
  }
  .steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    opacity: 0.4;
    transition: opacity 0.3s;
  }
  .step.current {
    opacity: 1;
  }
  .step.past {
    opacity: 0.6;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-border);
    flex-shrink: 0;
    transition: background 0.3s;
  }
  .step.current .dot {
    background: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }
  .step.past .dot {
    background: var(--color-success);
  }
  .label {
    font-size: 0.9rem;
    color: var(--color-text);
  }
  .step.current .label {
    font-weight: 600;
  }
  .eta {
    text-align: center;
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 1.5rem;
  }
</style>