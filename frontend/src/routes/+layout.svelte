<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import ProcessStepper from '$lib/components/ProcessStepper.svelte';
  import { apiClient } from '$lib/api/client';

  const STEPS = [
    { id: 'listing', label: 'Anuncio', href: '/listing-lens' },
    { id: 'mortgage', label: 'Hipoteca', href: '/mortgage-compass' },
    { id: 'timeline', label: 'Cronograma', href: '/timeline' },
    { id: 'checklist', label: 'Checklist', href: '/checklist' },
  ];

  const PATH_TO_STEP: Record<string, string> = {
    '/listing-lens': 'listing',
    '/mortgage-compass': 'mortgage',
    '/timeline': 'timeline',
    '/checklist': 'checklist',
  };

  $: currentStep = PATH_TO_STEP[$page.url.pathname] ?? 'listing';

  let completedSteps: Set<string> = new Set();

  onMount(async () => {
    try {
      const data = await apiClient.get<{
        latestListing: unknown | null;
        process: { propertyPrice: number | null; currentStage: string | null } | null;
        checklist: { completedItems: number; totalItems: number } | null;
      }>('/api/dashboard');
      const cs = new Set<string>();
      if (data.latestListing) cs.add('listing');
      if (data.process?.propertyPrice != null) cs.add('mortgage');
      if (data.process?.currentStage != null) cs.add('timeline');
      if (data.checklist && data.checklist.completedItems > 0) cs.add('checklist');
      completedSteps = cs;
    } catch {
      // si falla, mostrar todo como no completado
    }
  });
</script>

<svelte:head>
  <title>Realista</title>
</svelte:head>

<Header />

<main>
  <slot />
</main>

<ProcessStepper steps={STEPS} {currentStep} {completedSteps} />

<style>
  main {
    min-height: calc(100vh - 56px - 70px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
