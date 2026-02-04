import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import followupService, {
  type PostopEvolution,
  type CreateEvolutionDto,
  type CreateDischargePlanDto,
} from '@/services/followup.service';
import planningService from '@/services/planning.service';
import { getApiErrorMessage } from '@/utils/errors';

/** Fecha de hoy en zona local como YYYY-MM-DD (para inputs type="date") */
function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formatea una fecha tipo YYYY-MM-DD en español sin desfase por zona horaria */
function formatEvolutionDate(value: string | Date): string {
  const s = typeof value === 'string' ? value : value.toISOString().slice(0, 10);
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return s;
  const d2 = new Date(y, m - 1, d);
  return d2.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const FollowupPage = () => {
  const { surgeryId } = useParams<{ surgeryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'evolutions' | 'discharge'>('evolutions');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [evolutionForm, setEvolutionForm] = useState<Partial<CreateEvolutionDto>>({
    evolutionDate: getLocalDateString(),
    clinicalNotes: '',
    hasComplications: false,
    complicationsNotes: '',
  });
  const [planForm, setPlanForm] = useState<CreateDischargePlanDto>({
    surgerySummary: '',
    instructions: '',
    medicationsAtDischarge: [],
    followUpAppointments: [],
  });

  const { data: surgery } = useQuery({
    queryKey: ['surgery', surgeryId],
    queryFn: () => planningService.getSurgeryById(surgeryId!),
    enabled: !!surgeryId,
  });

  const { data: evolutions = [], isLoading: loadingEvolutions } = useQuery({
    queryKey: ['followup-evolutions', surgeryId],
    queryFn: () => followupService.getEvolutionsBySurgery(surgeryId!),
    enabled: !!surgeryId,
  });

  const { data: complications = [] } = useQuery({
    queryKey: ['followup-complications', surgeryId],
    queryFn: () => followupService.getComplicationsAlerts(surgeryId!),
    enabled: !!surgeryId,
  });

  const { data: dischargePlan, isLoading: loadingPlan } = useQuery({
    queryKey: ['followup-discharge', surgeryId],
    queryFn: () => followupService.getDischargePlan(surgeryId!),
    enabled: !!surgeryId,
  });

  useEffect(() => {
    if (dischargePlan) {
      setPlanForm({
        surgerySummary: dischargePlan.surgerySummary ?? '',
        instructions: dischargePlan.instructions ?? '',
        customInstructions: dischargePlan.customInstructions ?? undefined,
        medicationsAtDischarge: dischargePlan.medicationsAtDischarge ?? [],
        followUpAppointments: dischargePlan.followUpAppointments ?? [],
      });
    } else {
      setPlanForm({
        surgerySummary: '',
        instructions: '',
        medicationsAtDischarge: [],
        followUpAppointments: [],
      });
    }
  }, [dischargePlan]);

  const createEvolutionMutation = useMutation({
    mutationFn: (dto: CreateEvolutionDto) =>
      followupService.createEvolution({ ...dto, surgeryId: surgeryId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-evolutions', surgeryId] });
      queryClient.invalidateQueries({ queryKey: ['followup-complications', surgeryId] });
      setShowEvolutionForm(false);
      setEvolutionForm({
        evolutionDate: getLocalDateString(),
        clinicalNotes: '',
        hasComplications: false,
        complicationsNotes: '',
      });
    },
  });

  const savePlanMutation = useMutation({
    mutationFn: (dto: CreateDischargePlanDto) =>
      followupService.createOrUpdateDischargePlan(surgeryId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-discharge', surgeryId] });
    },
  });

  const finalizePlanMutation = useMutation({
    mutationFn: () => followupService.finalizeDischargePlan(surgeryId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-discharge', surgeryId] });
    },
  });

  const generatePlanMutation = useMutation({
    mutationFn: () => followupService.generateDischargePlan(surgeryId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-discharge', surgeryId] });
    },
  });

  const handleSubmitEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evolutionForm.evolutionDate) return;
    createEvolutionMutation.mutate({
      surgeryId: surgeryId!,
      evolutionDate: evolutionForm.evolutionDate,
      clinicalNotes: evolutionForm.clinicalNotes,
      vitalSigns: evolutionForm.vitalSigns,
      hasComplications: evolutionForm.hasComplications ?? false,
      complicationsNotes: evolutionForm.complicationsNotes,
      medications: evolutionForm.medications,
    });
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    savePlanMutation.mutate({
      surgerySummary: planForm.surgerySummary || undefined,
      instructions: planForm.instructions || undefined,
      customInstructions: planForm.customInstructions?.length ? planForm.customInstructions : undefined,
      medicationsAtDischarge: planForm.medicationsAtDischarge?.length ? planForm.medicationsAtDischarge : undefined,
      followUpAppointments: planForm.followUpAppointments?.length ? planForm.followUpAppointments : undefined,
    });
  };

  if (!surgeryId) {
    return (
      <div className="card text-center py-8">
        <p className="text-medical-gray-500">ID de cirugía no proporcionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-medical-gray-600 hover:text-medical-primary"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-medical-gray-900">
              Seguimiento postoperatorio
            </h1>
            <p className="text-medical-gray-600 mt-2">
              {surgery?.procedure ?? 'Cirugía'} — Evolución y plan de alta
            </p>
          </div>
        </div>
        <Link
          to={`/planning/surgeries/${surgeryId}`}
          className="btn btn-outline"
        >
          Ver detalle de cirugía
        </Link>
      </div>

      {complications.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Complicaciones registradas</p>
            <p className="text-sm text-amber-700">
              Hay {complications.length} evolución(es) con complicaciones. Revisar notas.
            </p>
          </div>
        </div>
      )}

      <div className="border-b border-medical-gray-200">
        <nav className="flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('evolutions')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'evolutions'
                ? 'border-medical-primary text-medical-primary'
                : 'border-transparent text-medical-gray-500 hover:text-medical-gray-700'
            }`}
          >
            Evolución diaria
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discharge')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'discharge'
                ? 'border-medical-primary text-medical-primary'
                : 'border-transparent text-medical-gray-500 hover:text-medical-gray-700'
            }`}
          >
            Plan de alta
          </button>
        </nav>
      </div>

      {activeTab === 'evolutions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-medical-gray-900">Evoluciones</h2>
            <button
              type="button"
              onClick={() => setShowEvolutionForm(!showEvolutionForm)}
              className="btn btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Nueva evolución
            </button>
          </div>

          {showEvolutionForm && (
            <div className="card">
              <h3 className="font-semibold text-medical-gray-900 mb-4">Registrar evolución</h3>
              <form onSubmit={handleSubmitEvolution} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-medical-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={evolutionForm.evolutionDate ?? ''}
                    onChange={(e) =>
                      setEvolutionForm((p) => ({ ...p, evolutionDate: e.target.value }))
                    }
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-medical-gray-700 mb-1">
                    Notas clínicas
                  </label>
                  <textarea
                    value={evolutionForm.clinicalNotes ?? ''}
                    onChange={(e) =>
                      setEvolutionForm((p) => ({ ...p, clinicalNotes: e.target.value }))
                    }
                    className="input w-full min-h-[100px]"
                    placeholder="Estado general, signos, tratamiento..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasComplications"
                    checked={evolutionForm.hasComplications ?? false}
                    onChange={(e) =>
                      setEvolutionForm((p) => ({ ...p, hasComplications: e.target.checked }))
                    }
                  />
                  <label htmlFor="hasComplications" className="text-sm text-medical-gray-700">
                    Presenta complicaciones
                  </label>
                </div>
                {(evolutionForm.hasComplications ?? false) && (
                  <div>
                    <label className="block text-sm font-medium text-medical-gray-700 mb-1">
                      Notas sobre complicaciones
                    </label>
                    <textarea
                      value={evolutionForm.complicationsNotes ?? ''}
                      onChange={(e) =>
                        setEvolutionForm((p) => ({ ...p, complicationsNotes: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={createEvolutionMutation.isPending}>
                    Guardar evolución
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEvolutionForm(false)}
                    className="btn btn-outline"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {loadingEvolutions ? (
            <div className="card text-center py-8">
              <p className="text-medical-gray-500">Cargando evoluciones...</p>
            </div>
          ) : evolutions.length === 0 ? (
            <div className="card text-center py-8">
              <CalendarDaysIcon className="w-12 h-12 text-medical-gray-300 mx-auto mb-2" />
              <p className="text-medical-gray-500">No hay evoluciones registradas</p>
              <p className="text-sm text-medical-gray-400 mt-1">
                Usa &quot;Nueva evolución&quot; para registrar el seguimiento diario.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evolutions.map((ev: PostopEvolution) => (
                <div
                  key={ev.id}
                  className={`card ${ev.hasComplications ? 'border-l-4 border-amber-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-medical-gray-900">
                        {formatEvolutionDate(ev.evolutionDate)}
                      </p>
                      {ev.clinicalNotes && (
                        <p className="text-medical-gray-600 mt-1 text-sm whitespace-pre-wrap">
                          {ev.clinicalNotes}
                        </p>
                      )}
                      {ev.hasComplications && ev.complicationsNotes && (
                        <p className="text-amber-700 text-sm mt-2 font-medium">
                          Complicaciones: {ev.complicationsNotes}
                        </p>
                      )}
                    </div>
                    {ev.hasComplications && (
                      <span className="shrink-0 px-2 py-1 rounded bg-amber-100 text-amber-800 text-xs">
                        Complicación
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'discharge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-medical-gray-900">Plan de alta</h2>
            <div className="flex gap-2">
              {!dischargePlan && (
                <button
                  type="button"
                  onClick={() => generatePlanMutation.mutate()}
                  className="btn btn-primary flex items-center gap-2"
                  disabled={generatePlanMutation.isPending}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Generar plan de alta
                </button>
              )}
              {dischargePlan && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!surgeryId) return;
                      setDownloadingPdf(true);
                      try {
                        await followupService.downloadDischargePlanPdf(surgeryId);
                      } finally {
                        setDownloadingPdf(false);
                      }
                    }}
                    className="btn btn-secondary flex items-center gap-2"
                    disabled={downloadingPdf}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {downloadingPdf ? 'Descargando…' : 'Descargar PDF'}
                  </button>
                  {dischargePlan.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => finalizePlanMutation.mutate()}
                      className="btn btn-primary flex items-center gap-2"
                      disabled={finalizePlanMutation.isPending}
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Finalizar plan
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {loadingPlan ? (
            <div className="card text-center py-8">
              <p className="text-medical-gray-500">Cargando plan de alta...</p>
            </div>
          ) : !dischargePlan || dischargePlan.status === 'draft' ? (
            <form onSubmit={handleSavePlan} className="card space-y-4">
              <h3 className="text-lg font-semibold text-medical-gray-900">
                {!dischargePlan ? 'Añadir plan de alta' : 'Editar plan de alta'}
              </h3>
              <p className="text-sm text-medical-gray-500">
                {!dischargePlan
                  ? 'Rellena los campos y pulsa "Guardar plan de alta" para crear el plan. También puedes usar el botón "Generar plan de alta" de arriba para crear una plantilla automática.'
                  : 'Modifica los campos y pulsa "Guardar cambios". Cuando esté listo, finaliza el plan.'}
              </p>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Resumen de la cirugía</label>
                <textarea
                  className="input w-full min-h-[80px]"
                  value={planForm.surgerySummary ?? ''}
                  onChange={(e) => setPlanForm((p) => ({ ...p, surgerySummary: e.target.value }))}
                  placeholder="Breve resumen del procedimiento y evolución..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Instrucciones de alta</label>
                <textarea
                  className="input w-full min-h-[80px]"
                  value={planForm.instructions ?? ''}
                  onChange={(e) => setPlanForm((p) => ({ ...p, instructions: e.target.value }))}
                  placeholder="Instrucciones para el paciente al alta..."
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savePlanMutation.isPending}
                >
                  {savePlanMutation.isPending ? 'Guardando…' : dischargePlan ? 'Guardar cambios' : 'Guardar plan de alta'}
                </button>
                {savePlanMutation.isError && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                    {getApiErrorMessage(
                      savePlanMutation.error,
                      'No se pudo guardar. Comprueba los permisos o inténtalo de nuevo.',
                    )}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <div className="card space-y-4">
              <div className="flex items-center gap-2 text-medical-success">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">Plan finalizado</span>
              </div>
              {dischargePlan.surgerySummary && (
                <div>
                  <h3 className="text-sm font-medium text-medical-gray-500 mb-1">Resumen de cirugía</h3>
                  <p className="text-medical-gray-900 whitespace-pre-wrap">
                    {dischargePlan.surgerySummary}
                  </p>
                </div>
              )}
              {dischargePlan.instructions && (
                <div>
                  <h3 className="text-sm font-medium text-medical-gray-500 mb-1">Instrucciones</h3>
                  <p className="text-medical-gray-900 whitespace-pre-wrap">
                    {dischargePlan.instructions}
                  </p>
                </div>
              )}
              {dischargePlan.medicationsAtDischarge && dischargePlan.medicationsAtDischarge.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-medical-gray-500 mb-2">Medicación al alta</h3>
                  <ul className="space-y-1">
                    {dischargePlan.medicationsAtDischarge.map((m, i) => (
                      <li key={i} className="text-medical-gray-900 text-sm">
                        {m.name} — {m.dosage}, {m.frequency}
                        {m.duration && ` · ${m.duration}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dischargePlan.followUpAppointments && dischargePlan.followUpAppointments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-medical-gray-500 mb-2">Citas de seguimiento</h3>
                  <ul className="space-y-1">
                    {dischargePlan.followUpAppointments.map((a, i) => (
                      <li key={i} className="text-medical-gray-900 text-sm">
                        {new Date(a.date).toLocaleDateString('es-ES')} — {a.type}
                        {a.notes && `: ${a.notes}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowupPage;
