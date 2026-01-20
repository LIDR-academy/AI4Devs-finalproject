import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const ChecklistPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-medical-gray-900">Checklist Quirúrgico WHO</h1>
        <p className="text-medical-gray-600 mt-2">Lista de verificación de seguridad quirúrgica</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <ClipboardDocumentCheckIcon className="w-16 h-16 text-medical-gray-300 mx-auto mb-4" />
          <p className="text-medical-gray-500 mb-2">Módulo de Checklist WHO</p>
          <p className="text-sm text-medical-gray-400">Próximamente disponible</p>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;
