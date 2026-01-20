import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatingRoomService } from '@/services/operating-room.service';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const operatingRoomSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  code: z.string().optional(),
  description: z.string().optional(),
  floor: z.string().optional(),
  building: z.string().optional(),
  isActive: z.boolean().optional(),
  capacity: z.number().min(1).optional(),
  equipment: z
    .object({
      anesthesiaMachine: z.boolean().optional(),
      ventilator: z.boolean().optional(),
      monitoringSystem: z.boolean().optional(),
      surgicalLights: z.number().min(0).optional(),
    })
    .optional(),
});

type OperatingRoomFormData = z.infer<typeof operatingRoomSchema>;

const OperatingRoomFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<OperatingRoomFormData>({
    resolver: zodResolver(operatingRoomSchema),
    defaultValues: {
      isActive: true,
    },
  });

  // Cargar quirófano si estamos editando
  const { data: room, isLoading: loadingRoom } = useQuery({
    queryKey: ['operating-room', id],
    queryFn: () => operatingRoomService.getOperatingRoomById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (room) {
      reset({
        name: room.name,
        code: room.code || '',
        description: room.description || '',
        floor: room.floor || '',
        building: room.building || '',
        isActive: room.isActive,
        capacity: room.capacity || undefined,
        equipment: room.equipment || undefined,
      });
    }
  }, [room, reset]);

  const createMutation = useMutation({
    mutationFn: (data: OperatingRoomFormData) => operatingRoomService.createOperatingRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operating-rooms'] });
      navigate('/planning/operating-rooms');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: OperatingRoomFormData) => operatingRoomService.updateOperatingRoom(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operating-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['operating-room', id] });
      navigate(`/planning/operating-rooms/${id}`);
    },
  });

  const onSubmit = (data: OperatingRoomFormData) => {
    const cleanData: any = {
      ...data,
      code: data.code || undefined,
      description: data.description || undefined,
      floor: data.floor || undefined,
      building: data.building || undefined,
      capacity: data.capacity || undefined,
      equipment: data.equipment || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(cleanData);
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const isLoading = loadingRoom || createMutation.isPending || updateMutation.isPending;
  const isActive = watch('isActive');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/planning/operating-rooms')}
          className="text-medical-gray-600 hover:text-medical-primary"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            {isEditing ? 'Editar Quirófano' : 'Nuevo Quirófano'}
          </h1>
          <p className="text-medical-gray-600 mt-2">
            {isEditing
              ? 'Actualizar información del quirófano'
              : 'Registrar nuevo quirófano en el sistema'}
          </p>
        </div>
      </div>

      <div className="card max-w-3xl">
        {isLoading && isEditing ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="input"
                  placeholder="Ej: Quirófano 1"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Código
                </label>
                <input
                  id="code"
                  type="text"
                  {...register('code')}
                  className="input"
                  placeholder="Ej: Q1"
                  disabled={isLoading}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.code.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Capacidad
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  {...register('capacity', { valueAsNumber: true })}
                  className="input"
                  placeholder="Número de personas"
                  disabled={isLoading}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.capacity.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="building" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Edificio
                </label>
                <input
                  id="building"
                  type="text"
                  {...register('building')}
                  className="input"
                  placeholder="Ej: Edificio Principal"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Piso
                </label>
                <input
                  id="floor"
                  type="text"
                  {...register('floor')}
                  className="input"
                  placeholder="Ej: Planta 2"
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  className="input"
                  rows={3}
                  placeholder="Descripción del quirófano..."
                  disabled={isLoading}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register('isActive')}
                    className="rounded border-medical-gray-300 text-medical-primary focus:ring-medical-primary"
                    disabled={isLoading}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-medical-gray-700">
                    Quirófano activo y disponible
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-medical-gray-900 mb-4">Equipamiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="equipment.anesthesiaMachine"
                      {...register('equipment.anesthesiaMachine')}
                      className="rounded border-medical-gray-300 text-medical-primary focus:ring-medical-primary"
                      disabled={isLoading}
                    />
                    <label htmlFor="equipment.anesthesiaMachine" className="text-sm text-medical-gray-700">
                      Máquina de anestesia
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="equipment.ventilator"
                      {...register('equipment.ventilator')}
                      className="rounded border-medical-gray-300 text-medical-primary focus:ring-medical-primary"
                      disabled={isLoading}
                    />
                    <label htmlFor="equipment.ventilator" className="text-sm text-medical-gray-700">
                      Ventilador
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="equipment.monitoringSystem"
                      {...register('equipment.monitoringSystem')}
                      className="rounded border-medical-gray-300 text-medical-primary focus:ring-medical-primary"
                      disabled={isLoading}
                    />
                    <label htmlFor="equipment.monitoringSystem" className="text-sm text-medical-gray-700">
                      Sistema de monitoreo
                    </label>
                  </div>

                  <div>
                    <label htmlFor="equipment.surgicalLights" className="block text-sm font-medium text-medical-gray-700 mb-1">
                      Luces quirúrgicas
                    </label>
                    <input
                      id="equipment.surgicalLights"
                      type="number"
                      min="0"
                      {...register('equipment.surgicalLights', { valueAsNumber: true })}
                      className="input"
                      placeholder="Número de luces"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {(createMutation.error || updateMutation.error) && (
              <div className="bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : isEditing
                  ? 'Error al actualizar el quirófano'
                  : 'Error al crear el quirófano'}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-medical-gray-200">
              <button
                type="button"
                onClick={() => navigate('/planning/operating-rooms')}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading
                  ? 'Guardando...'
                  : isEditing
                  ? 'Actualizar Quirófano'
                  : 'Crear Quirófano'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OperatingRoomFormPage;
