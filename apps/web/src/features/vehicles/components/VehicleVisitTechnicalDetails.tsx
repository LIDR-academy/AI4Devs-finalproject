import { TechnicalNotesField } from '@/features/work-orders/components/TechnicalNotesField';
import type { VehicleVisit } from '../types/vehicle.types';

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

interface VehicleVisitTechnicalDetailsProps {
  visit: VehicleVisit;
}

function hasTaskTechnicalData(
  task: VehicleVisit['tasks'][number],
): boolean {
  return Boolean(
    task.diagnosis ||
      task.repairPerformed ||
      task.partsUsed ||
      task.additionalNotes,
  );
}

function hasVisitTechnicalData(visit: VehicleVisit): boolean {
  const notes = visit.visitNotes ?? {
    visitDiagnosis: null,
    visitRepairSummary: null,
    visitPartsUsed: null,
    visitAdditionalNotes: null,
  };
  const tasks = visit.tasks ?? [];

  return Boolean(
    notes.visitDiagnosis ||
      notes.visitRepairSummary ||
      notes.visitPartsUsed ||
      notes.visitAdditionalNotes ||
      tasks.some(hasTaskTechnicalData),
  );
}

export function VehicleVisitTechnicalDetails({
  visit,
}: VehicleVisitTechnicalDetailsProps) {
  const visitNotes = visit.visitNotes ?? {
    visitDiagnosis: null,
    visitRepairSummary: null,
    visitPartsUsed: null,
    visitAdditionalNotes: null,
  };
  const tasks = visit.tasks ?? [];

  if (!hasVisitTechnicalData({ ...visit, visitNotes, tasks })) {
    return null;
  }

  return (
    <details className="mt-3 border-t border-slate-100 pt-3">
      <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
        Detalle técnico
      </summary>
      <div className="mt-3 space-y-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Visita
          </p>
          {VISIT_FIELDS.map((field) => (
            <TechnicalNotesField
              key={field.key}
              id={`${visit.workOrderId}-${field.key}`}
              name={field.key}
              label={field.label}
              readOnly
              value={visitNotes[field.key]}
            />
          ))}
        </div>

        {tasks
          .filter(hasTaskTechnicalData)
          .map((task) => (
            <div key={task.description} className="space-y-3 rounded-md bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-900">{task.description}</p>
              {TASK_FIELDS.map((field) => (
                <TechnicalNotesField
                  key={`${task.description}-${field.key}`}
                  id={`${visit.workOrderId}-${task.description}-${field.key}`}
                  name={field.key}
                  label={field.label}
                  readOnly
                  value={task[field.key]}
                />
              ))}
            </div>
          ))}
      </div>
    </details>
  );
}
