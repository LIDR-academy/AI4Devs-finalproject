<script lang="ts">
  import { fade } from 'svelte/transition';
  import Logo from './Logo.svelte';

  let open = false;

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:click={close} on:keydown={handleKeydown} />

<header class="header" role="banner">
  <div class="inner">
    <button
      class="hamburger"
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={open}
      on:click|stopPropagation={toggle}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        {#if open}
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        {:else}
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        {/if}
      </svg>
    </button>

    <Logo variant="full" height="28px" />

    <div class="right-slot">
      <slot />
    </div>

    {#if open}
      <nav
        class="menu"
        role="navigation"
        aria-label="Navegación principal"
        on:click|stopPropagation
        transition:fade={{ duration: 120 }}
      >
        <a href="/listing-lens" on:click={close}>Analizar anuncio</a>
        <a href="/mortgage-compass" on:click={close}>Simular hipoteca</a>
        <a href="/timeline" on:click={close}>Cronograma</a>
        <a href="/checklist" on:click={close}>Checklist</a>
        <hr class="divider" />
        <a href="/mi-proceso" on:click={close}>Mi proceso</a>
      </nav>
    {/if}
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom-width: 1px;
    border-bottom-style: solid;
    border-bottom-color: var(--color-border);
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.95);
  }
  .inner {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 1rem;
    min-height: 56px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: relative;
  }
  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    color: var(--color-text);
    flex-shrink: 0;
  }
  .hamburger:hover {
    background: var(--color-bg-soft);
  }
  .right-slot {
    margin-left: auto;
  }
  .right-slot:empty {
    display: none;
  }
  .menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 240px;
    background: var(--color-bg);
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
    border-radius: 0 0 var(--radius-md) 0;
    box-shadow: var(--shadow-md);
    z-index: 60;
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;
  }
  .menu a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--color-text);
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none;
  }
  .menu a:hover {
    background: var(--color-bg-soft);
    text-decoration: none;
  }
  .divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 0.25rem 0.75rem;
  }
</style>
