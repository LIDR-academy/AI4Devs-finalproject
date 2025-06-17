import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faTimes, faSave, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Task, TaskStatus } from '../../../types';
import SprintEstimationInput from './SprintEstimationInput';
import LoadFactorInput from './LoadFactorInput';
import './TaskEstimationModal.css';

interface TaskEstimationModalProps {
  show: boolean;
  task: Task | null;
  onHide: () => void;
  onSave: (taskId: number, sprints: number, loadFactor: number) => Promise<void>;
}

interface EstimationData {
  sprints: number | undefined;
  loadFactor: number | undefined;
}

interface ValidationErrors {
  sprints?: string;
  loadFactor?: string;
  general?: string;
}

const TaskEstimationModal: React.FC<TaskEstimationModalProps> = ({
  show,
  task,
  onHide,
  onSave
}) => {
  const [estimation, setEstimation] = useState<EstimationData>({
    sprints: undefined,
    loadFactor: undefined
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Inicializar datos cuando se abre el modal o cambia la tarea
  useEffect(() => {
    if (task && show) {
      const initialData: EstimationData = {
        sprints: task.sprints,
        loadFactor: task.loadFactor
      };
      setEstimation(initialData);
      setErrors({});
      setHasChanges(false);
    }
  }, [task, show]);

  // Detectar cambios en la estimación
  useEffect(() => {
    if (task) {
      const hasSprintsChanged = estimation.sprints !== task.sprints;
      const hasLoadFactorChanged = estimation.loadFactor !== task.loadFactor;
      setHasChanges(hasSprintsChanged || hasLoadFactorChanged);
    }
  }, [estimation, task]);

  const handleSprintsChange = (value: number | undefined) => {
    setEstimation(prev => ({ ...prev, sprints: value }));
    if (errors.sprints) {
      setErrors(prev => ({ ...prev, sprints: undefined }));
    }
  };

  const handleLoadFactorChange = (value: number | undefined) => {
    setEstimation(prev => ({ ...prev, loadFactor: value }));
    if (errors.loadFactor) {
      setErrors(prev => ({ ...prev, loadFactor: undefined }));
    }
  };

  const validateEstimation = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!estimation.sprints || estimation.sprints <= 0) {
      newErrors.sprints = 'La estimación en sprints es obligatoria';
    }

    if (!estimation.loadFactor || estimation.loadFactor <= 0) {
      newErrors.loadFactor = 'El factor de carga es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!task) return;

    if (!validateEstimation()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      await onSave(
        task.id, 
        estimation.sprints!, 
        estimation.loadFactor!
      );

      // Cerrar modal tras guardar exitosamente
      onHide();
    } catch (error) {
      console.error('Error saving estimation:', error);
      setErrors({
        general: 'Error al guardar la estimación. Por favor, inténtelo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !loading) {
      if (window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar?')) {
        onHide();
      }
    } else {
      onHide();
    }
  };

  // Condición actualizada para usar TaskStatus.BACKLOG
  const canEstimate = task?.status === TaskStatus.BACKLOG;

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.BACKLOG: return 'Backlog';
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.DOING: return 'Doing';
      case TaskStatus.DEMO: return 'Demo';
      case TaskStatus.DONE: return 'Done';
      default: return status;
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      backdrop={loading ? 'static' : true}
      keyboard={!loading}
      className="task-estimation-modal"
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title>
          <FontAwesomeIcon icon={faCalculator} className="me-2 text-primary" />
          Estimación de Tarea
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {task && (
          <>
            {/* Información de la tarea */}
            <div className="task-info-section mb-4 p-3 bg-light rounded">
              <Row>
                <Col md={8}>
                  <h6 className="text-primary mb-2">
                    Tarea #{task.id} - {task.subject}
                  </h6>
                  <p className="text-muted mb-2 small">
                    {task.description}
                  </p>
                </Col>
                <Col md={4} className="text-md-end">
                  <div className="task-meta">
                    <small className="text-muted d-block">Prioridad: {task.priority}</small>
                    <small className="text-muted d-block">
                      Estado: {getStatusLabel(task.status)}
                    </small>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Verificar si se puede estimar */}
            {!canEstimate && (
              <Alert variant="warning" className="mb-4">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>No se puede estimar esta tarea.</strong> 
                Solo se pueden estimar tareas en estado "Backlog" (pendientes de estimación).
                Esta tarea está en estado: {getStatusLabel(task.status)}
              </Alert>
            )}

            {/* Errores generales */}
            {errors.general && (
              <Alert variant="danger" className="mb-4">
                {errors.general}
              </Alert>
            )}

            {/* Formulario de estimación */}
            {canEstimate && (
              <Form>
                <Row>
                  <Col md={6}>
                    <SprintEstimationInput
                      value={estimation.sprints}
                      onChange={handleSprintsChange}
                      disabled={loading}
                      error={errors.sprints}
                    />
                  </Col>
                  <Col md={6}>
                    <LoadFactorInput
                      value={estimation.loadFactor}
                      onChange={handleLoadFactorChange}
                      disabled={loading}
                      error={errors.loadFactor}
                    />
                  </Col>
                </Row>

                {/* Resumen de la estimación */}
                {estimation.sprints && estimation.loadFactor && (
                  <Alert variant="success" className="mt-4">
                    <h6 className="mb-2">
                      <FontAwesomeIcon icon={faCalculator} className="me-2" />
                      Resumen de Estimación
                    </h6>
                    <Row>
                      <Col md={6}>
                        <strong>Duración:</strong> {estimation.sprints} sprint{estimation.sprints !== 1 ? 's' : ''} 
                        <small className="text-muted d-block">
                          ({estimation.sprints * 2} semanas aproximadamente)
                        </small>
                      </Col>
                      <Col md={6}>
                        <strong>Recursos:</strong> {estimation.loadFactor} trabajador{estimation.loadFactor !== 1 ? 'es' : ''}
                        <small className="text-muted d-block">
                          {estimation.loadFactor < 1 ? 'a tiempo parcial' : 'a tiempo completo'}
                        </small>
                      </Col>
                    </Row>
                    <hr className="my-2" />
                    <small className="text-muted">
                      <strong>Esfuerzo total estimado:</strong> {(estimation.sprints * estimation.loadFactor * 2).toFixed(1)} persona-semanas
                    </small>
                  </Alert>
                )}
              </Form>
            )}

            {/* Valores actuales si existen */}
            {(task.sprints || task.loadFactor) && (
              <div className="mt-4 p-3 border rounded bg-light">
                <h6 className="text-muted mb-2">Estimación actual:</h6>
                <Row className="small">
                  <Col md={6}>
                    <strong>Sprints:</strong> {task.sprints || 'No definido'}
                  </Col>
                  <Col md={6}>
                    <strong>Factor de carga:</strong> {task.loadFactor || 'No definido'}
                  </Col>
                </Row>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faTimes} className="me-1" />
          Cancelar
        </Button>
        
        {canEstimate && (
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={loading || !hasChanges || !estimation.sprints || !estimation.loadFactor}
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
                Guardando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-1" />
                Guardar Estimación
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default TaskEstimationModal; 