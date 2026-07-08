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

  let checklist: Checklist | null = null;
  let loading = true;
  let error: string | null = null;

  $: groupedItems = (() => {
    if (!checklist) return [];
    const groups: Record<string, ChecklistItem[]> = {};
    for (const item of checklist.items) {
      (groups[item.stage] ??= []).push(item);
    }
    return Object.entries(groups).map(([stage, items]) => ({
      stage,
      items,
      progress: items.filter((i) => i.completed).length / items.length,
    }));
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
        <h2>{group.stage.replace(/_/g, ' ')}</h2>
        <progress value={group.progress} max="1" />
        <p class="text-muted">
          {Math.round(group.progress * 100)}% completado
        </p>
        <ul>
          {#each group.items as item}
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={item.completed}
                  on:change={() => toggleItem(item)}
                />
                <span class:completed={item.completed}>{item.title}</span>
              </label>
              {#if item.estimatedDays > 0}
                <span class="days">{item.estimatedDays}d</span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  {/if}
</div>

<style>
  h2 {
    text-transform: capitalize;
    font-size: 1.1rem;
  }
  progress {
    width: 100%;
    height: 6px;
    margin: 0.5rem 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
  }
  li {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
  }
  li:last-child {
    border-bottom: none;
  }
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    margin: 0;
    cursor: pointer;
  }
  .completed {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }
  .days {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  section {
    margin-bottom: 1rem;
  }
  .error {
    border-color: var(--color-danger);
  }
</style>
