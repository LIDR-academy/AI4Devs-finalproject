import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const patientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'O'], { required_error: 'El género es requerido' }),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const PatientFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  // Cargar paciente si estamos editando
  const { data: patient, isLoading: loadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => hceService.getPatientById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (patient) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth.split('T')[0], // Formato YYYY-MM-DD
        gender: patient.gender as 'M' | 'F' | 'O',
        email: patient.email || '',
        phone: patient.phone || '',
        address: patient.address || '',
      });
    }
  }, [patient, reset]);

  const createMutation = useMutation({
    mutationFn: (data: PatientFormData) => hceService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      navigate('/hce');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PatientFormData) => hceService.updatePatient(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      navigate('/hce');
    },
  });

  const onSubmit = (data: PatientFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = loadingPatient || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/hce')}
          className="text-medical-gray-600 hover:text-medical-primary"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h1>
          <p className="text-medical-gray-600 mt-2">
            {isEditing ? 'Actualizar información del paciente' : 'Registrar nuevo paciente en el sistema'}
          </p>
        </div>
      </div>

      <div className="card max-w-3xl">
        {loadingPatient ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
            <p className="text-medical-gray-500">Cargando paciente...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className="input"
                  placeholder="Nombre"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className="input"
                  placeholder="Apellido"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className="input"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Género *
                </label>
                <select id="gender" {...register('gender')} className="input">
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input"
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-medical-danger">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-medical-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="input"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-medical-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                id="address"
                {...register('address')}
                className="input"
                rows={3}
                placeholder="Dirección completa"
              />
            </div>

            {(createMutation.error || updateMutation.error) && (
              <div className="bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'Error al guardar el paciente'}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-medical-gray-200">
              <button
                type="button"
                onClick={() => navigate('/hce')}
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
                  ? 'Actualizar Paciente'
                  : 'Crear Paciente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientFormPage;
