import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hceService, type Allergy, type AllergySeverity } from '@/services/hce.service';
import { getApiErrorMessage } from '@/utils/errors';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const SEVERITIES: { value: AllergySeverity; label: string }[] = [
  { value: 'Low', label: 'Baja' },
  { value: 'Medium', label: 'Media' },
  { value: 'High', label: 'Alta' },
  { value: 'Critical', label: 'Crítica' },
];

const PatientAllergiesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formAllergen, setFormAllergen] = useState('');
  const [formSeverity, setFormSeverity] = useState<AllergySeverity>('Medium');
  const [formNotes, setFormNotes] = useState('');

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => hceService.getPatientById(id!),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      hceService.addAllergy({
        patientId: id!,
        allergen: formAllergen,
        severity: formSeverity,
        notes: formNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowForm(false);
      setFormAllergen('');
      setFormSeverity('Medium');
      setFormNotes('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ allergyId, data }: { allergyId: string; data: { allergen: string; severity: AllergySeverity; notes?: string } }) =>
      hceService.updateAllergy(allergyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (allergyId: string) => hceService.deleteAllergy(allergyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', id] }),
  });

  const allergies = patient?.allergies ?? [];
  const error = addMutation.error || updateMutation.error;

  const openEdit = (a: Allergy) => {
    setEditingId(a.id);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAllergen.trim()) return;
    addMutation.mutate();
  };

  if (isLoading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary" />
      </div>
    );
  }

  const patientName = `${patient.firstName} ${patient.lastName}`;

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
          <h1 className="text-3xl font-bold text-medical-gray-900">Alergias</h1>
          <p className="text-medical-gray-600 mt-1">{patientName}</p>
        </div>
      </div>

      <div className="card max-w-3xl">
        {error && (
          <div className="mb-4 bg-medical-danger/10 border border-medical-danger text-medical-danger px-4 py-3 rounded-lg">
            {getApiErrorMessage(error, 'Error al guardar')}
          </div>
        )}

        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn btn-primary flex items-center gap-2 mb-6"
          >
            <PlusIcon className="w-5 h-5" />
            Añadir alergia
          </button>
        ) : (
          <form onSubmit={handleSubmitNew} className="mb-6 p-4 bg-medical-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-medical-gray-900">Nueva alergia</h3>
            <div>
              <label className="block text-sm font-medium text-medical-gray-700 mb-1">Alérgeno *</label>
              <input
                type="text"
                value={formAllergen}
                onChange={(e) => setFormAllergen(e.target.value)}
                className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                placeholder="Ej. Penicilina"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-gray-700 mb-1">Severidad</label>
              <select
                value={formSeverity}
                onChange={(e) => setFormSeverity(e.target.value as AllergySeverity)}
                className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-gray-700 mb-1">Notas</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); addMutation.reset(); }}
                className="btn border border-medical-gray-300 bg-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {allergies.length === 0 ? (
          <p className="text-medical-gray-500 italic">No hay alergias registradas.</p>
        ) : (
          <ul className="divide-y divide-medical-gray-200">
            {allergies.map((a) => (
              <li key={a.id} className="py-4 flex flex-col gap-2">
                {editingId === a.id ? (
                  <EditAllergyRow
                    allergy={a}
                    onSave={(data) => updateMutation.mutate({ allergyId: a.id, data })}
                    onCancel={() => setEditingId(null)}
                    isPending={updateMutation.isPending}
                    severities={SEVERITIES}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{a.allergen}</span>
                        <span className="ml-2 text-sm text-medical-gray-600">
                          — {SEVERITIES.find((s) => s.value === a.severity)?.label ?? a.severity}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="p-1.5 text-medical-gray-600 hover:bg-medical-gray-100 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('¿Eliminar esta alergia?')) deleteMutation.mutate(a.id);
                          }}
                          className="p-1.5 text-medical-danger hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {a.notes && <p className="text-sm text-medical-gray-600">{a.notes}</p>}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function EditAllergyRow({
  allergy,
  onSave,
  onCancel,
  isPending,
  severities,
}: {
  allergy: Allergy;
  onSave: (data: { allergen: string; severity: AllergySeverity; notes?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
  severities: { value: AllergySeverity; label: string }[];
}) {
  const [allergen, setAllergen] = useState(allergy.allergen);
  const [severity, setSeverity] = useState<AllergySeverity>(allergy.severity as AllergySeverity);
  const [notes, setNotes] = useState(allergy.notes ?? '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ allergen, severity, notes: notes || undefined });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        value={allergen}
        onChange={(e) => setAllergen(e.target.value)}
        className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
        required
      />
      <select
        value={severity}
        onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
        className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
      >
        {severities.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
        rows={2}
      />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="btn border border-medical-gray-300">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default PatientAllergiesPage;
