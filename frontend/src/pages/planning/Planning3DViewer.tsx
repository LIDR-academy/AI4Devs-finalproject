import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeftIcon, CubeIcon, ChartBarIcon, PlayIcon, MoonIcon, SunIcon, CpuChipIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import DicomViewer3D from '@/components/planning/DicomViewer3D';
import planningService from '@/services/planning.service';
import api from '@/utils/api';

interface ReconstructionData {
  vertices: number[][];
  faces: number[][];
  normals: number[][];
  metadata: {
    bounds: { min: number[]; max: number[] };
    center: number[];
    scale: number;
  };
}

interface AnalysisResult {
  measurements: {
    distance?: number;
    volume?: number;
    area?: number;
    instanceCount?: number;
    estimatedVolume?: number;
  };
  structures: {
    name: string;
    coordinates: number[][];
    type: string;
    properties?: {
      density?: number;
      size?: number;
    };
  }[];
  findings: string[];
  metadata: {
    modality: string;
    studyDate: string;
    seriesDescription?: string;
    patientPosition?: string;
  };
}

// Datos de ejemplo para ver la interfaz sin Orthanc
const DEMO_ANALYSIS: AnalysisResult = {
  measurements: {
    instanceCount: 120,
    estimatedVolume: 157286.4,
    distance: 45.2,
    volume: 125.5,
  },
  structures: [
    { name: 'Hueso', coordinates: [[0, 0, 0], [100, 100, 100]], type: 'bone', properties: { density: 1000 } },
    { name: 'Tejido blando', coordinates: [[50, 50, 50], [150, 150, 150]], type: 'soft_tissue', properties: { density: 40 } },
    { name: 'Vasos principales', coordinates: [[30, 60, 40], [80, 90, 70]], type: 'vessel', properties: { density: 80 } },
  ],
  findings: [
    'Serie completa con alta resolución',
    'Imágenes de tomografía computarizada',
    '120 cortes axiales, espaciado 1 mm',
  ],
  metadata: {
    modality: 'CT',
    studyDate: '2026-01-28',
    seriesDescription: 'Abdomen con contraste',
    patientPosition: 'HFS',
  },
};

const DEMO_RECONSTRUCTION: ReconstructionData = {
  vertices: [[0, 0, 0], [80, 0, 0], [80, 80, 0], [0, 80, 0], [40, 40, 60]],
  faces: [],
  normals: [],
  metadata: {
    bounds: { min: [0, 0, 0], max: [80, 80, 60] },
    center: [40, 40, 30],
    scale: 1.0,
  },
};

const Planning3DViewerPage = () => {
  const { surgeryId } = useParams<{ surgeryId: string }>();
  const navigate = useNavigate();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [reconstructionData, setReconstructionData] = useState<ReconstructionData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [measurement, setMeasurement] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(100);
  const [incisionAngle, setIncisionAngle] = useState(0);

  // Obtener planificación de la cirugía (puede no existir)
  const { data: planning, isLoading: planningLoading } = useQuery({
    queryKey: ['planning', surgeryId],
    queryFn: () => planningService.getPlanningBySurgeryId(surgeryId!),
    enabled: !!surgeryId,
    retry: false, // No reintentar si no existe
  });

  // Mutación para analizar serie DICOM
  const analyzeMutation = useMutation({
    mutationFn: async (seriesId: string) => {
      const response = await api.post<any>(`/planning/dicom/analyze/${seriesId}`);
      return response.data?.data || response.data;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
  });

  // Mutación para generar reconstrucción 3D
  const reconstructMutation = useMutation({
    mutationFn: async (seriesId: string) => {
      const response = await api.post<any>(`/planning/dicom/reconstruct-3d/${seriesId}`);
      return response.data?.data || response.data;
    },
    onSuccess: (data) => {
      setReconstructionData(data);
    },
  });

  const handleAnalyze = () => {
    if (selectedSeriesId) {
      analyzeMutation.mutate(selectedSeriesId);
    }
  };

  const handleReconstruct = () => {
    if (selectedSeriesId) {
      reconstructMutation.mutate(selectedSeriesId);
    }
  };

  const handleMeasurement = (distance: number) => {
    setMeasurement(distance);
  };

  const loadDemo = () => {
    setAnalysisResult(DEMO_ANALYSIS);
    setReconstructionData(DEMO_RECONSTRUCTION);
    setSelectedSeriesId('demo-ejemplo');
  };

  if (planningLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  const themeBg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const themeText = darkMode ? 'text-gray-100' : 'text-gray-900';
  const themeMuted = darkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'card';

  return (
    <div className={`space-y-6 min-h-screen ${themeBg} ${themeText} p-4 md:p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={darkMode ? 'text-gray-400 hover:text-white' : 'text-medical-gray-600 hover:text-medical-primary'}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${themeText}`}>
              Visualizador 3D - Planificación Quirúrgica
            </h1>
            <p className={`mt-2 ${themeMuted}`}>
              Análisis de imágenes DICOM y reconstrucción 3D
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDarkMode((d) => !d)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          {darkMode ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>

      {!planning && (
        <div className={`rounded-lg p-4 flex items-center justify-between gap-4 ${darkMode ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
            Esta cirugía no tiene planificación asociada. Usa <strong>Cargar ejemplo</strong> para probar el visualizador con datos de demostración.
          </p>
          <button
            type="button"
            onClick={loadDemo}
            className="btn btn-primary shrink-0 flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Cargar ejemplo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de control */}
        <div className="lg:col-span-1 space-y-4">
          <div className={`rounded-xl border p-4 ${cardClass}`}>
            <h2 className="text-xl font-bold mb-4">
              Configuración
            </h2>
            
            <div className="space-y-4">
              <div className={`rounded-lg p-3 text-sm ${darkMode ? 'bg-medical-primary/10 border border-medical-primary/30 text-gray-300' : 'bg-medical-primary/5 border border-medical-primary/20 text-medical-gray-700'}`}>
                <p className={`font-medium mb-1 ${darkMode ? 'text-gray-100' : 'text-medical-gray-900'}`}>¿Qué es el ID de Serie DICOM?</p>
                <p>
                  Es el identificador que asigna el servidor de imágenes (Orthanc/PACS) a una <strong>serie</strong> de imágenes médicas.
                  Una serie es un conjunto de cortes de un mismo estudio (por ejemplo, un TAC abdominal con muchas imágenes).
                  Puedes obtener el ID desde Orthanc (panel de administración), desde la HCE del paciente tras sincronizar DICOM, o dejarlo vacío para usar datos de ejemplo.
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-medical-gray-700'}`}>
                  ID de Serie DICOM (opcional)
                </label>
                <input
                  type="text"
                  value={selectedSeriesId}
                  onChange={(e) => setSelectedSeriesId(e.target.value)}
                  placeholder="Ej: abc123-def456 (desde Orthanc o PACS)"
                  className={`input w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                />
                <p className={`text-xs mt-1 ${themeMuted}`}>
                  Si no tienes Orthanc con datos, deja vacío: el visualizador mostrará un modelo de ejemplo.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedSeriesId || analyzeMutation.isPending}
                    className="btn btn-primary flex-1 flex items-center gap-2"
                  >
                    <ChartBarIcon className="w-4 h-4" />
                    Analizar
                  </button>
                  <button
                    onClick={handleReconstruct}
                    disabled={!selectedSeriesId || reconstructMutation.isPending}
                    className="btn btn-secondary flex-1 flex items-center gap-2"
                  >
                    <CubeIcon className="w-4 h-4" />
                    Reconstruir 3D
                  </button>
                </div>
                <button
                  type="button"
                  onClick={loadDemo}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed ${darkMode ? 'border-medical-primary/50 text-medical-primary hover:bg-medical-primary/10' : 'border-medical-primary/50 text-medical-primary hover:bg-medical-primary/5'}`}
                >
                  <PlayIcon className="w-4 h-4" />
                  Cargar ejemplo (ver interfaz sin Orthanc)
                </button>
              </div>
            </div>
          </div>

          {/* Panel de simulación */}
          <div className={`rounded-xl border p-4 ${cardClass}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CpuChipIcon className="w-5 h-5 text-medical-primary" />
              Panel de simulación
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-medical-gray-700'}`}>
                  Velocidad de reproducción: {simulationSpeed}%
                </label>
                <input
                  type="range"
                  min={25}
                  max={200}
                  step={25}
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-medical-primary"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-medical-gray-700'}`}>
                  Ángulo de incisión: {incisionAngle}°
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={incisionAngle}
                  onChange={(e) => setIncisionAngle(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-medical-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed text-sm flex items-center justify-center gap-2"
                  title="Próximamente: reproducir trayectoria planificada"
                >
                  <PlayIcon className="w-4 h-4" />
                  Reproducir trayectoria
                </button>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('dicom-viewer-reset-camera'))}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-500 hover:bg-gray-700 text-sm flex items-center justify-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reiniciar vista
                </button>
              </div>
              <p className={`text-xs ${themeMuted}`}>
                La simulación quirúrgica completa y la reproducción de trayectorias estarán disponibles en una futura versión.
              </p>
            </div>
          </div>

          {/* Resultados del análisis */}
          {analysisResult && (
            <div className={`rounded-xl border p-4 ${cardClass}`}>
              <h2 className="text-xl font-bold mb-4">
                Resultados del Análisis
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-medium ${themeMuted}`}>Modalidad</label>
                  <p className={themeText}>{analysisResult.metadata.modality}</p>
                </div>
                
                {analysisResult.measurements.estimatedVolume && (
                  <div>
                    <label className={`text-sm font-medium ${themeMuted}`}>Volumen Estimado</label>
                    <p className={themeText}>
                      {(analysisResult.measurements.estimatedVolume / 1000).toFixed(2)} cm³
                    </p>
                  </div>
                )}
                
                {analysisResult.structures.length > 0 && (
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${themeMuted}`}>
                      Estructuras Detectadas
                    </label>
                    <ul className="space-y-1">
                      {analysisResult.structures.map((struct, idx) => (
                        <li key={idx} className={`text-sm ${themeMuted}`}>
                          • {struct.name} ({struct.type})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.findings.length > 0 && (
                  <div>
                    <label className={`text-sm font-medium mb-2 block ${themeMuted}`}>
                      Hallazgos
                    </label>
                    <ul className="space-y-1">
                      {analysisResult.findings.map((finding, idx) => (
                        <li key={idx} className={`text-sm ${themeMuted}`}>
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medición */}
          {measurement !== null && (
            <div className={`rounded-xl border p-4 ${darkMode ? 'bg-medical-blue-900/20 border-medical-blue-700' : 'bg-medical-blue-50 border-medical-blue-200'}`}>
              <h3 className={`font-semibold mb-2 ${themeText}`}>Medición</h3>
              <p className="text-2xl font-bold text-medical-primary">
                {measurement.toFixed(2)} mm
              </p>
            </div>
          )}
        </div>

        {/* Visualizador 3D */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="h-[600px] w-full">
              <DicomViewer3D
                seriesId={selectedSeriesId}
                reconstructionData={reconstructionData || undefined}
                onMeasurement={handleMeasurement}
                onClearMeasurement={() => setMeasurement(null)}
                darkMode={darkMode}
              />
            </div>
          </div>
          
          {!reconstructionData && (
            <div className={`rounded-xl border mt-4 text-center py-8 ${cardClass}`}>
              <CubeIcon className={`w-16 h-16 mx-auto mb-4 ${themeMuted}`} />
              <p className={`mb-2 ${themeMuted}`}>
                No hay datos de reconstrucción 3D disponibles
              </p>
              <p className={`text-sm mb-4 ${themeMuted}`}>
                Ingresa un ID de serie DICOM y haz clic en &quot;Reconstruir 3D&quot;, o usa el botón <strong>Cargar ejemplo</strong> en el panel izquierdo para ver la interfaz con datos de demostración.
              </p>
              <button
                type="button"
                onClick={loadDemo}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                Cargar ejemplo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planning3DViewerPage;
