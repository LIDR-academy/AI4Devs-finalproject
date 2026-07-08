<script lang="ts">
  export let activeStep: 'fetching_html' | 'resolving_location' | 'analyzing' | 'cross_referencing_cadastro' | null = null;

  const STEPS = [
    { key: 'fetching_html', label: 'Obteniendo anuncio' },
    { key: 'resolving_location', label: 'Resolviendo ubicación' },
    { key: 'analyzing', label: 'Analizando con IA' },
    { key: 'cross_referencing_cadastro', label: 'Cruzando con Catastro' },
  ] as const;

  function isActive(stepKey: typeof STEPS[number]['key']): boolean {
    if (!activeStep) return false;
    return STEPS.findIndex((s) => s.key === stepKey) <= STEPS.findIndex((s) => s.key === activeStep);
  }
</script>

<div class="loading" role="status" aria-live="polite">
  <div class="spinner" />
  <ul>
    {#each STEPS as step}
      <li class:active={isActive(step.key)} class:current={activeStep === step.key}>
        {step.label}
      </li>
    {/each}
  </ul>
  <p class="text-muted">Esto puede tardar entre 8 y 15 segundos.</p>
</div>

<style>
  .loading {
    text-align: center;
    padding: 2rem 1rem;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    margin: 0 auto 1rem;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    text-align: left;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
  li {
    padding: 0.4rem 0;
    color: var(--color-text-muted);
    font-size: 0.9rem;
    transition: color 0.2s;
  }
  li.active {
    color: var(--color-text);
  }
  li.current {
    color: var(--color-primary);
    font-weight: 600;
  }
  li::before {
    content: '○ ';
  }
  li.active::before {
    content: '● ';
  }
</style>
