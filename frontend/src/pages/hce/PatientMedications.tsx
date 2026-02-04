import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hceService, type Medication } from '@/services/hce.service';
import { getApiErrorMessage } from '@/utils/errors';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const PatientMedicationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => hceService.getPatientById(id!),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: () =>
      hceService.addMedication({
        patientId: id!,
        name: formName,
        dosage: formDosage,
        frequency: formFrequency,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setShowForm(false);
      setFormName('');
      setFormDosage('');
      setFormFrequency('');
      setFormStartDate('');
      setFormEndDate('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: Parameters<typeof hceService.updateMedication>[1] }) =>
      hceService.updateMedication(medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (medicationId: string) => hceService.deleteMedication(medicationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', id] }),
  });

  const medications = patient?.medications ?? [];
  const error = addMutation.error || updateMutation.error;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDosage.trim() || !formFrequency.trim() || !formStartDate) return;
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
          <h1 className="text-3xl font-bold text-medical-gray-900">Medicación</h1>
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
            Añadir medicación
          </button>
        ) : (
          <form onSubmit={handleSubmitNew} className="mb-6 p-4 bg-medical-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-medical-gray-900">Nueva medicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                  placeholder="Ej. Paracetamol"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Dosis *</label>
                <input
                  type="text"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                  placeholder="500mg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Frecuencia *</label>
                <input
                  type="text"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value)}
                  className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                  placeholder="Cada 8 horas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Fecha inicio *</label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-medical-gray-700 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
                />
              </div>
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

        {medications.length === 0 ? (
          <p className="text-medical-gray-500 italic">No hay medicación registrada.</p>
        ) : (
          <ul className="divide-y divide-medical-gray-200">
            {medications.map((m) => (
              <li key={m.id} className="py-4">
                {editingId === m.id ? (
                  <EditMedicationRow
                    medication={m}
                    onSave={(data) => updateMutation.mutate({ medicationId: m.id, data })}
                    onCancel={() => setEditingId(null)}
                    isPending={updateMutation.isPending}
                  />
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-medical-gray-600">
                        {m.dosage} · {m.frequency}
                      </p>
                      <p className="text-xs text-medical-gray-500 mt-1">
                        Desde {new Date(m.startDate).toLocaleDateString('es-ES')}
                        {m.endDate && ` — Hasta ${new Date(m.endDate).toLocaleDateString('es-ES')}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(m.id)}
                        className="p-1.5 text-medical-gray-600 hover:bg-medical-gray-100 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Eliminar esta medicación?')) deleteMutation.mutate(m.id);
                        }}
                        className="p-1.5 text-medical-danger hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function EditMedicationRow({
  medication,
  onSave,
  onCancel,
  isPending,
}: {
  medication: Medication;
  onSave: (data: { name?: string; dosage?: string; frequency?: string; startDate?: string; endDate?: string }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage);
  const [frequency, setFrequency] = useState(medication.frequency);
  const [startDate, setStartDate] = useState(medication.startDate.split('T')[0]);
  const [endDate, setEndDate] = useState(medication.endDate ? medication.endDate.split('T')[0] : '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, dosage, frequency, startDate, endDate: endDate || undefined });
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
          placeholder="Dosis"
          required
        />
        <input
          type="text"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
          placeholder="Frecuencia"
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-3 py-2 border border-medical-gray-300 rounded-lg"
        />
      </div>
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

export default PatientMedicationsPage;
