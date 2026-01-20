import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, SurgeryStatus, SurgeryType } from '@/services/planning.service';
import { ArrowLeftIcon, PencilIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

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

const typeLabels: Record<SurgeryType, string> = {
  [SurgeryType.ELECTIVE]: 'Electiva',
  [SurgeryType.URGENT]: 'Urgente',
  [SurgeryType.EMERGENCY]: 'Emergencia',
};

const SurgeryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: surgery, isLoading, error } = useQuery({
    queryKey: ['surgery', id],
    queryFn: () => planningService.getSurgeryById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: SurgeryStatus) => planningService.updateSurgeryStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgery', id] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
    },
  });

  const handleStatusChange = (newStatus: SurgeryStatus) => {
    if (window.confirm(`¿Cambiar el estado de la cirugía a "${statusLabels[newStatus]}"?`)) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  // Determinar qué estados son posibles según el estado actual
  const getAvailableStatuses = (currentStatus: SurgeryStatus): SurgeryStatus[] => {
    switch (currentStatus) {
      case SurgeryStatus.PLANNED:
        return [SurgeryStatus.SCHEDULED, SurgeryStatus.CANCELLED];
      case SurgeryStatus.SCHEDULED:
        return [SurgeryStatus.IN_PROGRESS, SurgeryStatus.CANCELLED];
      case SurgeryStatus.IN_PROGRESS:
        return [SurgeryStatus.COMPLETED, SurgeryStatus.CANCELLED];
      case SurgeryStatus.COMPLETED:
        return []; // No se puede cambiar desde completada
      case SurgeryStatus.CANCELLED:
        return [SurgeryStatus.PLANNED]; // Se puede reactivar
      default:
        return [];
    }
  };

  const canEditStatus = user?.roles?.some((role) => ['cirujano', 'administrador'].includes(role));
  const availableStatuses = surgery ? getAvailableStatuses(surgery.status) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
          <p className="text-medical-gray-500">Cargando cirugía...</p>
        </div>
      </div>
    );
  }

  if (error || !surgery) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-12">
            <p className="text-medical-danger mb-4">Error al cargar la cirugía</p>
            <Link to="/planning" className="btn btn-primary">
              Volver a la lista
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/planning')}
            className="text-medical-gray-600 hover:text-medical-primary"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-medical-gray-900">{surgery.procedure}</h1>
            <p className="text-medical-gray-600 mt-2">Detalles de la cirugía</p>
          </div>
        </div>
        <Link
          to={`/planning/surgeries/${surgery.id}/edit`}
          className="btn btn-primary flex items-center gap-2"
        >
          <PencilIcon className="w-5 h-5" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información de la Cirugía</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Procedimiento</label>
                <p className="text-medical-gray-900 mt-1 font-medium">{surgery.procedure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Tipo</label>
                <p className="text-medical-gray-900 mt-1">{typeLabels[surgery.type] || surgery.type}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-medical-gray-500 mb-2 block">Estado</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[surgery.status] || statusColors[SurgeryStatus.PLANNED]
                    }`}
                  >
                    {statusLabels[surgery.status] || surgery.status}
                  </span>
                  {canEditStatus && availableStatuses.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-medical-gray-500">Cambiar a:</span>
                      {availableStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          disabled={updateStatusMutation.isPending}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            status === SurgeryStatus.CANCELLED
                              ? 'bg-medical-danger/10 text-medical-danger hover:bg-medical-danger/20'
                              : 'bg-medical-primary/10 text-medical-primary hover:bg-medical-primary/20'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {updateStatusMutation.isPending && (
                  <p className="text-xs text-medical-gray-500 mt-2">Actualizando estado...</p>
                )}
                {updateStatusMutation.error && (
                  <p className="text-xs text-medical-danger mt-2">
                    {updateStatusMutation.error instanceof Error
                      ? updateStatusMutation.error.message
                      : 'Error al actualizar el estado'}
                  </p>
                )}
              </div>
              {surgery.scheduledDate && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Fecha Programada</label>
                  <p className="text-medical-gray-900 mt-1">
                    {new Date(surgery.scheduledDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
              {surgery.startTime && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Hora de Inicio</label>
                  <p className="text-medical-gray-900 mt-1">
                    {new Date(surgery.startTime).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
              {surgery.endTime && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Hora de Finalización</label>
                  <p className="text-medical-gray-900 mt-1">
                    {new Date(surgery.endTime).toLocaleString('es-ES')}
                  </p>
                </div>
              )}
              {surgery.operatingRoomId && (
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Quirófano</label>
                  <p className="text-medical-gray-900 mt-1">{surgery.operatingRoomId}</p>
                </div>
              )}
            </div>
          </div>

          {surgery.preopNotes && (
            <div className="card">
              <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Notas Preoperatorias</h2>
              <p className="text-medical-gray-700 whitespace-pre-wrap">{surgery.preopNotes}</p>
            </div>
          )}

          {surgery.postopNotes && (
            <div className="card">
              <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Notas Postoperatorias</h2>
              <p className="text-medical-gray-700 whitespace-pre-wrap">{surgery.postopNotes}</p>
            </div>
          )}

          {surgery.riskScores && (
            <div className="card">
              <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Scores de Riesgo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {surgery.riskScores.asa !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-medical-gray-500">ASA</label>
                    <p className="text-2xl font-bold text-medical-gray-900 mt-1">
                      {surgery.riskScores.asa}
                    </p>
                  </div>
                )}
                {surgery.riskScores.possum !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-medical-gray-500">POSSUM</label>
                    <p className="text-2xl font-bold text-medical-gray-900 mt-1">
                      {surgery.riskScores.possum}
                    </p>
                  </div>
                )}
                {surgery.riskScores.custom !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-medical-gray-500">Custom</label>
                    <p className="text-2xl font-bold text-medical-gray-900 mt-1">
                      {surgery.riskScores.custom}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Paciente</h2>
            {surgery.patient ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Nombre</label>
                  <p className="text-medical-gray-900 mt-1 font-medium">
                    {surgery.patient.firstName} {surgery.patient.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Fecha de Nacimiento</label>
                  <p className="text-medical-gray-900 mt-1">
                    {new Date(surgery.patient.dateOfBirth).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-medical-gray-500">Género</label>
                  <p className="text-medical-gray-900 mt-1">{surgery.patient.gender}</p>
                </div>
                <Link
                  to={`/hce/patients/${surgery.patientId}`}
                  className="btn btn-outline w-full mt-4"
                >
                  Ver Historia Clínica →
                </Link>
              </div>
            ) : (
              <p className="text-medical-gray-400">Información del paciente no disponible</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Información del Sistema</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-medical-gray-500">ID de la Cirugía</label>
                <p className="text-medical-gray-900 mt-1 font-mono text-sm">{surgery.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Fecha de Creación</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(surgery.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-medical-gray-500">Última Actualización</label>
                <p className="text-medical-gray-900 mt-1">
                  {new Date(surgery.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurgeryDetailPage;
