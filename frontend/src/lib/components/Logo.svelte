<script lang="ts">
  export let variant: 'full' | 'icon' = 'full';
  export let height: string = '32px';

  $: showWordmark = variant === 'full';
</script>

<a href="/" aria-label="Realista — inicio" class="logo-link">
  <svg viewBox="0 0 64 44" {height} fill="none" aria-hidden="true" class="logo-icon">
    <path d="M10 34 L10 22 L28 6 L46 22 L46 34 Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round" fill="none"/>
    <line x1="10" y1="34" x2="46" y2="34" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="0" y1="4"  x2="19" y2="14" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="0" y1="9"  x2="19" y2="14" stroke="#eab308" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="0" y1="14" x2="19" y2="14" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="37" y1="14" x2="58" y2="14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <circle cx="60" cy="14" r="3" fill="currentColor"/>
  </svg>
  {#if showWordmark}
    <span class="wordmark">Realista</span>
  {/if}
</a>

<style>
  .logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--color-brand);
  }
  .logo-icon {
    flex-shrink: 0;
  }
  .wordmark {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--color-brand);
    letter-spacing: -0.02em;
  }
</style>
