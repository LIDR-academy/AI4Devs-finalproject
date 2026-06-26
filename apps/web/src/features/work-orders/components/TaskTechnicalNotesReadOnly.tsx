'use client';

import type { TaskTechnicalNotes } from '../types/work-order.types';
import { TechnicalNotesField } from './TechnicalNotesField';

const TASK_NOTE_FIELDS = [
  { label: 'Diagnóstico', key: 'diagnosis' as const },
  { label: 'Reparación / mantenimiento', key: 'repairPerformed' as const },
  { label: 'Repuestos utilizados', key: 'partsUsed' as const },
  { label: 'Observaciones', key: 'additionalNotes' as const },
];

interface TaskTechnicalNotesReadOnlyProps {
  notes: TaskTechnicalNotes;
}

export function TaskTechnicalNotesReadOnly({
  notes,
}: TaskTechnicalNotesReadOnlyProps) {
  return (
    <div className="space-y-3">
      {TASK_NOTE_FIELDS.map((field) => (
        <TechnicalNotesField
          key={field.key}
          id={`readonly-${field.key}`}
          name={field.key}
          label={field.label}
          readOnly
          value={notes[field.key]}
        />
      ))}
    </div>
  );
}
