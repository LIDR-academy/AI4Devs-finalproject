# Frontend Implementation Plan: US-007 Technical Notes (Diagnosis & Repairs)

## Overview

Add **technical documentation UI** to MecaTrack (US-007): optional diagnosis, repair, parts, and notes per **task** and per **visit** (work order) on `/work-orders/[id]`, plus read-only display in vehicle visit history. Editing allowed only while OT is `EN_PROCESO` and task is not `COMPLETED`. Does not block task completion (US-006).

**Architecture principles:** extend `work-orders` feature on existing detail page; explicit **Guardar notas** saves (no autosave in MVP); character counters; Spanish labels; PATCH-only API integration.

**User story reference:** [`us/US-007-diagnosticos-reparaciones.md`](../../us/US-007-diagnosticos-reparaciones.md)

**Prerequisites:** US-006 frontend (`WorkOrderDetailPage`, `TaskRow`, `useWorkOrder`) and US-007 backend (technical-notes PATCH endpoints).

**Out of scope:** parts catalog, attachments/photos, edit notes after task complete, autosave debounce (optional later).

---

## Architecture Context

### Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ App Router |
| Server state | React Query |
| Forms | `react-hook-form` + `zod` (per-task and visit forms) |
| Styling | Tailwind CSS |

### Files to add/modify

```
apps/web/src/features/work-orders/
├── components/
│   ├── TaskTechnicalNotesSection.tsx    # expandable wrapper per TaskRow
│   ├── TaskTechnicalNotesForm.tsx
│   ├── TaskTechnicalNotesReadOnly.tsx
│   ├── WorkOrderVisitNotesForm.tsx
│   ├── TechnicalNotesField.tsx          # textarea + char counter (shared)
│   └── WorkOrderDetailPage.tsx          # add visit notes block
├── hooks/
│   ├── useTaskTechnicalNotes.ts
│   └── useVisitNotes.ts
├── services/
│   └── workOrdersApi.ts                 # patchTaskTechnicalNotes, patchVisitNotes
├── types/
│   └── work-order.types.ts              # technical field types
└── utils/
    └── technicalNotesSchema.ts          # zod, max 5000 chars

apps/web/src/features/vehicles/
└── components/VehicleVisitHistory.tsx   # expand visits with technical notes (read-only)
```

### Surfaces

| Surface | Mode | US |
|---------|------|-----|
| `/work-orders/[id]` — visit notes | Edit if `EN_PROCESO`; else read-only | US-007 |
| `/work-orders/[id]` — per task | Edit if task not `COMPLETED` and OT `EN_PROCESO` | US-007 |
| `/vehicles/[id]` — history | Read-only display | US-007 + US-009 prep |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Branch naming (required):** `feature/US-007-frontend`
- **Base:** US-006 frontend merged.
- `git checkout -b feature/US-007-frontend`

---

### Step 1: Extend Types

- **File:** `work-order.types.ts`

```typescript
export interface TaskTechnicalNotes {
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}

export interface VisitNotes {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
}

export interface UpdateTaskTechnicalNotesRequest {
  diagnosis?: string | null;
  repairPerformed?: string | null;
  partsUsed?: string | null;
  additionalNotes?: string | null;
}

export type UpdateVisitNotesRequest = VisitNotes;
```

- Extend `WorkOrderTaskDetail` and `WorkOrderDetail` with these fields.

---

### Step 2: Extend `workOrdersApi`

```typescript
export const workOrdersApi = {
  // ... existing
  patchTaskTechnicalNotes(
    workOrderId: string,
    taskId: string,
    data: UpdateTaskTechnicalNotesRequest,
  ): Promise<WorkOrderTaskDetail>;

  patchVisitNotes(
    workOrderId: string,
    data: UpdateVisitNotesRequest,
  ): Promise<VisitNotes & { id: string }>;
};
```

| Method | Endpoint |
|--------|----------|
| `patchTaskTechnicalNotes` | `PATCH /work-orders/:workOrderId/tasks/:taskId/technical-notes` |
| `patchVisitNotes` | `PATCH /work-orders/:workOrderId/visit-notes` |

- `GET /work-orders/:id` already returns fields after backend US-007 — ensure types match.

---

### Step 3: Validation Schema

- **File:** `technicalNotesSchema.ts`

```typescript
const noteField = z.string().max(5000).optional().nullable();

export const taskTechnicalNotesSchema = z.object({
  diagnosis: noteField,
  repairPerformed: noteField,
  partsUsed: noteField,
  additionalNotes: noteField,
});

export const visitNotesSchema = z.object({
  visitDiagnosis: noteField,
  visitRepairSummary: noteField,
  visitPartsUsed: noteField,
  visitAdditionalNotes: noteField,
});
```

- Empty strings normalized to `null` on submit.

---

### Step 4: `TechnicalNotesField` Component

```typescript
export function TechnicalNotesField({
  label,
  name,
  register,
  error,
  maxLength = 5000,
  readOnly,
}: TechnicalNotesFieldProps): JSX.Element
```

- Textarea with character counter `{value.length} / 5000`.
- `readOnly` renders plain text or *"Sin registro"* if empty.

---

### Step 5: React Query Hooks

#### `useTaskTechnicalNotes.ts`

```typescript
export function useTaskTechnicalNotes(workOrderId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskTechnicalNotesRequest) =>
      workOrdersApi.patchTaskTechnicalNotes(workOrderId, taskId, data),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['work-orders', workOrderId], (old: WorkOrderDetail) =>
        old
          ? {
              ...old,
              tasks: old.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t)),
            }
          : old,
      );
    },
  });
}
```

#### `useVisitNotes.ts`

- Same pattern; merge `visit*` fields into `WorkOrderDetail` cache on success.

---

### Step 6: `TaskTechnicalNotesForm` Component

- Four `TechnicalNotesField` inputs (Spanish labels):

| Label | Field |
|-------|-------|
| Diagnóstico | `diagnosis` |
| Reparación / mantenimiento | `repairPerformed` |
| Repuestos utilizados | `partsUsed` |
| Observaciones | `additionalNotes` |

- **Guardar notas** button; disabled while pending or WO not editable.
- Success toast: *"Notas guardadas"*.
- `403` → *"No se pueden editar notas de una tarea completada"* or OT closed message.

---

### Step 7: `TaskTechnicalNotesReadOnly` Component

- Same four fields display-only.
- Empty fields show *"Sin registro"* in muted text.
- Used when `task.status === 'COMPLETED'` or OT not `EN_PROCESO`.

---

### Step 8: `TaskTechnicalNotesSection` Component

- Collapsible **Detalles técnicos** (`<details>` or accordion) inside each `TaskRow`.
- Props: `task`, `workOrderStatus`, `workOrderId`.
- **Editable** if `workOrderStatus === 'EN_PROCESO'` && task.status !== `COMPLETED` → `TaskTechnicalNotesForm` with `defaultValues` from task.
- Else → `TaskTechnicalNotesReadOnly`.

- Integrate into `TaskRow.tsx` or `TaskList.tsx` below task actions row.

---

### Step 9: `WorkOrderVisitNotesForm` Component

- Section **Notas generales de la visita** below `WorkOrderDetailHeader` (or inside header card).
- Fields:

| Label | API field |
|-------|-----------|
| Diagnóstico general | `visitDiagnosis` |
| Resumen de reparación | `visitRepairSummary` |
| Repuestos (visita) | `visitPartsUsed` |
| Observaciones generales | `visitAdditionalNotes` |

- Editable only if `workOrder.status === 'EN_PROCESO'`.
- **Guardar notas de visita** button → `useVisitNotes`.
- Read-only variant when OT `LISTA_PARA_ENTREGA` or `ENTREGADA`.

---

### Step 10: Update `WorkOrderDetailPage`

- Insert `WorkOrderVisitNotesForm` after header, before `ReadyForDeliveryBanner`.
- Ensure `TaskList` renders `TaskTechnicalNotesSection` per task.
- **US-006 regression:** Complete task flow unchanged; technical notes optional.

---

### Step 11: Extend `VehicleVisitHistory` (read-only)

- **File:** `apps/web/src/features/vehicles/components/VehicleVisitHistory.tsx`
- Extend visit card with expandable **Detalle técnico**:
  - `visitNotes` block (four fields)
  - Per task: description + technical fields if present
- All read-only; used on `/vehicles/[id]#historial`.
- Depends on backend `GET /vehicles/:id/history` enriched (US-007 backend).

---

### Step 12: Extend Vehicle History Types

- **File:** `apps/web/src/features/vehicles/types/vehicle.types.ts` (or shared)
- Add `visitNotes` and task technical fields to `VehicleVisit` type aligned with US-009 contract.

---

### Step 13: E2E Tests

- **File:** `apps/web/e2e/technical-notes.spec.ts`

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Save task notes on PENDING task | Toast success; values persist on reload |
| 2 | Complete task without notes | Still works (US-006) |
| 3 | Completed task section read-only | No save button |
| 4 | Save visit notes on EN_PROCESO OT | Persisted |
| 5 | LISTA_PARA_ENTREGA OT | Visit + task notes read-only |
| 6 | Save empty notes | Clears to *Sin registro* |
| 7 | Vehicle history shows saved notes | Read-only expandable |

---

### Step 14: Update Technical Documentation

1. Document technical notes fields and 5000 char limit.
2. Note explicit save vs future autosave.
3. Cross-reference US-009 history display.

---

## Implementation Order

1. Step 0 — Branch
2. Step 1 — Types
3. Step 2 — API methods
4. Step 3 — Zod schemas
5. Step 4 — `TechnicalNotesField`
6. Step 5 — Hooks
7. Step 6–7 — Task form + read-only
8. Step 8 — `TaskTechnicalNotesSection` + integrate in `TaskRow`
9. Step 9 — `WorkOrderVisitNotesForm`
10. Step 10 — `WorkOrderDetailPage` wiring
11. Step 11–12 — Vehicle history display
12. Step 13 — E2E
13. Step 14 — Documentation

---

## Testing Checklist

- [ ] Task notes editable on `PENDING` / `IN_PROGRESS` only
- [ ] Task notes read-only when `COMPLETED`
- [ ] Visit notes editable only when OT `EN_PROCESO`
- [ ] Visit notes read-only when `LISTA_PARA_ENTREGA` / `ENTREGADA`
- [ ] All fields optional; empty save clears values
- [ ] Character counter enforces 5000 max client-side
- [ ] Complete task (US-006) works without filling notes
- [ ] Vehicle history shows technical data read-only
- [ ] `403` errors show Spanish messages
- [ ] ADMIN and MECHANIC access
- [ ] E2E green

---

## Error Handling Patterns

| HTTP | UI message (ES) |
|------|-----------------|
| `400` | Validación / texto demasiado largo |
| `403` | *No se pueden editar las notas en el estado actual de la orden o tarea* |
| `404` | Recurso no encontrado |
| Network | *Error al guardar. Intenta de nuevo.* |

---

## UI/UX Considerations

| Area | Requirement |
|------|-------------|
| **Expandable sections** | *Detalles técnicos* per task — collapsed by default to reduce clutter |
| **Explicit save** | One button per form; loading state on button |
| **Empty state** | *Sin registro* — do not hide field labels |
| **Language** | Spanish labels |
| **Non-blocking** | Notes optional; no warning when completing task without notes |
| **Accessibility** | `aria-expanded` on accordions; labels tied to textareas |
| **Char counter** | Visible below each textarea |

---

## Dependencies

| Dependency | Purpose |
|------------|---------|
| US-006 `WorkOrderDetailPage`, `TaskRow` | Integration surface |
| US-004 `VehicleVisitHistory` | History display |
| US-007 backend PATCH endpoints | Persistence |
| `react-hook-form`, `zod` | Forms |

---

## Notes

- **task-notes module:** Logical name only; all UI lives under `features/work-orders`.
- **US-009:** Will extend client profile history; US-007 updates vehicle visit cards as first pass.
- **Autosave:** Optional enhancement — MVP uses explicit **Guardar notas**.
- **Concurrent edits:** Last save wins; refetch on `403` after OT status change.
- **Branch:** `feature/US-007-frontend`.

---

## Next Steps After Implementation

1. `/plan-frontend-ticket` for US-008 (delivery panel)
2. `/plan-frontend-ticket` for US-009 (full history UX)
3. Verify notes appear in vehicle history after OT delivered

---

## Implementation Verification

### Code Quality

- [ ] Shared `TechnicalNotesField` avoids duplication
- [ ] Schemas match backend 5000 limit
- [ ] Cache updated on PATCH without full refetch

### Functionality

- [ ] Task + visit notes save and display correctly
- [ ] Read-only rules match backend

### Testing

- [ ] US-006 complete flow regression pass
- [ ] E2E notes → complete → history

### Integration

- [ ] Vehicle history shows technical content
- [ ] Ready for US-009 timeline enrichment

### Documentation

- [ ] Step 14 complete
