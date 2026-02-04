import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hceService } from '@/services/hce.service';
import { getApiErrorMessage } from '@/utils/errors';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  medicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  currentCondition: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const MedicalHistoryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['medicalHistory', id],
    queryFn: () => hceService.getMedicalHistory(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (history?.medicalRecords?.[0]) {
      const mr = history.medicalRecords[0];
      reset({
        medicalHistory: mr.medicalHistory ?? '',
        familyHistory: mr.familyHistory ?? '',
        currentCondition: mr.currentCondition ?? '',
      });
    }
  }, [history, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      hceService.updateMedicalRecord(id!, {
        medicalHistory: data.medicalHistory || undefined,
        familyHistory: data.familyHistory || undefined,
        currentCondition: data.currentCondition || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalHistory', id] });
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      navigate(`/hce/patients/${id}`);
    },
  });

  if (isLoading || !history) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary" />
      </div>
    );
  }

  const patientName = history.patient
    ? `${history.patient.firstName} ${history.patient.lastName}`
    : 'Paciente';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/hce/patients/${id}`)}
          className="text-medical-gray-600 hover:text-medical-primary"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            Antecedentes médicos
          </h1>
          <p className="text-medical-gray-600 mt-1">{patientName}</p>
        </div>
      </div>

      <div className="card max-w-4xl">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-medical-gray-800 mb-2">
              Antecedentes personales
            </label>
            <textarea
              id="medicalHistory"
              {...register('medicalHistory')}
              rows={5}
              className="w-full px-4 py-2 border-2 border-medical-gray-200 rounded-lg focus:outline-none focus:border-medical-secondary"
              placeholder="Enfermedades previas, cirugías, hábitos, etc."
            />
            {errors.medicalHistory && (
              <p className="mt-1 text-sm text-medical-danger">{errors.medicalHistory.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="familyHistory" className="block text-sm font-medium text-medical-gray-800 mb-2">
              Antecedentes familiares
            </label>
            <textarea
              id="familyHistory"
              {...register('familyHistory')}
              rows={4}
              className="w-full px-4 py-2 border-2 border-medical-gray-200 rounded-lg focus:outline-none focus:border-medical-secondary"
              placeholder="Enfermedades en familiares directos"
            />
            {errors.familyHistory && (
              <p className="mt-1 text-sm text-medical-danger">{errors.familyHistory.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="currentCondition" className="block text-sm font-medium text-medical-gray-800 mb-2">
              Motivo de consulta / Condición actual
            </label>
            <textarea
              id="currentCondition"
              {...register('currentCondition')}
              rows={4}
              className="w-full px-4 py-2 border-2 border-medical-gray-200 rounded-lg focus:outline-none focus:border-medical-secondary"
              placeholder="Descripción del motivo de consulta o estado actual"
            />
            {errors.currentCondition && (
              <p className="mt-1 text-sm text-medical-danger">{errors.currentCondition.message}</p>
            )}
          </div>

          {mutation.error && (
            <div className="bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
              {getApiErrorMessage(mutation.error, 'Error al guardar')}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-medical-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/hce/patients/${id}`)}
              className="btn border-2 border-medical-gray-200 bg-medical-gray-100 text-medical-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar antecedentes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalHistoryFormPage;
