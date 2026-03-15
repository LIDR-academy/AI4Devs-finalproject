import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService, SurgeryType, type CreateSurgeryDto } from '@/services/planning.service';
import { hceService } from '@/services/hce.service';
import { operatingRoomService } from '@/services/operating-room.service';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getApiErrorMessage } from '@/utils/errors';

const surgerySchema = z
  .object({
    patientId: z.string().uuid('Debe ser un UUID válido'),
    procedure: z.string().min(3, 'El procedimiento debe tener al menos 3 caracteres'),
    type: z.nativeEnum(SurgeryType, { required_error: 'El tipo de cirugía es requerido' }),
    scheduledDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    operatingRoomId: z.string().uuid('Debe ser un UUID válido').optional().or(z.literal('')).nullable(),
    preopNotes: z.string().optional(),
    riskScores: z
      .object({
        asa: z.number().min(1).max(6).optional(),
        possum: z.number().min(0).optional(),
        custom: z.number().optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    },
    { message: 'La hora de fin debe ser posterior a la de inicio', path: ['endTime'] },
  );

type SurgeryFormData = z.infer<typeof surgerySchema>;

const SurgeryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SurgeryFormData>({
    resolver: zodResolver(surgerySchema),
  });

  // Cargar pacientes para el selector
  const { data: patientsData } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => hceService.getPatients({}),
  });

  // Cargar quirófanos para el selector
  const { data: operatingRoomsData } = useQuery({
    queryKey: ['operating-rooms', 'active'],
    queryFn: () => operatingRoomService.getOperatingRooms(true),
  });

  const patients = patientsData?.data || [];
  const operatingRooms = operatingRoomsData || [];

  // Cargar cirugía si estamos editando
  const { data: surgery, isLoading: loadingSurgery } = useQuery({
    queryKey: ['surgery', id],
    queryFn: () => planningService.getSurgeryById(id!),
    enabled: !!id,
  });

  const toDatetimeLocal = (iso: string | undefined): string => {
    if (!iso) return '';
    const date = new Date(iso);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  useEffect(() => {
    if (surgery) {
      reset({
        patientId: surgery.patientId,
        procedure: surgery.procedure,
        type: surgery.type,
        scheduledDate: toDatetimeLocal(surgery.scheduledDate),
        startTime: toDatetimeLocal(surgery.startTime),
        endTime: toDatetimeLocal(surgery.endTime),
        operatingRoomId: surgery.operatingRoomId || '',
        preopNotes: surgery.preopNotes || '',
        riskScores: surgery.riskScores || undefined,
      });
    }
  }, [surgery, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateSurgeryDto) => planningService.createSurgery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', id] });
      navigate('/planning');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateSurgeryDto>) => planningService.updateSurgery(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
      queryClient.invalidateQueries({ queryKey: ['surgery', id] });
      navigate(`/planning/surgeries/${id}`);
    },
  });

  const onSubmit = (data: SurgeryFormData) => {
    const payload: CreateSurgeryDto = {
      ...data,
      patientId: data.patientId,
      procedure: data.procedure,
      type: data.type,
      scheduledDate: data.scheduledDate || undefined,
      startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
      endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
      operatingRoomId: data.operatingRoomId ?? undefined,
      preopNotes: data.preopNotes || undefined,
      riskScores: data.riskScores,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = loadingSurgery || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/planning')}
          className="text-medical-gray-600 hover:text-medical-primary"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            {isEditing ? 'Editar Cirugía' : 'Nueva Cirugía'}
          </h1>
          <p className="text-medical-gray-600 mt-2">
            {isEditing ? 'Actualizar información de la cirugía' : 'Registrar nueva cirugía en el sistema'}
          </p>
        </div>
      </div>

      <div className="card max-w-3xl">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="patientId" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Paciente *
                </label>
                <select
                  id="patientId"
                  {...register('patientId')}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="">Seleccione un paciente</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {new Date(patient.dateOfBirth).toLocaleDateString('es-ES')}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.patientId.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="procedure" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Procedimiento *
                </label>
                <input
                  id="procedure"
                  type="text"
                  {...register('procedure')}
                  className="input"
                  placeholder="Ej: Colecistectomía laparoscópica"
                  disabled={isLoading}
                />
                {errors.procedure && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.procedure.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Tipo de Cirugía *
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="">Seleccione...</option>
                  <option value={SurgeryType.ELECTIVE}>Electiva</option>
                  <option value={SurgeryType.URGENT}>Urgente</option>
                  <option value={SurgeryType.EMERGENCY}>Emergencia</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Fecha Programada
                </label>
                <input
                  id="scheduledDate"
                  type="datetime-local"
                  {...register('scheduledDate')}
                  className="input"
                  disabled={isLoading}
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Hora de inicio (quirófano)
                </label>
                <input
                  id="startTime"
                  type="datetime-local"
                  {...register('startTime')}
                  className="input"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-medical-gray-500">
                  Opcional. Si se indica quirófano, evita conflictos de horario.
                </p>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Hora de fin (quirófano)
                </label>
                <input
                  id="endTime"
                  type="datetime-local"
                  {...register('endTime')}
                  className="input"
                  disabled={isLoading}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.endTime.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="operatingRoomId" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Quirófano
                </label>
                <select
                  id="operatingRoomId"
                  {...register('operatingRoomId')}
                  className="input"
                  disabled={isLoading}
                >
                  <option value="">Seleccione un quirófano</option>
                  {operatingRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} {room.code && `(${room.code})`}
                    </option>
                  ))}
                </select>
                {errors.operatingRoomId && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.operatingRoomId.message}</p>
                )}
                {operatingRooms.length === 0 && (
                  <p className="mt-1 text-sm text-medical-warning">
                    No hay quirófanos disponibles.{' '}
                    <Link
                      to="/planning/operating-rooms/new"
                      className="text-medical-primary hover:underline"
                    >
                      Crear uno
                    </Link>
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="preopNotes" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Notas Preoperatorias
                </label>
                <textarea
                  id="preopNotes"
                  {...register('preopNotes')}
                  className="input"
                  rows={4}
                  placeholder="Notas adicionales sobre el paciente o el procedimiento..."
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="riskScores.asa" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Score ASA
                </label>
                <input
                  id="riskScores.asa"
                  type="number"
                  min="1"
                  max="6"
                  {...register('riskScores.asa', { valueAsNumber: true })}
                  className="input"
                  placeholder="1-6"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="riskScores.possum" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Score POSSUM
                </label>
                <input
                  id="riskScores.possum"
                  type="number"
                  min="0"
                  {...register('riskScores.possum', { valueAsNumber: true })}
                  className="input"
                  placeholder="0+"
                  disabled={isLoading}
                />
              </div>
            </div>

            {(createMutation.error || updateMutation.error) && (
              <div className="bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
                {getApiErrorMessage(
                  createMutation.error || updateMutation.error,
                  isEditing ? 'Error al actualizar la cirugía' : 'Error al crear la cirugía',
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-medical-gray-200">
              <button
                type="button"
                onClick={() => navigate('/planning')}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar Cirugía'
                  : 'Crear Cirugía'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SurgeryFormPage;
