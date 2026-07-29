## Original

**KAN-25** — Estilo + maquetación: Goals

Aplicar tokens/componentes de KAN-18 a **Goals**: card de meta anual, barra de progreso y forecast con estética coherente, alineados, sin desbordamiento. WCAG 2.1 AA.

## Enhanced

### Problem

`/goals` still renders a placeholder page, while annual goal UX exists in Home. KAN-25 should deliver a real Goals page shell with tokenized layout and annual-goal presentation aligned with the design system.

### Scope (in)

- Replace Goals placeholder route with a real `GoalsPage`.
- Render annual goal card/progress/forecast in a dedicated Goals layout.
- Use KAN-18 design-system primitives and tokenized CSS.
- Keep annual-goal behavior unchanged (same query/mutation flows via `AnnualGoalCard`).

### Scope (out)

- New forecast business logic.
- Goal history and long-term analytics.
- Backend/API changes.

### Acceptance criteria

1. `/goals` no longer uses placeholder; it shows a dedicated Goals layout.
2. Annual goal card, progress bar, and forecast are visually aligned and tokenized.
3. No horizontal overflow on Goals page.
4. Existing annual goal create/edit/save behavior still works.
5. `npm run build` succeeds in `frontend`.
