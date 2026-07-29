<script lang="ts">
  import AIDisclaimer from '$lib/components/AIDisclaimer.svelte';
  import { apiClient, ApiError } from '$lib/api/client';
  import type { TimelineMilestone } from '$lib/api/types';
  import { onMount } from 'svelte';

  interface ChecklistItem {
    id: string;
    stage: string;
    title: string;
    description: string;
    documentsNeeded: string[];
    estimatedDays: number;
    completed: boolean;
    sortOrder: number;
  }

  interface Checklist {
    id: string;
    items: ChecklistItem[];
  }

  const STAGE_ICONS: Record<string, string> = {
    pre_arras: '📋',
    post_arras: '📑',
    pre_escritura: '📝',
    post_escritura: '🏠',
    arras: '💰',
    mortgage: '🏦',
    notary: '⚖️',
  };

  let milestones: TimelineMilestone[] = [];
  let checklist: Checklist | null = null;
  let loading = true;
  let error: string | null = null;

  function itemsForStage(stage: string): ChecklistItem[] {
    if (!checklist) return [];
    return checklist.items.filter((i) => i.stage === stage);
  }

  function stageProgress(stage: string): number {
    const items = itemsForStage(stage);
    if (items.length === 0) return 0;
    return items.filter((i) => i.completed).length / items.length;
  }

  onMount(async () => {
    try {
      const [tRes, cRes] = await Promise.allSettled([
        apiClient.get<{ milestones: TimelineMilestone[] }>('/api/timeline'),
        apiClient.get<Checklist>('/api/checklist'),
      ]);
      if (tRes.status === 'fulfilled') milestones = tRes.value.milestones;
      if (cRes.status === 'fulfilled') checklist = cRes.value;
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al cargar';
    } finally {
      loading = false;
    }
  });

  async function toggleItem(item: ChecklistItem): Promise<void> {
    if (!checklist) return;
    const newCompleted = !item.completed;
    checklist = {
      ...checklist,
      items: checklist.items.map((i) =>
        i.id === item.id ? { ...i, completed: newCompleted } : i,
      ),
    };
    try {
      await apiClient.patch(`/api/checklist/items/${item.id}`, { completed: newCompleted });
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al actualizar';
      if (checklist) {
        checklist = {
          ...checklist,
          items: checklist.items.map((i) =>
            i.id === item.id ? { ...i, completed: item.completed } : i,
          ),
        };
      }
    }
  }

  $: totalItems = checklist?.items.length ?? 0;
  $: completedItems = checklist?.items.filter((i) => i.completed).length ?? 0;
  $: totalProgress = totalItems > 0 ? completedItems / totalItems : 0;
</script>

<div class="container">
  <h1>Proceso de compra</h1>
  <AIDisclaimer />

  {#if loading}
    <p class="text-muted">Cargando…</p>
  {:else if error}
    <div class="card error"><p>{error}</p></div>
  {:else}
    {#if totalItems > 0}
      <div class="overall-progress">
        <span>Progreso total: {Math.round(totalProgress * 100)}% ({completedItems}/{totalItems})</span>
        <progress value={totalProgress} max="1" />
      </div>
    {/if}

    <div class="timeline">
      {#each milestones as m, i}
        {@const progress = stageProgress(m.stage)}
        {@const items = itemsForStage(m.stage)}
        <div class="milestone">
          <div class="dot" class:done={progress >= 1}>{i + 1}</div>
          <div class="content">
            <div class="stage-header">
              <h3>
                {STAGE_ICONS[m.stage] ?? '📌'}
                {m.title}
              </h3>
              {#if items.length > 0}
                <span class="badge">{Math.round(progress * 100)}%</span>
              {/if}
            </div>
            <p class="duration">{m.estimatedDays} días estimados</p>
            <p class="desc">{m.description}</p>

            {#if items.length > 0}
              <div class="check-items">
                {#each items as item}
                  <label class="check-row" class:done={item.completed}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      on:change={() => toggleItem(item)}
                    />
                    <div class="check-body">
                      <span class="check-title">{item.title}</span>
                      {#if item.description}
                        <span class="check-desc">{item.description}</span>
                      {/if}
                      {#if item.documentsNeeded.length > 0}
                        <span class="check-docs">📄 {item.documentsNeeded.join(', ')}</span>
                      {/if}
                    </div>
                    {#if item.estimatedDays > 0}
                      <span class="days">~{item.estimatedDays}d</span>
                    {/if}
                  </label>
                {/each}
              </div>
            {:else if m.documentsNeeded.length > 0}
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
  .overall-progress {
    background: var(--color-bg-soft);
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .overall-progress progress {
    width: 100%;
    height: 4px;
    border-radius: 2px;
  }
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
    margin-bottom: 1.25rem;
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
  .dot.done {
    background: #16a34a;
  }
  .content {
    background: var(--color-bg-soft);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
  }
  .stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  h3 {
    margin: 0;
    font-size: 1rem;
  }
  .badge {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-bg);
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
  }
  .duration {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0.15rem 0 0.5rem;
  }
  .desc {
    font-size: 0.82rem;
    color: var(--color-text-muted);
    margin: 0 0 0.5rem;
    line-height: 1.4;
  }
  .check-items {
    border-top: 1px solid var(--color-border);
    padding-top: 0.4rem;
    margin-top: 0.4rem;
  }
  .check-row {
    display: grid;
    grid-template-columns: 18px 1fr auto;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0.4rem 0;
    cursor: pointer;
    margin: 0;
  }
  .check-row .check-title {
    font-size: 0.82rem;
  }
  .check-row.done .check-title {
    color: var(--color-text-muted);
  }
  .check-body {
    min-width: 0;
  }
  .check-desc {
    display: block;
    font-size: 0.72rem;
    color: var(--color-text-muted);
    line-height: 1.3;
  }
  .check-docs {
    display: block;
    font-size: 0.7rem;
    color: var(--color-text-muted);
  }
  .days {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    padding-top: 2px;
    flex-shrink: 0;
  }
  details {
    margin-top: 0.4rem;
    font-size: 0.82rem;
  }
  ul {
    margin: 0.4rem 0 0;
    padding-left: 1.25rem;
  }
  .error {
    border-color: var(--color-danger);
  }
  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    margin-top: 2px;
  }
</style>
