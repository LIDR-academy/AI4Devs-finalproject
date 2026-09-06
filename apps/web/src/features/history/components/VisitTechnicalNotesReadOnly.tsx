'use client';

import { TechnicalNotesField } from '@/features/work-orders/components/TechnicalNotesField';
import type { HistoryTask, VisitNotes } from '../types/history.types';

const VISIT_FIELDS = [
  { label: 'Diagnóstico general', key: 'visitDiagnosis' as const },
  { label: 'Resumen de reparación', key: 'visitRepairSummary' as const },
  { label: 'Repuestos (visita)', key: 'visitPartsUsed' as const },
  { label: 'Observaciones generales', key: 'visitAdditionalNotes' as const },
];

const TASK_FIELDS = [
  { label: 'Diagnóstico', key: 'diagnosis' as const },
  { label: 'Reparación / mantenimiento', key: 'repairPerformed' as const },
  { label: 'Repuestos utilizados', key: 'partsUsed' as const },
  { label: 'Observaciones', key: 'additionalNotes' as const },
];

interface VisitTechnicalNotesReadOnlyProps {
  visitNotes: VisitNotes;
  tasks?: HistoryTask[];
  workOrderId: string;
  variant?: 'visit' | 'task';
  task?: HistoryTask;
}

export function VisitTechnicalNotesReadOnly({
  visitNotes,
  tasks = [],
  workOrderId,
  variant = 'visit',
  task,
}: VisitTechnicalNotesReadOnlyProps) {
  if (variant === 'task' && task) {
    return (
      <div className="space-y-3">
        {TASK_FIELDS.map((field) => (
          <TechnicalNotesField
            key={field.key}
            id={`${workOrderId}-${task.id}-${field.key}`}
            name={field.key}
            label={field.label}
            readOnly
            value={task[field.key]}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notas de visita
        </p>
        {VISIT_FIELDS.map((field) => (
          <TechnicalNotesField
            key={field.key}
            id={`${workOrderId}-${field.key}`}
            name={field.key}
            label={field.label}
            readOnly
            value={visitNotes[field.key]}
          />
        ))}
      </div>

      {tasks.map((entry) => (
        <div
          key={entry.id}
          className="space-y-3 rounded-md border border-slate-100 bg-slate-50 p-3"
        >
          <p className="text-sm font-medium text-slate-900">{entry.description}</p>
          <VisitTechnicalNotesReadOnly
            visitNotes={visitNotes}
            workOrderId={workOrderId}
            variant="task"
            task={entry}
          />
        </div>
      ))}
    </div>
  );
}
