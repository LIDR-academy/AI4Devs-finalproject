import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import DocumentationEditor from '@/components/documentation/DocumentationEditor';

const DocumentationPage = () => {
  const { surgeryId } = useParams<{ surgeryId: string }>();
  const navigate = useNavigate();

  if (!surgeryId) {
    return (
      <div className="card text-center py-8">
        <p className="text-medical-gray-500">ID de cirugía no proporcionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header: optimizado para tablet/móvil (apilado, áreas táctiles ≥44px) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-medical-gray-600 hover:text-medical-primary hover:bg-medical-gray-100 touch-manipulation"
            aria-label="Volver"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-medical-gray-900">
              Documentación Intraoperatoria
            </h1>
            <p className="text-medical-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Documentación en tiempo real de la cirugía
            </p>
          </div>
        </div>
        <Link
          to={`/planning/surgeries/${surgeryId}`}
          className="btn btn-outline min-h-[44px] flex items-center justify-center touch-manipulation w-full sm:w-auto"
        >
          Ver Detalles de Cirugía
        </Link>
      </div>

      {/* Editor */}
      <DocumentationEditor surgeryId={surgeryId} />
    </div>
  );
};

export default DocumentationPage;
