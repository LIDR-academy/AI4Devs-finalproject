import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Spinner, Button, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCalendarPlus, 
  faExclamationTriangle,
  faTasks,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { Task, TeamRecommendation, TaskStatus } from '../../../types';
import { TaskService } from '../../../services/taskService';
import { getDepartmentNameById } from '../../../services/dataAdapters';

import TeamRecommendationsList from './TeamRecommendationsList';
import PlanningForm from './PlanningForm';
import AlgorithmExplanation from './AlgorithmExplanation';
import './TaskPlanningPage.css';

interface ConflictInfo {
  hasConflicts: boolean;
  conflicts: string[];
  warnings: string[];
}

const TaskPlanningPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [departmentName, setDepartmentName] = useState<string>('Cargando...');
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<ConflictInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'recommendations' | 'planning'>('recommendations');

  useEffect(() => {
    loadTaskAndRecommendations();
  }, [taskId]);

  const loadTaskAndRecommendations = async () => {
    if (!taskId) {
      setError('ID de tarea no proporcionado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Cargar la tarea
      const taskData = await TaskService.getTaskById(parseInt(taskId));
      if (!taskData) {
        throw new Error('Tarea no encontrada');
      }

      setTask(taskData);

      // Cargar nombre del departamento
      const deptName = await getDepartmentNameById(taskData.department);
      setDepartmentName(deptName);

      // Verificar que la tarea se puede planificar
      if (taskData.status !== TaskStatus.TODO) {
        throw new Error(`No se puede planificar una tarea en estado: ${taskData.status}`);
      }

      if (!taskData.sprints || !taskData.loadFactor) {
        throw new Error('La tarea debe tener estimación para poder planificarla');
      }

      // Cargar recomendaciones
      setLoadingRecommendations(true);
      const recommendationsData = await TaskService.getTeamRecommendations(parseInt(taskId));
      setRecommendations(recommendationsData);

    } catch (err) {
      console.error('Error loading task and recommendations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      setLoadingRecommendations(false);
    }
  };

  const handleTeamSelect = async (teamId: number) => {
    setSelectedTeamId(teamId);
    setStep('planning');
  };

  const handleBackToRecommendations = () => {
    setSelectedTeamId(null);
    setConflicts(null);
    setStep('recommendations');
  };

  const handleDateChange = async (startDate: Date, endDate: Date) => {
    if (selectedTeamId && task) {
      try {
        const conflictInfo = await TaskService.checkTeamConflicts(
          selectedTeamId,
          startDate,
          endDate,
          task.id
        );
        setConflicts(conflictInfo);
      } catch (err) {
        console.error('Error checking conflicts:', err);
      }
    }
  };

  const handleSavePlanning = async (teamId: number, startDate: Date, endDate: Date) => {
    if (!task) return;

    try {
      await TaskService.assignTeamAndDates(task.id, teamId, startDate, endDate);
      
      // Navegar de vuelta a la lista de tareas con mensaje de éxito
      navigate('/tasks?planningSuccess=true');
    } catch (err) {
      console.error('Error saving planning:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la planificación');
    }
  };

  const selectedRecommendation = recommendations.find(r => r.teamId === selectedTeamId);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3 h5">Cargando información de planificación...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Error:</strong> {error}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/tasks')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Volver a Tareas
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Tarea no encontrada</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/tasks')}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Volver a Tareas
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 task-planning-page">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faTasks} className="me-1" />
          Tareas
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          <FontAwesomeIcon icon={faCalendarPlus} className="me-1" />
          Planificar Tarea #{task.id}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Información de la tarea */}
      <Card className="mb-4 task-info-card">
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faCalendarPlus} className="me-2 text-primary" />
                Planificación de Tarea #{task.id}
              </h4>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/tasks')}
                size="sm"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                Volver
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h5 className="text-primary mb-2">{task.subject}</h5>
              <p className="text-muted mb-3">{task.description}</p>
              <div className="task-metadata">
                <Row className="g-3">
                                      <Col sm={6}>
                      <small className="text-muted d-block">Departamento</small>
                      <strong>{departmentName}</strong>
                    </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">Prioridad</small>
                    <strong>Prioridad {task.priority}</strong>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col md={4}>
              <div className="estimation-summary p-3 bg-light rounded">
                <h6 className="text-muted mb-2">Estimación</h6>
                <div className="mb-2">
                  <strong>{task.sprints || 0}</strong> sprint{(task.sprints || 0) !== 1 ? 's' : ''} 
                  <small className="text-muted d-block">
                    ({(task.sprints || 0) * 2} semanas aprox.)
                  </small>
                </div>
                <div>
                  <strong>{task.loadFactor || 0}</strong> trabajador{(task.loadFactor || 0) !== 1 ? 'es' : ''}
                  <small className="text-muted d-block">
                    {(task.loadFactor || 0) < 1 ? 'tiempo parcial' : 'tiempo completo'}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Explicación del Algoritmo de Recomendación */}
      {step === 'recommendations' && (
        <AlgorithmExplanation />
      )}

      {/* Contenido principal según el paso */}
      {step === 'recommendations' && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Recomendaciones de Equipos
            </h5>
            <small className="text-muted">
              Equipos ordenados por puntuación de recomendación basada en afinidad, disponibilidad y capacidad
            </small>
          </Card.Header>
          <Card.Body>
            {loadingRecommendations ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Calculando recomendaciones...</div>
              </div>
            ) : (
              <TeamRecommendationsList 
                recommendations={recommendations}
                task={task}
                loading={loadingRecommendations}
                onTeamSelect={handleTeamSelect}
              />
            )}
          </Card.Body>
        </Card>
      )}

      {step === 'planning' && selectedRecommendation && (
        <Card>
          <Card.Header>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faCalendarPlus} className="me-2" />
                  Planificar con {selectedRecommendation.teamName}
                </h5>
              </Col>
              <Col xs="auto">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleBackToRecommendations}
                  size="sm"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                  Ver Otras Opciones
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <PlanningForm
              task={task}
              recommendation={selectedRecommendation}
              conflicts={conflicts}
              onDateChange={handleDateChange}
              onSave={handleSavePlanning}
              onBack={handleBackToRecommendations}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default TaskPlanningPage; 