<script lang="ts">
  import Logo from './Logo.svelte';
</script>

<header class="header">
  <div class="inner">
    <Logo variant="full" height="28px" />
    <div class="right-slot">
      <slot />
    </div>
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
    justify-content: space-between;
  }
  .right-slot:empty {
    display: none;
  }
</style>
