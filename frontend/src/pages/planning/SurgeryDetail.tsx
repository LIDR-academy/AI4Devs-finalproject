import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, SurgeryStatus, SurgeryType } from '@/services/planning.service';
import { resourcesService } from '@/services/resources.service';
import authService from '@/services/auth.service';
import { ArrowLeftIcon, PencilIcon, ClipboardDocumentCheckIcon, CubeIcon, DocumentTextIcon, CalendarDaysIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

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

  const canEditStatus = user?.roles?.some((role: string) => ['cirujano', 'administrador'].includes(role));
  const availableStatuses = surgery ? getAvailableStatuses(surgery.status) : [];
  const canManageStaff = user?.roles?.some((role: string) => ['cirujano', 'administrador'].includes(role));

  const { data: staffAssignmentsRaw, refetch: refetchStaff } = useQuery({
    queryKey: ['staff-assignments', id],
    queryFn: () => resourcesService.getAssignmentsBySurgery(id!),
    enabled: !!id,
  });
  const staffAssignments = Array.isArray(staffAssignmentsRaw) ? staffAssignmentsRaw : [];

  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('surgeon');
  const addAssignmentMutation = useMutation({
    mutationFn: () =>
      resourcesService.createStaffAssignment({
        surgeryId: id!,
        userId: assignUserId.trim(),
        role: assignRole,
      }),
    onSuccess: () => {
      refetchStaff();
      setAssignUserId('');
    },
  });
  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => resourcesService.removeStaffAssignment(assignmentId),
    onSuccess: () => refetchStaff(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['auth-users'],
    queryFn: () => authService.getUsers(),
    enabled: !!id,
  });

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
        <div className="flex items-center gap-3">
          <Link
            to={`/checklist/${surgery.id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            Checklist WHO
          </Link>
          <Link
            to={`/documentation/surgeries/${surgery.id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <DocumentTextIcon className="w-5 h-5" />
            Documentación
          </Link>
          <Link
            to={`/followup/surgeries/${surgery.id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <CalendarDaysIcon className="w-5 h-5" />
            Seguimiento / Alta
          </Link>
          <Link
            to={`/planning/surgeries/${surgery.id}/3d-viewer`}
            className={`btn flex items-center gap-2 ${
              surgery.planning ? 'btn-outline' : 'btn-outline opacity-75'
            }`}
            title={surgery.planning ? 'Visualizar planificación 3D' : 'Crear planificación para habilitar visualización 3D'}
          >
            <CubeIcon className="w-5 h-5" />
            Visualizador 3D
          </Link>
          <Link
            to={`/planning/surgeries/${surgery.id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Editar
          </Link>
        </div>
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
                  <p className="text-medical-gray-900 mt-1">
                    {surgery.operatingRoom
                      ? [surgery.operatingRoom.name, surgery.operatingRoom.code].filter(Boolean).join(' ')
                      : surgery.operatingRoomId}
                  </p>
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
            <h2 className="text-xl font-bold text-medical-gray-900 mb-4">Personal asignado</h2>
            <p className="text-sm text-medical-gray-500 mb-3">
              Al asignar a un usuario, recibirá una notificación.
            </p>
            {staffAssignments.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {staffAssignments.map((a) => {
                  const u = users.find((x) => x.id === a.userId);
                  const fullName = u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : null;
                  const displayName = fullName || u?.email || `Usuario (${a.userId.slice(0, 8)}…)`;
                  const roleLabel = a.role === 'surgeon' ? 'Cirujano' : a.role === 'nurse' ? 'Enfermería' : a.role === 'anesthetist' ? 'Anestesista' : a.role === 'assistant' ? 'Asistente' : a.role;
                  return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-medical-gray-50 border border-medical-gray-100"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-medical-gray-900">{displayName}</span>
                      <span className="text-xs text-medical-gray-500">{fullName && u?.email ? `${u.email} · ${roleLabel}` : roleLabel}</span>
                    </div>
                    {canManageStaff && (
                      <button
                        type="button"
                        onClick={() => removeAssignmentMutation.mutate(a.id)}
                        disabled={removeAssignmentMutation.isPending}
                        className="p-1 text-medical-danger hover:bg-medical-danger/10 rounded"
                        title="Quitar asignación"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-medical-gray-500 mb-4">Ningún personal asignado aún.</p>
            )}
            {canManageStaff && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (assignUserId) addAssignmentMutation.mutate();
                }}
                className="flex flex-col gap-2"
              >
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="input input-sm"
                  title="Usuario a asignar"
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map((u) => {
                    const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
                    return (
                      <option key={u.id} value={u.id}>
                        {name} ({u.email})
                      </option>
                    );
                  })}
                </select>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="input input-sm"
                >
                  <option value="surgeon">Cirujano</option>
                  <option value="nurse">Enfermería</option>
                  <option value="anesthetist">Anestesista</option>
                  <option value="assistant">Asistente</option>
                  <option value="other">Otro</option>
                </select>
                <button
                  type="submit"
                  disabled={!assignUserId || addAssignmentMutation.isPending}
                  className="btn btn-primary btn-sm flex items-center justify-center gap-2"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  {addAssignmentMutation.isPending ? 'Asignando…' : 'Asignar personal'}
                </button>
                {addAssignmentMutation.error && (
                  <p className="text-xs text-medical-danger">
                    {addAssignmentMutation.error instanceof Error
                      ? addAssignmentMutation.error.message
                      : 'Error al asignar'}
                  </p>
                )}
              </form>
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
