import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ArrowRightIcon,
  ArchiveBoxIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon,
} from '@heroicons/react/24/solid';
import planningService, { Surgery, SurgeryStatus } from '@/services/planning.service';

type ChecklistFilter = 'all' | 'completed' | 'in_progress' | 'not_started';

const statusLabels: Record<SurgeryStatus, string> = {
  [SurgeryStatus.PLANNED]: 'Planificada',
  [SurgeryStatus.SCHEDULED]: 'Programada',
  [SurgeryStatus.IN_PROGRESS]: 'En Progreso',
  [SurgeryStatus.COMPLETED]: 'Completada',
  [SurgeryStatus.CANCELLED]: 'Cancelada',
};

const statusColors: Record<SurgeryStatus, string> = {
  [SurgeryStatus.PLANNED]: 'bg-medical-gray-100 text-medical-gray-800',
  [SurgeryStatus.SCHEDULED]: 'bg-medical-primary/10 text-medical-primary',
  [SurgeryStatus.IN_PROGRESS]: 'bg-medical-warning/10 text-medical-warning',
  [SurgeryStatus.COMPLETED]: 'bg-medical-success/10 text-medical-success',
  [SurgeryStatus.CANCELLED]: 'bg-medical-danger/10 text-medical-danger',
};

const ChecklistListPage = () => {
  const [filter, setFilter] = useState<ChecklistFilter>('all');

  const { data: surgeries, isLoading } = useQuery<Surgery[]>({
    queryKey: ['surgeries'],
    queryFn: () => planningService.getSurgeries(),
  });

  const filteredSurgeries = useMemo(() => {
    const list = Array.isArray(surgeries) ? surgeries.slice() : [];
    if (list.length === 0) return [];
    const isCompleted = (s: Surgery) =>
      s.checklist?.preInductionComplete &&
      s.checklist?.preIncisionComplete &&
      s.checklist?.postProcedureComplete;
    const isInProgress = (s: Surgery) =>
      s.checklist &&
      !isCompleted(s) &&
      (s.checklist.preInductionComplete || s.checklist.preIncisionComplete || s.checklist.postProcedureComplete);
    const isNotStarted = (s: Surgery) => !s.checklist || !s.checklist.checklistData?.preInduction;

    if (filter === 'completed') {
      return list.filter(isCompleted).sort((a, b) => {
        const dateA = a.checklist?.completedAt ? new Date(a.checklist.completedAt).getTime() : 0;
        const dateB = b.checklist?.completedAt ? new Date(b.checklist.completedAt).getTime() : 0;
        return dateB - dateA;
      });
    }
    if (filter === 'in_progress') return list.filter(isInProgress);
    if (filter === 'not_started') return list.filter(isNotStarted);
    return list;
  }, [surgeries, filter]);

  const getChecklistStatus = (surgery: Surgery) => {
    if (!surgery.checklist) {
      return { status: 'not_started', label: 'No iniciado', icon: ClockIcon, color: 'text-medical-gray-400' };
    }

    const checklist = surgery.checklist;
    
    // Verificar si el checklist tiene datos
    const hasData = checklist.checklistData && (
      checklist.checklistData.preInduction ||
      checklist.checklistData.preIncision ||
      checklist.checklistData.postProcedure
    );

    if (!hasData) {
      return { status: 'not_started', label: 'No iniciado', icon: ClockIcon, color: 'text-medical-gray-400' };
    }

    const allComplete =
      checklist.preInductionComplete &&
      checklist.preIncisionComplete &&
      checklist.postProcedureComplete;

    if (allComplete) {
      return {
        status: 'completed',
        label: 'Completado',
        icon: CheckCircleIconSolid,
        color: 'text-green-600',
      };
    }

    const phasesComplete = [
      checklist.preInductionComplete,
      checklist.preIncisionComplete,
      checklist.postProcedureComplete,
    ].filter(Boolean).length;

    if (phasesComplete === 0) {
      return { status: 'not_started', label: 'No iniciado', icon: ClockIcon, color: 'text-medical-gray-400' };
    }

    return {
      status: 'in_progress',
      label: `${phasesComplete}/3 fases`,
      icon: ClockIcon,
      color: 'text-medical-warning',
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue-500 mx-auto"></div>
          <p className="mt-4 text-medical-gray-600">Cargando cirugías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            Checklist Quirúrgico WHO
          </h1>
          <p className="text-medical-gray-600 mt-2">
            Lista de verificación de seguridad quirúrgica para todas las cirugías
          </p>
        </div>
        <Link to="/planning/surgeries/new" className="btn btn-primary flex items-center gap-2 min-h-[44px] touch-manipulation">
          <PlusIcon className="w-5 h-5" />
          Nueva Cirugía
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      {surgeries && surgeries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-medical-gray-500">Total Cirugías</div>
            <div className="text-2xl font-bold text-medical-gray-900 mt-1">
              {surgeries.length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-medical-gray-500">Checklists Completados</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {surgeries.filter(
                (s) =>
                  s.checklist?.preInductionComplete &&
                  s.checklist?.preIncisionComplete &&
                  s.checklist?.postProcedureComplete,
              ).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-medical-gray-500">En Progreso</div>
            <div className="text-2xl font-bold text-medical-warning mt-1">
              {surgeries.filter(
                (s) =>
                  s.checklist &&
                  !(
                    s.checklist.preInductionComplete &&
                    s.checklist.preIncisionComplete &&
                    s.checklist.postProcedureComplete
                  ),
              ).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-medical-gray-500">Sin Checklist</div>
            <div className="text-2xl font-bold text-medical-gray-400 mt-1">
              {surgeries.filter((s) => !s.checklist).length}
            </div>
          </div>
        </div>
      )}

      {/* Filtros / Historial */}
      {surgeries && surgeries.length > 0 && (
        <div className="card">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-medical-gray-600 flex items-center gap-1">
              <ListBulletIcon className="w-4 h-4" />
              Ver:
            </span>
            {(
              [
                { value: 'all' as const, label: 'Todos', count: surgeries.length },
                {
                  value: 'completed' as const,
                  label: 'Historial (completados)',
                  count: surgeries.filter((s) => s.checklist?.preInductionComplete && s.checklist?.preIncisionComplete && s.checklist?.postProcedureComplete).length,
                },
                {
                  value: 'in_progress' as const,
                  label: 'En progreso',
                  count: surgeries.filter((s) => s.checklist && !(s.checklist.preInductionComplete && s.checklist.preIncisionComplete && s.checklist.postProcedureComplete)).length,
                },
                {
                  value: 'not_started' as const,
                  label: 'Sin iniciar',
                  count: surgeries.filter((s) => !s.checklist || !s.checklist.checklistData?.preInduction).length,
                },
              ] as const
            ).map(({ value, label, count }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === value
                    ? 'bg-medical-primary text-white'
                    : 'bg-medical-gray-100 text-medical-gray-700 hover:bg-medical-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          {filter === 'completed' && (
            <p className="text-sm text-medical-gray-500 flex items-center gap-1">
              <ArchiveBoxIcon className="w-4 h-4" />
              Listado ordenado por fecha de completado (más reciente primero).
            </p>
          )}
        </div>
      )}

      {/* Lista de cirugías */}
      {!surgeries || surgeries.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
          <p className="text-medical-gray-500 mb-2">No hay cirugías disponibles</p>
          <p className="text-sm text-medical-gray-400 mb-4">
            Crea una nueva cirugía para comenzar a usar el checklist WHO
          </p>
          <Link to="/planning/surgeries/new" className="btn btn-primary">
            Crear Primera Cirugía
          </Link>
        </div>
      ) : filteredSurgeries.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
          <p className="text-medical-gray-500 mb-2">Ninguna cirugía coincide con el filtro</p>
          <p className="text-sm text-medical-gray-400">
            Cambia el filtro arriba para ver otros estados.
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-bold text-medical-gray-900 mb-4">
            {filter === 'completed' ? 'Historial de checklists completados' : 'Cirugías con Checklist'}
          </h2>
          <div className="space-y-3">
            {filteredSurgeries.map((surgery) => {
              const checklistStatus = getChecklistStatus(surgery);
              const StatusIcon = checklistStatus.icon;

              return (
                <div
                  key={surgery.id}
                  className="flex items-center justify-between p-4 border border-medical-gray-200 rounded-lg hover:border-medical-blue-300 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-medical-gray-900">
                        {surgery.procedure}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${statusColors[surgery.status]}`}
                      >
                        {statusLabels[surgery.status]}
                      </span>
                    </div>
                    {surgery.patient && (
                      <p className="text-sm text-medical-gray-600">
                        Paciente: {surgery.patient.firstName} {surgery.patient.lastName}
                      </p>
                    )}
                    {surgery.scheduledDate && (
                      <p className="text-xs text-medical-gray-500 mt-1">
                        Programada: {new Date(surgery.scheduledDate).toLocaleDateString('es-ES')}
                      </p>
                    )}
                    {checklistStatus.status === 'completed' && surgery.checklist?.completedAt && (
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        Completado el {new Date(surgery.checklist.completedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`flex items-center gap-2 ${checklistStatus.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="text-sm font-medium">{checklistStatus.label}</span>
                      </div>
                    </div>
                    <Link
                      to={`/checklist/${surgery.id}`}
                      className="btn btn-primary flex items-center gap-2 min-h-[44px] touch-manipulation"
                    >
                      Ver Checklist
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistListPage;
