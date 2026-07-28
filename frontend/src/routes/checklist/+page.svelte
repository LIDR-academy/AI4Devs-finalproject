<script lang="ts">
  import { apiClient, ApiError } from '$lib/api/client';
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

  const STAGE_LABELS: Record<string, string> = {
    pre_arras: 'Antes de las arras',
    post_arras: 'Después de las arras',
    pre_escritura: 'Antes de la escritura',
    post_escritura: 'Después de la escritura',
    arras: 'Contrato de arras',
    mortgage: 'Hipoteca',
    notary: 'Notaría',
  };

  const STAGE_ICONS: Record<string, string> = {
    pre_arras: '📋',
    post_arras: '✍️',
    pre_escritura: '📑',
    post_escritura: '🏠',
    arras: '💰',
    mortgage: '🏦',
    notary: '⚖️',
  };

  let checklist: Checklist | null = null;
  let loading = true;
  let error: string | null = null;

  $: groupedItems = (() => {
    if (!checklist) return [];
    const groups: Record<string, ChecklistItem[]> = {};
    for (const item of checklist.items) {
      (groups[item.stage] ??= []).push(item);
    }
    return Object.entries(groups)
      .map(([stage, items]) => ({
        stage,
        label: STAGE_LABELS[stage] ?? stage.replace(/_/g, ' '),
        items,
        progress: items.filter((i) => i.completed).length / items.length,
      }))
      .sort((a, b) => a.stage.localeCompare(b.stage));
  })();

  onMount(async () => {
    try {
      checklist = await apiClient.get<Checklist>('/api/checklist');
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        error = 'No tienes un checklist activo. Analiza un anuncio primero para crear tu proceso.';
      } else {
        error = e instanceof ApiError ? e.message : 'Error al cargar';
      }
    } finally {
      loading = false;
    }
  });

  async function toggleItem(item: ChecklistItem): Promise<void> {
    try {
      const updated = await apiClient.patch<ChecklistItem>(`/api/checklist/items/${item.id}`, {
        completed: !item.completed,
      });
      if (checklist) {
        checklist = {
          ...checklist,
          items: checklist.items.map((i) => (i.id === updated.id ? updated : i)),
        };
      }
    } catch (e) {
      error = e instanceof ApiError ? e.message : 'Error al actualizar';
    }
  }
</script>

<div class="container">
  <h1>Checklist documental</h1>

  {#if loading}
    <p class="text-muted">Cargando…</p>
  {:else if error}
    <div class="card error">
      <p>{error}</p>
    </div>
  {:else if checklist}
    {#each groupedItems as group}
      <section class="card">
        <div class="stage-header">
          <h2>{STAGE_ICONS[group.stage] ?? '📌'} {group.label}</h2>
          <span class="badge">{Math.round(group.progress * 100)}%</span>
        </div>
        <progress value={group.progress} max="1" />

        <ul>
          {#each group.items as item}
            <li class:completed={item.completed}>
              <label>
                <input
                  type="checkbox"
                  checked={item.completed}
                  on:change={() => toggleItem(item)}
                />
                <div class="item-text">
                  <span class="item-title">{item.title}</span>
                  {#if item.description}
                    <span class="item-desc">{item.description}</span>
                  {/if}
                  {#if item.documentsNeeded.length > 0}
                    <span class="docs">📄 {item.documentsNeeded.join(', ')}</span>
                  {/if}
                </div>
              </label>
              {#if item.estimatedDays > 0}
                <span class="days" title="Duración estimada">~{item.estimatedDays}d</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  .stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
    position: sticky;
    top: 56px;
    background: var(--color-bg);
    z-index: 5;
    padding: 0.5rem 0;
  }
  h2 {
    text-transform: capitalize;
    font-size: 1.05rem;
    margin: 0;
  }
  .badge {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-primary);
    background: var(--color-bg-soft);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
  }
  progress {
    width: 100%;
    height: 4px;
    margin: 0.25rem 0 0.75rem;
    border-radius: 2px;
  }
  progress::-webkit-progress-bar {
    background: var(--color-border);
    border-radius: 2px;
  }
  progress::-webkit-progress-value {
    background: var(--color-primary);
    border-radius: 2px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: flex;
    align-items: flex-start;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--color-border);
    gap: 0.5rem;
  }
  li:last-child {
    border-bottom: none;
  }
  li.completed {
    opacity: 0.6;
  }
  label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1;
    margin: 0;
    cursor: pointer;
  }
  input[type='checkbox'] {
    margin-top: 0.15rem;
    flex-shrink: 0;
  }
  .item-text {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    flex: 1;
  }
  .item-title {
    font-weight: 500;
    font-size: 0.9rem;
  }
  .completed .item-title {
    text-decoration: line-through;
  }
  .item-desc {
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }
  .docs {
    font-size: 0.72rem;
    color: var(--color-text-muted);
  }
  .days {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 0.15rem;
  }
  section {
    margin-bottom: 1rem;
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
