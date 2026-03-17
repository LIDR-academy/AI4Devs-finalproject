import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt,
  faSave,
  faExclamationTriangle,
  faInfoCircle,
  faUsers,
  faClock,
  faCalculator
} from '@fortawesome/free-solid-svg-icons';
import { Task, TeamRecommendation } from '../../../types';

interface ConflictInfo {
  hasConflicts: boolean;
  conflicts: string[];
  warnings: string[];
}

interface PlanningFormProps {
  recommendation: TeamRecommendation;
  task: Task;
  onSave: (teamId: number, startDate: Date, endDate: Date) => void;
  onBack: () => void;
  conflicts?: ConflictInfo | null;
  onDateChange?: (startDate: Date, endDate: Date) => void;
}

const PlanningForm: React.FC<PlanningFormProps> = ({
  recommendation,
  task,
  onSave,
  onBack,
  conflicts,
  onDateChange
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Inicializar fechas con las recomendadas
  useEffect(() => {
    const startDateStr = formatDateForInput(recommendation.possibleStartDate);
    const endDateStr = formatDateForInput(recommendation.possibleEndDate);
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    
    // Trigger conflict check with initial dates
    if (startDateStr && endDateStr) {
      onDateChange?.(
        new Date(recommendation.possibleStartDate),
        new Date(recommendation.possibleEndDate)
      );
    }
  }, [recommendation, onDateChange]);

  const formatDateForInput = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setFormErrors(prev => ({ ...prev, startDate: '' }));
    
    if (value && endDate) {
      const start = new Date(value);
      const end = new Date(endDate);
      
      if (start < end) {
        onDateChange?.(start, end);
      }
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setFormErrors(prev => ({ ...prev, endDate: '' }));
    
    if (startDate && value) {
      const start = new Date(startDate);
      const end = new Date(value);
      
      if (start < end) {
        onDateChange?.(start, end);
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!startDate) {
      errors.startDate = 'La fecha de inicio es obligatoria';
    }
    
    if (!endDate) {
      errors.endDate = 'La fecha de fin es obligatoria';
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        errors.startDate = 'La fecha de inicio no puede ser anterior a hoy';
      }
      
      if (end <= start) {
        errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
      
      // Validar duración mínima (al menos 1 día)
      const diffDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      if (diffDays < 1) {
        errors.endDate = 'La duración mínima debe ser de 1 día';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (conflicts?.hasConflicts) {
      return;
    }
    
    try {
      setSaving(true);
      await onSave(
        recommendation.teamId,
        new Date(startDate),
        new Date(endDate)
      );
    } catch (error) {
      console.error('Error saving planning:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateDuration = (): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  };

  const calculateWeeks = (): number => {
    return Math.ceil(calculateDuration() / 7);
  };

  const isFormValid = (): boolean => {
    return !!startDate && !!endDate && 
           Object.keys(formErrors).length === 0 && 
           !conflicts?.hasConflicts;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="planning-form">
      {/* Team Summary */}
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Equipo Seleccionado: {recommendation.teamName}
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <small className="text-muted d-block">Puntuación</small>
              <strong className="text-success">{recommendation.recommendationScore || recommendation.score || 0}/100</strong>
            </Col>
            <Col md={3}>
              <small className="text-muted d-block">Afinidad</small>
              <strong>{recommendation.affinity}/5</strong>
            </Col>
            <Col md={3}>
              <small className="text-muted d-block">Carga actual</small>
              <strong>{recommendation.currentLoad.toFixed(1)}/{recommendation.capacity.toFixed(1)}</strong>
            </Col>
            <Col md={3}>
              <small className="text-muted d-block">Disponibilidad</small>
              <strong>{Math.max(0, recommendation.capacity - recommendation.currentLoad).toFixed(1)}</strong>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Date Selection */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Fecha de Inicio
            </Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              isInvalid={!!formErrors.startDate}
              min={formatDateForInput(new Date())}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.startDate}
            </Form.Control.Feedback>
            {startDate && (
              <Form.Text className="text-muted">
                {formatDate(startDate)}
              </Form.Text>
            )}
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              Fecha de Fin
            </Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              isInvalid={!!formErrors.endDate}
              min={startDate || formatDateForInput(new Date())}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.endDate}
            </Form.Control.Feedback>
            {endDate && (
              <Form.Text className="text-muted">
                {formatDate(endDate)}
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Duration Summary */}
      {startDate && endDate && calculateDuration() > 0 && (
        <Alert variant="info" className="mb-4">
          <Row className="align-items-center">
            <Col>
              <FontAwesomeIcon icon={faClock} className="me-2" />
              <strong>Duración:</strong> {calculateDuration()} día{calculateDuration() !== 1 ? 's' : ''} 
              ({calculateWeeks()} semana{calculateWeeks() !== 1 ? 's' : ''})
            </Col>
            <Col xs="auto">
              <Badge bg="primary">
                <FontAwesomeIcon icon={faCalculator} className="me-1" />
                {(calculateDuration() / 14).toFixed(1)} sprints estimados
              </Badge>
            </Col>
          </Row>
        </Alert>
      )}

      {/* Conflicts and Warnings */}
      {conflicts && (
        <>
          {conflicts.hasConflicts && conflicts.conflicts.length > 0 && (
            <Alert variant="danger" className="mb-3 conflict-alert">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Conflictos detectados:</strong>
              <ul className="mb-0 mt-2">
                {conflicts.conflicts.map((conflict, index) => (
                  <li key={index}>{conflict}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {conflicts.warnings.length > 0 && (
            <Alert variant="warning" className="mb-3 warning-alert">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              <strong>Advertencias:</strong>
              <ul className="mb-0 mt-2">
                {conflicts.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      )}

      {/* Planning Summary */}
      {isFormValid() && (
        <Card className="planning-summary mb-4">
          <Card.Header>
            <h6 className="mb-0 text-success">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              Resumen de Planificación
            </h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Tarea</small>
                  <strong>#{task.id} - {task.subject}</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Equipo asignado</small>
                  <strong>{recommendation.teamName}</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Período</small>
                  <strong>{formatDate(startDate)} - {formatDate(endDate)}</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Duración</small>
                  <strong>{calculateDuration()} días ({calculateWeeks()} semanas)</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Estimación original</small>
                  <strong>{task.sprints} sprints, {task.loadFactor} trabajador{(task.loadFactor || 0) !== 1 ? 'es' : ''}</strong>
                </div>
              </Col>
              <Col md={6}>
                <div className="summary-item">
                  <small className="text-muted d-block">Estado resultante</small>
                  <Badge bg="success">Planificada</Badge>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Save Button */}
      <div className="d-flex justify-content-end">
        <Button
          variant="success"
          size="lg"
          onClick={handleSave}
          disabled={!isFormValid() || saving}
        >
          {saving ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Guardando Planificación...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} className="me-2" />
              Confirmar Planificación
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlanningForm; 