<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import ProcessStepper from '$lib/components/ProcessStepper.svelte';
  import { apiClient } from '$lib/api/client';
  import type { DashboardResponse } from '$lib/api/types';

  const STEPS = [
    { id: 'listing', label: 'Anuncio', href: '/listing-lens' },
    { id: 'mortgage', label: 'Hipoteca', href: '/mortgage-compass' },
    { id: 'timeline', label: 'Proceso', href: '/timeline' },
  ];

  const PATH_TO_STEP: Record<string, string> = {
    '/listing-lens': 'listing',
    '/mortgage-compass': 'mortgage',
    '/timeline': 'timeline',
  };

  const ROUTES_WITH_STEPPER = new Set([
    '/listing-lens',
    '/mortgage-compass',
    '/timeline',
  ]);

  $: currentStep = PATH_TO_STEP[$page.url.pathname] ?? 'listing';
  $: showStepper = ROUTES_WITH_STEPPER.has($page.url.pathname);

  let completedSteps: Set<string> = new Set();

  onMount(async () => {
    try {
      const data = await apiClient.get<DashboardResponse>('/api/dashboard');
      if (data.empty) {
        completedSteps = new Set();
        return;
      }
      const cs = new Set<string>();
      if (data.latestListing) cs.add('listing');
      if (data.process.financialProfile != null) cs.add('mortgage');
      if (data.process.currentStage !== 'PRE_ARRAS') cs.add('timeline');
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

{#if showStepper}
  <ProcessStepper steps={STEPS} {currentStep} {completedSteps} />
{/if}

<style>
  main {
    min-height: calc(100vh - 56px - 70px);
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
</style>
