import React, { useState } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Collapse, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUsers, 
  faClock,
  faHome,
  faExternalLinkAlt,
  faChevronDown,
  faChevronUp,
  faCalculator,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { TeamRecommendation } from '../../../types';
import './RecommendationAlgorithmExplanation.css';

interface RecommendationAlgorithmExplanationProps {
  recommendation: TeamRecommendation;
}

const RecommendationAlgorithmExplanation: React.FC<RecommendationAlgorithmExplanationProps> = ({
  recommendation
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calcular cada factor individual de la puntuación
  const calculateFactors = () => {
    // Factor de afinidad (40% del peso)
    const affinityScore = (recommendation.affinity / 5) * 40;
    
    // Factor de disponibilidad (35% del peso)
    const availableCapacity = recommendation.capacity - recommendation.currentLoad;
    const capacityRatio = Math.max(0, availableCapacity) / recommendation.capacity;
    const availabilityScore = capacityRatio * 35;
    
    // Factor de tiempo (15% del peso)
    const today = new Date();
    const startDate = new Date(recommendation.possibleStartDate);
    const daysUntilStart = Math.max(0, (startDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    const timeScore = Math.max(0, 15 - (daysUntilStart / 7));
    
    // Bonus por equipo interno (10% del peso)
    const internalBonus = !recommendation.isExternal ? 10 : 0;
    
    const totalScore = affinityScore + availabilityScore + timeScore + internalBonus;
    
    return {
      affinity: Math.round(affinityScore * 10) / 10,
      availability: Math.round(availabilityScore * 10) / 10,
      timing: Math.round(timeScore * 10) / 10,
      internal: internalBonus,
      total: Math.round(totalScore * 10) / 10
    };
  };

  const factors = calculateFactors();

  const getFactorColor = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  };

  const formatDaysUntilStart = (): string => {
    const today = new Date();
    const startDate = new Date(recommendation.possibleStartDate);
    const days = Math.ceil((startDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (days <= 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days <= 7) return `En ${days} días`;
    return `En ${Math.ceil(days / 7)} semana${Math.ceil(days / 7) > 1 ? 's' : ''}`;
  };

  return (
    <div className="recommendation-algorithm-explanation">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <small className="text-muted d-flex align-items-center">
          <FontAwesomeIcon icon={faCalculator} className="me-1" />
          ¿Cómo se calcula esta puntuación?
        </small>
        <Button
          variant="link"
          size="sm"
          className="p-0 text-decoration-none"
          onClick={() => setShowDetails(!showDetails)}
        >
          <FontAwesomeIcon icon={showDetails ? faChevronUp : faChevronDown} />
        </Button>
      </div>

      {/* Resumen visual rápido */}
      <div className="algorithm-summary mb-2">
        <Row className="g-1">
          <Col xs={3}>
            <div className="factor-mini">
              <FontAwesomeIcon icon={faStar} className="text-warning" />
              <span className="factor-value">{factors.affinity}</span>
            </div>
          </Col>
          <Col xs={3}>
            <div className="factor-mini">
              <FontAwesomeIcon icon={faUsers} className="text-success" />
              <span className="factor-value">{factors.availability}</span>
            </div>
          </Col>
          <Col xs={3}>
            <div className="factor-mini">
              <FontAwesomeIcon icon={faClock} className="text-info" />
              <span className="factor-value">{factors.timing}</span>
            </div>
          </Col>
          <Col xs={3}>
            <div className="factor-mini">
              <FontAwesomeIcon 
                icon={recommendation.isExternal ? faExternalLinkAlt : faHome} 
                className={recommendation.isExternal ? "text-warning" : "text-primary"} 
              />
              <span className="factor-value">{factors.internal}</span>
            </div>
          </Col>
        </Row>
        <div className="total-score-mini mt-2">
          <strong>Total: {factors.total} puntos</strong>
        </div>
      </div>

      {/* Explicación detallada */}
      <Collapse in={showDetails}>
        <div>
          <Card className="algorithm-details-card mt-2">
            <Card.Header className="py-2">
              <small className="fw-bold text-primary">
                <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
                Desglose del Algoritmo de Recomendación
              </small>
            </Card.Header>
            <Card.Body className="py-2">
              
              {/* Factor 1: Afinidad */}
              <div className="algorithm-factor mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="fw-bold">
                    <FontAwesomeIcon icon={faStar} className="text-warning me-1" />
                    Afinidad con Departamento (40%)
                  </small>
                  <Badge bg={getFactorColor(factors.affinity, 40)} className="factor-badge">
                    {factors.affinity}/40
                  </Badge>
                </div>
                <ProgressBar 
                  now={(factors.affinity / 40) * 100} 
                  variant={getFactorColor(factors.affinity, 40)}
                  style={{ height: '4px' }}
                />
                <small className="text-muted">
                  {recommendation.affinity}/5 estrellas = {factors.affinity} puntos
                </small>
              </div>

              {/* Factor 2: Disponibilidad */}
              <div className="algorithm-factor mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="fw-bold">
                    <FontAwesomeIcon icon={faUsers} className="text-success me-1" />
                    Disponibilidad de Capacidad (35%)
                  </small>
                  <Badge bg={getFactorColor(factors.availability, 35)} className="factor-badge">
                    {factors.availability}/35
                  </Badge>
                </div>
                <ProgressBar 
                  now={(factors.availability / 35) * 100} 
                  variant={getFactorColor(factors.availability, 35)}
                  style={{ height: '4px' }}
                />
                <small className="text-muted">
                  {Math.max(0, recommendation.capacity - recommendation.currentLoad).toFixed(1)}/{recommendation.capacity} 
                  capacidad libre = {factors.availability} puntos
                </small>
              </div>

              {/* Factor 3: Tiempo */}
              <div className="algorithm-factor mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="fw-bold">
                    <FontAwesomeIcon icon={faClock} className="text-info me-1" />
                    Disponibilidad Temporal (15%)
                  </small>
                  <Badge bg={getFactorColor(factors.timing, 15)} className="factor-badge">
                    {factors.timing}/15
                  </Badge>
                </div>
                <ProgressBar 
                  now={(factors.timing / 15) * 100} 
                  variant={getFactorColor(factors.timing, 15)}
                  style={{ height: '4px' }}
                />
                <small className="text-muted">
                  Puede iniciar {formatDaysUntilStart().toLowerCase()} = {factors.timing} puntos
                </small>
              </div>

              {/* Factor 4: Bonus Interno */}
              <div className="algorithm-factor mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="fw-bold">
                    <FontAwesomeIcon 
                      icon={recommendation.isExternal ? faExternalLinkAlt : faHome} 
                      className={recommendation.isExternal ? "text-warning me-1" : "text-primary me-1"} 
                    />
                    Bonus Equipo Interno (10%)
                  </small>
                  <Badge 
                    bg={factors.internal > 0 ? 'primary' : 'secondary'} 
                    className="factor-badge"
                  >
                    {factors.internal}/10
                  </Badge>
                </div>
                <ProgressBar 
                  now={(factors.internal / 10) * 100} 
                  variant={factors.internal > 0 ? 'primary' : 'secondary'}
                  style={{ height: '4px' }}
                />
                <small className="text-muted">
                  {recommendation.isExternal ? 'Equipo externo' : 'Equipo interno'} = {factors.internal} puntos
                </small>
              </div>

              {/* Total */}
              <div className="algorithm-total mt-3 pt-2 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <strong className="text-primary">Puntuación Total:</strong>
                  <Badge bg="primary" className="fs-6">
                    {factors.total}/100 puntos
                  </Badge>
                </div>
                <small className="text-muted d-block mt-1">
                  {factors.affinity} + {factors.availability} + {factors.timing} + {factors.internal} = {factors.total}
                </small>
              </div>

            </Card.Body>
          </Card>
        </div>
      </Collapse>
    </div>
  );
};

export default RecommendationAlgorithmExplanation; 