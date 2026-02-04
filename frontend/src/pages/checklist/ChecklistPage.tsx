import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import planningService, { Checklist, ChecklistPhase } from '@/services/planning.service';
import { useAuthStore } from '@/store/authStore';

type ChecklistPhaseType = 'preInduction' | 'preIncision' | 'postProcedure';

const phaseLabels: Record<ChecklistPhaseType, { name: string; icon: string; color: string }> = {
  preInduction: {
    name: 'Sign In - Antes de la Inducción',
    icon: '🔵',
    color: 'blue',
  },
  preIncision: {
    name: 'Time Out - Antes de la Incisión',
    icon: '🟡',
    color: 'yellow',
  },
  postProcedure: {
    name: 'Sign Out - Antes de Salir del Quirófano',
    icon: '🟢',
    color: 'green',
  },
};

const ChecklistPage = () => {
  const { surgeryId } = useParams<{ surgeryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activePhase, setActivePhase] = useState<ChecklistPhaseType>('preInduction');

  // Obtener checklist
  const { data: checklist, isLoading } = useQuery<Checklist>({
    queryKey: ['checklist', surgeryId],
    queryFn: () => planningService.getChecklist(surgeryId!),
    enabled: !!surgeryId,
  });

  // Mutación para actualizar ítem
  const updateItemMutation = useMutation({
    mutationFn: ({
      itemId,
      checked,
      notes,
    }: {
      itemId: string;
      checked: boolean;
      notes?: string;
    }) => {
      return planningService.updateChecklistPhase(
        surgeryId!,
        activePhase,
        undefined,
        itemId,
        checked,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['surgeries'] });
    },
  });

  const handleToggleItem = (itemId: string, checked: boolean) => {
    if (!user?.id) {
      console.error('Usuario no autenticado');
      return;
    }
    updateItemMutation.mutate({ itemId, checked });
  };

  const getPhaseCompletion = (phase?: ChecklistPhase): number => {
    if (!phase || !phase.items) return 0;
    const checked = phase.items.filter((item) => item.checked).length;
    return phase.items.length > 0 ? (checked / phase.items.length) * 100 : 0;
  };

  const getOverallCompletion = (): number => {
    if (!checklist) return 0;
    const phases = [
      checklist.checklistData.preInduction,
      checklist.checklistData.preIncision,
      checklist.checklistData.postProcedure,
    ].filter(Boolean) as ChecklistPhase[];
    
    if (phases.length === 0) return 0;
    
    const totalItems = phases.reduce((sum, phase) => sum + (phase.items?.length || 0), 0);
    const checkedItems = phases.reduce(
      (sum, phase) => sum + (phase.items?.filter((item) => item.checked).length || 0),
      0,
    );
    
    return totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  };

  const renderPhase = (phaseKey: ChecklistPhaseType, phaseData?: ChecklistPhase) => {
    const phaseInfo = phaseLabels[phaseKey];
    const completion = getPhaseCompletion(phaseData);
    const isActive = activePhase === phaseKey;
    const isComplete = phaseData?.completed || false;

    return (
      <div
        key={phaseKey}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePhase(phaseKey); } }}
        className={`card cursor-pointer transition-all min-h-[72px] md:min-h-[80px] p-4 md:p-5 touch-manipulation ${
          isActive ? 'ring-2 ring-medical-blue-500' : ''
        } ${isComplete ? 'bg-green-50' : ''}`}
        onClick={() => setActivePhase(phaseKey)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{phaseInfo.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-medical-gray-900">
                {phaseData?.name || phaseInfo.name}
              </h3>
              <p className="text-sm text-medical-gray-500">
                {phaseData?.items?.length || 0} ítems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircleIconSolid className="w-6 h-6 text-green-600" />
            ) : (
              <ClockIcon className="w-6 h-6 text-medical-gray-400" />
            )}
            <span className="text-sm font-medium text-medical-gray-700">
              {Math.round(completion)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-medical-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isComplete ? 'bg-green-600' : 'bg-medical-blue-500'
            }`}
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    );
  };

  const renderActivePhaseContent = () => {
    const phaseData = checklist?.checklistData[activePhase];
    if (!phaseData || !phaseData.items) {
      return (
        <div className="card text-center py-12">
          <p className="text-medical-gray-500">No hay datos disponibles para esta fase</p>
        </div>
      );
    }

    const completion = getPhaseCompletion(phaseData);
    const allChecked = phaseData.items.every((item) => item.checked);

    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-medical-gray-900">
              {phaseData.name}
            </h2>
            <p className="text-sm text-medical-gray-500 mt-1">
              {phaseData.items.filter((item) => item.checked).length} de {phaseData.items.length}{' '}
              ítems completados
            </p>
          </div>
          {allChecked && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIconSolid className="w-6 h-6" />
              <span className="font-semibold">Completada</span>
            </div>
          )}
        </div>

        {!allChecked && completion > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Fase incompleta
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Todos los ítems deben estar marcados para completar esta fase
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {phaseData.items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                item.checked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-medical-gray-200 hover:border-medical-blue-300'
              }`}
            >
              <button
                onClick={() => handleToggleItem(item.id, !item.checked)}
                disabled={updateItemMutation.isPending}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.checked
                    ? 'bg-green-600 border-green-600'
                    : 'border-medical-gray-300 hover:border-medical-blue-500'
                } ${updateItemMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {item.checked && (
                  <CheckCircleIconSolid className="w-4 h-4 text-white" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <label
                    className={`flex-1 cursor-pointer ${
                      item.checked ? 'text-medical-gray-700 line-through' : 'text-medical-gray-900'
                    }`}
                    onClick={() => handleToggleItem(item.id, !item.checked)}
                  >
                    <span className="font-medium mr-2">{index + 1}.</span>
                    {item.text}
                  </label>
                </div>
                {item.checked && item.checkedAt && (
                  <p className="text-xs text-medical-gray-500 mt-2">
                    Completado el {new Date(item.checkedAt).toLocaleString('es-ES')}
                  </p>
                )}
                {item.notes && (
                  <p className="text-sm text-medical-gray-600 mt-2 italic">
                    Nota: {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue-500 mx-auto"></div>
          <p className="mt-4 text-medical-gray-600">Cargando checklist...</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="card text-center py-12">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-medical-gray-500 mb-4">No se pudo cargar el checklist</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-primary min-h-[44px] px-4 touch-manipulation"
        >
          Volver
        </button>
      </div>
    );
  }

  const overallCompletion = getOverallCompletion();
  const allPhasesComplete =
    checklist.preInductionComplete &&
    checklist.preIncisionComplete &&
    checklist.postProcedureComplete;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-gray-900">
            Checklist Quirúrgico WHO
          </h1>
          <p className="text-medical-gray-600 mt-2">
            Lista de verificación de seguridad quirúrgica - {surgeryId?.substring(0, 8)}...
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary min-h-[44px] min-w-[44px] px-4 md:px-5 touch-manipulation"
        >
          Volver
        </button>
      </div>

      {/* Overall Progress */}
      <div className="card bg-gradient-to-r from-medical-blue-50 to-medical-green-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-medical-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-medical-gray-900">
                Progreso General
              </h2>
              <p className="text-sm text-medical-gray-600">
                {allPhasesComplete ? 'Checklist completado' : 'En progreso'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-medical-blue-600">
              {Math.round(overallCompletion)}%
            </div>
            {allPhasesComplete && (
              <p className="text-sm text-green-600 font-medium mt-1">
                ✓ Completado
              </p>
            )}
          </div>
        </div>
        <div className="w-full bg-white rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              allPhasesComplete ? 'bg-green-600' : 'bg-medical-blue-500'
            }`}
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Phase Selector - tablet: tap targets ≥44px */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {renderPhase('preInduction', checklist.checklistData.preInduction)}
        {renderPhase('preIncision', checklist.checklistData.preIncision)}
        {renderPhase('postProcedure', checklist.checklistData.postProcedure)}
      </div>

      {/* Active Phase Content */}
      {renderActivePhaseContent()}

      {/* Completion Status */}
      {allPhasesComplete && checklist.completedAt && (
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircleIconSolid className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">
                Checklist completado exitosamente
              </h3>
              <p className="text-sm text-green-700">
                Finalizado el {new Date(checklist.completedAt).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistPage;
