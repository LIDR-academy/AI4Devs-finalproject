<script lang="ts">
  import { page } from '$app/stores';

  const TABS = [
    { href: '/', label: 'Inicio', icon: '🏠' },
    { href: '/listing-lens', label: 'Anuncio', icon: '🔍' },
    { href: '/mortgage-compass', label: 'Hipoteca', icon: '💰' },
    { href: '/timeline', label: 'Cronograma', icon: '📅' },
    { href: '/checklist', label: 'Checklist', icon: '✓' },
  ];

  $: currentPath = $page.url.pathname;
</script>

<nav aria-label="Navegación principal">
  {#each TABS as tab}
    <a href={tab.href} class:active={currentPath === tab.href} aria-current={currentPath === tab.href ? 'page' : undefined}>
      <span class="icon" aria-hidden="true">{tab.icon}</span>
      <span class="label">{tab.label}</span>
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-bg);
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-around;
    padding: 0.5rem 0;
    padding-bottom: env(safe-area-inset-bottom, 0.5rem);
    z-index: 10;
  }
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.5rem;
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 0.7rem;
    min-width: 60px;
  }
  a.active {
    color: var(--color-primary);
  }
  .icon {
    font-size: 1.25rem;
  }
</style>
