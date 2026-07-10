<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import NavTabs from '$lib/components/NavTabs.svelte';
</script>

<svelte:head>
  <title>Realista</title>
</svelte:head>

<Header />

<main>
  <slot />
</main>

<NavTabs />

<style>
  main {
    min-height: calc(100vh - 56px - 70px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
