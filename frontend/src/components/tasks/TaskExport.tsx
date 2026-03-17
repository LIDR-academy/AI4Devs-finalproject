import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileExcel, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { TaskFilters, UserRole } from '../../types';
import { TaskService } from '../../services/taskService';

interface TaskExportProps {
  show: boolean;
  onHide: () => void;
  filters?: TaskFilters;
  userRole?: UserRole;
  userDepartment?: number;
}

const TaskExport: React.FC<TaskExportProps> = ({
  show,
  onHide,
  filters,
  userRole,
  userDepartment
}) => {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await TaskService.exportTasks(
        format,
        filters,
        userRole,
        userDepartment
      );
      
      // En una implementación real, aquí se descargaría el archivo
      setSuccess(`Archivo ${result.filename} generado correctamente. La descarga comenzará automáticamente.`);
      
      // Simular descarga
      setTimeout(() => {
        onHide();
      }, 2000);
      
    } catch (err) {
      setError('Error al generar el archivo de exportación. Por favor, inténtelo de nuevo.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(null);
      onHide();
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Exportar Tareas
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            {success}
          </Alert>
        )}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Formato de exportación</Form.Label>
            <div>
              <Form.Check
                type="radio"
                id="format-excel"
                name="format"
                label={
                  <span>
                    <FontAwesomeIcon icon={faFileExcel} className="me-2 text-success" />
                    Excel (.xlsx)
                  </span>
                }
                checked={format === 'excel'}
                onChange={() => setFormat('excel')}
                disabled={loading}
              />
              <Form.Check
                type="radio"
                id="format-csv"
                name="format"
                label={
                  <span>
                    <FontAwesomeIcon icon={faFileCsv} className="me-2 text-info" />
                    CSV (.csv)
                  </span>
                }
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                disabled={loading}
              />
            </div>
          </Form.Group>
          
          <div className="text-muted small">
            <p><strong>Información incluida en la exportación:</strong></p>
            <ul className="mb-0">
              <li>ID de tarea y departamento</li>
              <li>Título y descripción</li>
              <li>Estado y prioridad</li>
              <li>Responsable y equipo asignado</li>
              <li>Fechas de inicio y fin</li>
              <li>Estimación en sprints</li>
            </ul>
            {filters && Object.keys(filters).length > 0 && (
              <p className="mt-2 mb-0">
                <strong>Nota:</strong> Se aplicarán los filtros actualmente configurados.
              </p>
            )}
          </div>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Generando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} className="me-2" />
              Exportar
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TaskExport; 