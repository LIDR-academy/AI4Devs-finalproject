<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';

  let deleting = false;

  async function startNewProcess() {
    deleting = true;
    try {
      await apiClient.delete('/api/purchase-processes/active');
    } catch {
      // non-blocking: navigate anyway
    }
    goto('/listing-lens');
  }
</script>

<section class="hero">
  <h1>Compra una casa<br />con los ojos abiertos</h1>
  <p class="sub">Pega el texto del anuncio y te contamos lo que no dice. Simula tu hipoteca y descubre los costes ocultos.</p>
  <button class="btn-primary cta" on:click={startNewProcess} disabled={deleting}>
    {deleting ? 'Preparando...' : 'Analizar un anuncio'}
  </button>
</section>

<style>
  .hero {
    text-align: center;
    padding: 2rem 1rem 1rem;
  }
  h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-brand);
    line-height: 1.15;
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }
  .sub {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin: 0 auto 1.5rem;
    max-width: 32ch;
    line-height: 1.4;
  }
  .cta {
    display: inline-block;
    text-decoration: none;
    margin-bottom: 1rem;
  }
</style>
