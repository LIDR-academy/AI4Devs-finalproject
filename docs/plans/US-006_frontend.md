# Frontend Implementation Plan: US-006 Work Order Task Management

## Overview

Extend **`/work-orders/[id]`** for MecaTrack (US-006): full work order detail with task list, add tasks, status transitions, complete-with-cost modal, running **total amount**, and automatic **Lista para entrega** banner when all tasks are completed. Replaces the US-005 placeholder detail page.

**Architecture principles:** extend `work-orders` feature, React Query mutations with cache updates from PATCH response (`task` + `workOrder`), Spanish UI, read-only mode when OT is not `EN_PROCESO`.

**User story reference:** [`us/US-006-gestion-tareas.md`](../../us/US-006-gestion-tareas.md)

**Prerequisites:** US-005 frontend (`/work-orders/[id]` shell, `workOrdersApi.getById`, `useWorkOrder`) and US-006 backend (task endpoints).

**Out of scope:** delete tasks, revert `COMPLETED`, edit cost after complete, technical notes (US-007), delivery panel (US-008).

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Forms | `react-hook-form` + `zod` (complete modal, add task) |
| Styling | Tailwind CSS |

### Files to add/modify

```
apps/web/src/features/work-orders/
├── components/
│   ├── WorkOrderDetailPage.tsx         # composes header + tasks + banners
│   ├── WorkOrderDetailHeader.tsx       # replaces placeholder; totalAmount
│   ├── ReadyForDeliveryBanner.tsx      # LISTA_PARA_ENTREGA
│   ├── TaskList.tsx
│   ├── TaskRow.tsx
│   ├── TaskStatusBadge.tsx
│   ├── AddTaskForm.tsx
│   └── CompleteTaskModal.tsx
├── hooks/
│   ├── useWorkOrder.ts                 # extend: totalAmount, refetch
│   ├── useAddTask.ts
│   └── useUpdateTask.ts
├── services/
│   └── workOrdersApi.ts                # add addTask, updateTask
├── types/
│   └── work-order.types.ts             # extend task + PATCH response
└── utils/
    ├── workOrderStatusLabel.ts
    ├── taskStatusLabel.ts
    ├── formatCurrency.ts               # CRC display
    └── taskTransitions.ts              # allowed next statuses

apps/web/src/app/work-orders/[id]/page.tsx   # render WorkOrderDetailPage
```

### Routing

| Route | Roles | US-006 scope |
|-------|-------|--------------|
| `/work-orders/[id]` | `ADMIN`, `MECHANIC` | Full interactive detail when `EN_PROCESO`; read-only otherwise |

### Editability rules (UI)

| `workOrder.status` | Add task | Change task status |
|--------------------|----------|-------------------|
| `EN_PROCESO` | Yes | Yes |
| `LISTA_PARA_ENTREGA` | No | No (read-only) |
| `ENTREGADA` | No | No (read-only) |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-006-frontend`
- **Base:** US-005 frontend merged.
- `git checkout -b feature/US-006-frontend`

---

### Step 1: Extend Types

- **File:** `apps/web/src/features/work-orders/types/work-order.types.ts`

```typescript
export interface WorkOrderTaskDetail {
  id: string;
  description: string;
  status: WorkOrderTaskStatus;
  cost: number | null;
  costNotes: string | null;
  sortOrder: number;
  completedAt?: string | null;
}

export interface WorkOrderDetail {
  // ... US-005 fields
  totalAmount: number;
  updatedAt: string;
  tasks: WorkOrderTaskDetail[];
  assignedMechanic?: { id: string; fullName: string } | null;
}

export interface UpdateTaskRequest {
  status: WorkOrderTaskStatus;
  cost?: number;
  costNotes?: string;
}

export interface UpdateTaskResponse {
  task: WorkOrderTaskDetail;
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    totalAmount: number;
    updatedAt: string;
  };
}
```

---

### Step 2: Extend `workOrdersApi`

```typescript
export const workOrdersApi = {
  // ... existing
  addTask(workOrderId: string, description: string): Promise<WorkOrderTaskDetail>;
  updateTask(
    workOrderId: string,
    taskId: string,
    data: UpdateTaskRequest,
  ): Promise<UpdateTaskResponse>;
};
```

| Method | Endpoint |
|--------|----------|
| `addTask` | `POST /work-orders/:workOrderId/tasks` |
| `updateTask` | `PATCH /work-orders/:workOrderId/tasks/:taskId` |

---

### Step 3: Task Transition Utilities

- **File:** `taskTransitions.ts`

```typescript
export function getAllowedNextStatuses(
  current: WorkOrderTaskStatus,
): WorkOrderTaskStatus[]
```

| Current | Allowed |
|---------|---------|
| `PENDING` | `IN_PROGRESS`, `COMPLETED` |
| `IN_PROGRESS` | `COMPLETED` |
| `COMPLETED` | *(none)* |

- **File:** `taskStatusLabel.ts` — Pendiente / En progreso / Completada

---

### Step 4: `formatCurrency` Utility

```typescript
export function formatCurrency(amount: number): string {
  // MVP: colones CRC — e.g. "₡85,000"
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(amount);
}
```

---

### Step 5: React Query Hooks

#### `useAddTask.ts`

```typescript
export function useAddTask(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) =>
      workOrdersApi.addTask(workOrderId, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders', workOrderId] });
    },
  });
}
```

#### `useUpdateTask.ts`

```typescript
export function useUpdateTask(workOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      workOrdersApi.updateTask(workOrderId, taskId, data),
    onSuccess: (response) => {
      // Optimistic merge or invalidate
      queryClient.setQueryData(['work-orders', workOrderId], (old: WorkOrderDetail) =>
        old
          ? {
              ...old,
              status: response.workOrder.status,
              totalAmount: response.workOrder.totalAmount,
              updatedAt: response.workOrder.updatedAt,
              tasks: old.tasks.map((t) =>
                t.id === response.task.id ? response.task : t,
              ),
            }
          : old,
      );
    },
  });
}
```

- Refetch on `403`/`409` to resync concurrent edits.

---

### Step 6: `WorkOrderDetailHeader` Component

- Display:
  - Vehicle: plate, brand/model
  - Owner: name + `nationalId`
  - `entryReason`, `mileage`, `checkedInAt` (formatted locale `es-CR`)
  - Assigned mechanic name or *"Sin asignar"*
  - `WorkOrderStatusBadge`
  - **Monto total:** `formatCurrency(totalAmount)` — prominent
- Link **Ver vehículo** → `/vehicles/[vehicleId]`

---

### Step 7: `ReadyForDeliveryBanner` Component

- Visible when `status === 'LISTA_PARA_ENTREGA'`.
- Message: *"Lista para entrega — todas las tareas están completadas."*
- Info styling (not error); tasks section below becomes read-only.
- **US-008 prep:** Admin may later see this OT in delivery panel.

---

### Step 8: `TaskStatusBadge` and `TaskRow`

#### `TaskRow.tsx`

- Columns: description, `TaskStatusBadge`, cost (if `COMPLETED`), `costNotes` (truncated).
- **Actions** (only if WO `EN_PROCESO` and task not `COMPLETED`):
  - `PENDING` → button **Iniciar** (`IN_PROGRESS`) or **Completar** (opens modal)
  - `IN_PROGRESS` → **Completar** (opens modal)
- `COMPLETED` rows: no action buttons; cost shown with `formatCurrency`.

#### `TaskList.tsx`

- Sort tasks by `sortOrder`, then `createdAt`.
- Renders list of `TaskRow`.
- Empty state (should not happen post US-005): *"Sin tareas"*.

---

### Step 9: `AddTaskForm` Component

- Inline expandable section or modal at bottom of task list.
- Visible only when `workOrder.status === 'EN_PROCESO'`.
- Single field: description (3–300 chars).
- **Agregar tarea** button; clears on success.
- `403` → toast *"La orden ya no admite cambios"* + refetch.

---

### Step 10: `CompleteTaskModal` Component

```typescript
export function CompleteTaskModal({
  open,
  onOpenChange,
  task,
  onConfirm,
  isPending,
}: CompleteTaskModalProps): JSX.Element
```

| Field | Validation |
|-------|------------|
| `cost` | required, number ≥ 0, max 2 decimals |
| `costNotes` | optional, max 500 chars |

- Title: *"Completar tarea"*
- Show task description read-only.
- Submit → `updateTask({ status: 'COMPLETED', cost, costNotes })`.
- On success: close modal; if `workOrder.status` became `LISTA_PARA_ENTREGA`, banner appears.

- **Shortcut:** From `PENDING`, **Completar** opens same modal (skip `IN_PROGRESS`).

---

### Step 11: `WorkOrderDetailPage` Component

- **File:** composes all sections; replaces `WorkOrderDetailPlaceholder`.
- `useWorkOrder(id)` — loading, error, 404.
- `isEditable = workOrder.status === 'EN_PROCESO'`.
- Structure:

```
WorkOrderDetailHeader
ReadyForDeliveryBanner (if LISTA_PARA_ENTREGA)
TaskList
AddTaskForm (if editable)
```

- Remove US-005 placeholder message about future task management.

---

### Step 12: Update `/work-orders/[id]/page.tsx`

```typescript
export default function WorkOrderDetailRoute({ params }: { params: { id: string } }) {
  return <WorkOrderDetailPage workOrderId={params.id} />;
}
```

---

### Step 13: E2E Tests

- **File:** `apps/web/e2e/work-order-tasks.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Open OT with 2 tasks | Both listed |
| 2 | Add third task | Appears as Pendiente |
| 3 | Start task → In progress | Badge updates |
| 4 | Complete task with cost | Cost shown; total updates |
| 5 | Complete all tasks | Banner *Lista para entrega*; add disabled |
| 6 | Complete without cost | Modal validation error |
| 7 | Try add task on LISTA_PARA_ENTREGA | Button hidden / 403 handled |

- **Setup:** Create OT via API or extend work-orders E2E from US-005.

---

### Step 14: Update Technical Documentation

1. Document task state machine in `apps/web/README.md`.
2. Note read-only modes for closed OT states.
3. Document `formatCurrency` convention (CRC).
4. Remove US-005 placeholder note from docs.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — API extensions
4. Step 3–4 — Utilities (transitions, labels, currency)
5. Step 5 — Hooks
6. Step 6 — `WorkOrderDetailHeader`
7. Step 7 — `ReadyForDeliveryBanner`
8. Step 8 — `TaskList` / `TaskRow` / `TaskStatusBadge`
9. Step 9 — `AddTaskForm`
10. Step 10 — `CompleteTaskModal`
11. Step 11–12 — `WorkOrderDetailPage` + route
12. Step 13 — E2E
13. Step 14 — Documentation

---

## Testing Checklist

- [ ] Header shows `totalAmount` and updates after complete
- [ ] Tasks sorted by `sortOrder`
- [ ] Add task only when `EN_PROCESO`
- [ ] Transitions: PENDING→IN_PROGRESS, IN_PROGRESS→COMPLETED, PENDING→COMPLETED
- [ ] Complete modal requires cost ≥ 0
- [ ] `costNotes` optional and displayed when present
- [ ] All tasks complete → OT status banner *Lista para entrega*
- [ ] `LISTA_PARA_ENTREGA`: read-only tasks, no add
- [ ] `409` on re-complete handled gracefully
- [ ] `403` on closed OT shows message
- [ ] CRC formatting correct
- [ ] ADMIN and MECHANIC can manage tasks
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `400` | Validación / transición inválida / costo requerido |
| `403` | *Esta orden ya no admite cambios en las tareas* |
| `404` | OT o tarea no encontrada |
| `409` | *La tarea ya está completada* |

- After mutation errors on closed OT: `queryClient.invalidateQueries(['work-orders', id])`.

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Total amount** | Prominent in header; updates live after each complete |
| **Complete flow** | Modal confirmation with cost — deliberate action |
| **Read-only** | Visual distinction when OT closed (muted actions, banner) |
| **Language** | Spanish status labels |
| **Currency** | CRC; integers OK for MVP display |
| **Accessibility** | Modal focus trap; table headers; action buttons labeled |
| **Concurrency** | Refetch/invalidate after mutations; use `updatedAt` if optimistic conflicts |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-005 `useWorkOrder`, `/work-orders/[id]` route | Base detail page |
| US-006 backend task endpoints | Mutations |
| `react-hook-form`, `zod` | Complete modal, add task |
| `@tanstack/react-query` | Cache updates |

---

## Notes

- **US-007:** Add technical notes section per task on same page (editable when not `COMPLETED`).
- **US-008:** `LISTA_PARA_ENTREGA` OTs appear in admin delivery panel.
- **No delete:** Remove button not shown in MVP.
- **Shared workshop:** Any mechanic can edit any in-progress OT.
- **Branch:** `feature/US-006-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-007 (technical notes on same detail page)
2. Manual QA: 2 tasks → partial complete → full complete → banner
3. Merge after US-006 backend integrated

---

## Implementation Verification

### Code Quality

- [ ] Replace US-005 placeholder entirely
- [ ] Task transitions centralized in `taskTransitions.ts`
- [ ] PATCH response updates cache without full page reload

### Functionality

- [ ] Full task lifecycle through `LISTA_PARA_ENTREGA`
- [ ] Read-only enforcement matches OT status

### Testing

- [ ] E2E multi-task completion flow

### Integration

- [ ] Ready for US-007 notes section
- [ ] Ready for US-008 delivery panel data

### Documentation

- [ ] Step 14 complete
