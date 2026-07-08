<script lang="ts">
  import '../app.css';
  import NavTabs from '$lib/components/NavTabs.svelte';
</script>

<svelte:head>
  <title>Realista</title>
</svelte:head>

<main>
  <slot />
</main>

<NavTabs />

<style>
  main {
    min-height: 100vh;
    padding-bottom: 1rem;
  }
</style>
