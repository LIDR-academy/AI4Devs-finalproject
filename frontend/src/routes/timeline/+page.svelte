<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import type { TimelineMilestone } from '$lib/api/types';
  import { onMount } from 'svelte';

  let milestones: TimelineMilestone[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      const res = await apiClient.get<{ milestones: TimelineMilestone[] }>('/api/timeline');
      milestones = res.milestones;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al cargar';
    } finally {
      loading = false;
    }
  });
</script>

<div class="container">
  <h1>Cronograma del proceso</h1>
  <AIDisclaimer />

  {#if loading}
    <p class="text-muted">Cargando…</p>
  {:else if error}
    <div class="card error">
      <p>{error}</p>
    </div>
  {:else}
    <div class="timeline">
      {#each milestones as m, i}
        <div class="milestone">
          <div class="dot">{i + 1}</div>
          <div class="content">
            <h3>{m.title}</h3>
            <p class="duration">{m.estimatedDays} días estimados</p>
            <p>{m.description}</p>
            {#if m.documentsNeeded.length > 0}
              <details>
                <summary>Documentos necesarios ({m.documentsNeeded.length})</summary>
                <ul>
                  {#each m.documentsNeeded as doc}
                    <li>{doc}</li>
                  {/each}
                </ul>
              </details>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .timeline {
    position: relative;
    padding-left: 2rem;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 2px;
    background: var(--color-border);
  }
  .milestone {
    position: relative;
    margin-bottom: 1.5rem;
  }
  .dot {
    position: absolute;
    left: -2rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }
  .content {
    background: var(--color-bg-soft);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
  }
  h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
  }
  .duration {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0 0 0.5rem;
  }
  details {
    margin-top: 0.5rem;
    font-size: 0.85rem;
  }
  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
