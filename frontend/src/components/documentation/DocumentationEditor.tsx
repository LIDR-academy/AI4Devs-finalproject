import { useState } from 'react';
import { useDocumentation } from '@/hooks/useDocumentation';
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import VoiceInput from './VoiceInput';

// Mapeo explícito pestaña → campo de notas (preop/postop deben ser preoperativeNotes/postoperativeNotes)
const TAB_NOTES_FIELD: Record<'preop' | 'intraop' | 'postop', string> = {
  preop: 'preoperativeNotes',
  intraop: 'intraoperativeNotes',
  postop: 'postoperativeNotes',
};

interface DocumentationEditorProps {
  surgeryId: string;
}

const DocumentationEditor: React.FC<DocumentationEditorProps> = ({ surgeryId }) => {
  const {
    documentation,
    isLoading,
    isConnected,
    isTyping,
    lastSavedAt,
    updateField,
    autoSave,
    updateMutation,
  } = useDocumentation({ surgeryId });

  const [activeTab, setActiveTab] = useState<'preop' | 'intraop' | 'postop'>('intraop');

  const notesFieldName = TAB_NOTES_FIELD[activeTab];

  const handleVoiceResult = (text: string) => {
    if (!documentation) return;
    const doc = documentation as unknown as Record<string, string | undefined>;
    const currentValue = doc[notesFieldName] || '';
    updateField(notesFieldName, currentValue + text);
  };

  const handleTextChange = (field: string, value: string | any) => {
    updateField(field, value);
    if (typeof value === 'string') {
      autoSave({ [field]: value });
    } else {
      autoSave({ [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue-500 mx-auto"></div>
          <p className="mt-4 text-medical-gray-600">Cargando documentación...</p>
        </div>
      </div>
    );
  }

  if (!documentation) {
    return (
      <div className="card text-center py-8">
        <DocumentTextIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
        <p className="text-medical-gray-500">No hay documentación disponible</p>
      </div>
    );
  }

  const getFieldValue = (field: string) => {
    return documentation[field as keyof typeof documentation] || '';
  };

  return (
    <div className="space-y-4">
      {/* Estado de conexión: apilable en móvil, áreas táctiles ≥44px */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              isConnected ? 'bg-medical-success' : 'bg-medical-danger'
            }`}
          />
          <span className="text-sm text-medical-gray-600">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
          {isTyping && (
            <span className="text-sm text-medical-gray-500 italic">
              Otro usuario está escribiendo...
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {lastSavedAt && (
            <div className="flex items-center gap-1 text-xs text-medical-gray-500">
              <ClockIcon className="w-4 h-4 flex-shrink-0" />
              Guardado: {new Date(lastSavedAt).toLocaleTimeString()}
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              updateMutation.mutate({
                preoperativeNotes: documentation.preoperativeNotes,
                intraoperativeNotes: documentation.intraoperativeNotes,
                postoperativeNotes: documentation.postoperativeNotes,
                procedureDetails: documentation.procedureDetails,
              })
            }
            disabled={updateMutation.isPending}
            className="btn btn-sm btn-primary min-h-[44px] px-4 touch-manipulation"
          >
            {updateMutation.isPending ? 'Guardando…' : 'Guardar ahora'}
          </button>
        </div>
      </div>

      {/* Tabs: altura táctil ≥44px en móvil/tablet */}
      <div className="border-b border-medical-gray-200 -mx-1 px-1 overflow-x-auto">
        <nav className="flex gap-1 sm:gap-4 min-w-0">
          {[
            { id: 'preop', label: 'Preoperatorio' },
            { id: 'intraop', label: 'Intraoperatorio' },
            { id: 'postop', label: 'Postoperatorio' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'preop' | 'intraop' | 'postop')}
              className={`flex-shrink-0 min-h-[44px] px-3 sm:px-4 py-2 border-b-2 font-medium text-sm touch-manipulation ${
                activeTab === tab.id
                  ? 'border-medical-primary text-medical-primary'
                  : 'border-transparent text-medical-gray-500 hover:text-medical-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Editor */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-medical-gray-900">
            Notas {activeTab === 'preop' ? 'Preoperatorias' : activeTab === 'intraop' ? 'Intraoperatorias' : 'Postoperatorias'}
          </h3>
          <div className="flex items-center gap-2 min-h-[44px]">
            <VoiceInput
              onResult={handleVoiceResult}
              showRecordingLabel={true}
            />
          </div>
        </div>

        <textarea
          value={getFieldValue(notesFieldName) as string}
          onChange={(e) => handleTextChange(notesFieldName, e.target.value)}
          placeholder={`Escribe las notas ${activeTab === 'preop' ? 'preoperatorias' : activeTab === 'intraop' ? 'intraoperatorias' : 'postoperatorias'} aquí...`}
          className="w-full min-h-[12rem] md:min-h-[24rem] p-4 text-base border border-medical-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent resize-y touch-manipulation"
          style={{ minHeight: 'clamp(12rem, 40vh, 28rem)' }}
        />

        </div>

      {/* Detalles del procedimiento: una columna en móvil */}
      {activeTab === 'intraop' && (
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-medical-gray-900 mb-4">
            Detalles del Procedimiento
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-medical-gray-700 mb-1">
                Tipo de Anestesia
              </label>
              <input
                type="text"
                value={documentation.procedureDetails?.anesthesiaType || ''}
                onChange={(e) =>
                  handleTextChange('procedureDetails', {
                    ...documentation.procedureDetails,
                    anesthesiaType: e.target.value,
                  })
                }
                className="input w-full"
                placeholder="Ej: General, Regional, Local"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-medical-gray-700 mb-1">
                Pérdida de Sangre (ml)
              </label>
              <input
                type="number"
                value={documentation.procedureDetails?.bloodLoss || ''}
                onChange={(e) => {
                  const updated = {
                    ...documentation.procedureDetails,
                    bloodLoss: parseInt(e.target.value) || 0,
                  };
                  updateField('procedureDetails', updated);
                  autoSave({ procedureDetails: updated });
                }}
                className="input w-full"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-medical-gray-600">Estado:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              documentation.status === 'completed'
                ? 'bg-medical-success/10 text-medical-success'
                : documentation.status === 'in_progress'
                ? 'bg-medical-warning/10 text-medical-warning'
                : 'bg-medical-gray-100 text-medical-gray-700'
            }`}
          >
            {documentation.status === 'completed'
              ? 'Completada'
              : documentation.status === 'in_progress'
              ? 'En Progreso'
              : 'Borrador'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentationEditor;
