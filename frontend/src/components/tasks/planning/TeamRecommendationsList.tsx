import React from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUsers, 
  faCalendarAlt,
  faChevronRight,
  faClock,

} from '@fortawesome/free-solid-svg-icons';
import { TeamRecommendation, Task, TaskStatus } from '../../../types';
import CurrentProjectsList from './CurrentProjectsList';
import RecommendationAlgorithmExplanation from './RecommendationAlgorithmExplanation';
import './TeamRecommendationsList.css';

interface TeamRecommendationsListProps {
  recommendations: TeamRecommendation[];
  loading: boolean;
  onTeamSelect: (teamId: number) => void;
  task: Task;
}

const TeamRecommendationsList: React.FC<TeamRecommendationsListProps> = ({
  recommendations,
  loading,
  onTeamSelect,
  task
}) => {

  const getScoreClass = (score: number): string => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  };

  const getScoreText = (score: number): string => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Buena';
    if (score >= 40) return 'Regular';
    return 'Baja';
  };

  const renderAffinityStars = (affinity: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={i < affinity ? 'affinity-stars' : 'text-muted'}
      />
    ));
  };

  const getCapacityColor = (currentLoad: number, capacity: number): string => {
    const utilization = (currentLoad / capacity) * 100;
    if (utilization >= 100) return 'capacity-danger';
    if (utilization >= 80) return 'capacity-warning';
    return 'capacity-available';
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExternalTeam = (teamName: string): boolean => {
    return teamName.toLowerCase().includes('externo');
  };

  const getRecommendationReason = (recommendation: TeamRecommendation): string => {
    const reasons: string[] = [];
    
    if (recommendation.affinity >= 4) {
      reasons.push('Alta afinidad con el departamento');
    }
    
    const availableCapacity = recommendation.capacity - recommendation.currentLoad;
    if (availableCapacity >= 1) {
      reasons.push('Capacidad disponible inmediata');
    } else if (availableCapacity > 0) {
      reasons.push('Capacidad parcial disponible');
    }
    
    const daysUntilStart = Math.ceil(
      (new Date(recommendation.possibleStartDate).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)
    );
    
    if (daysUntilStart <= 7) {
      reasons.push('Puede iniciar pronto');
    }
    
    if (!isExternalTeam(recommendation.teamName)) {
      reasons.push('Equipo interno');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Disponible para asignación';
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-4">
        <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
        <h5 className="text-muted">No hay equipos disponibles</h5>
        <p className="text-muted">
          No se encontraron equipos que puedan abordar esta tarea en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="team-recommendations-list">
      <Row className="g-3">
        {recommendations.map((recommendation, index) => (
          <Col lg={6} key={recommendation.teamId}>
            <Card className="team-recommendation-card h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{recommendation.teamName}</h6>
                  {isExternalTeam(recommendation.teamName) && (
                    <Badge bg="warning" text="dark" className="external-badge">Externo</Badge>
                  )}
                </div>
                <div className="score-container">
                  <span className={`score ${getScoreClass(recommendation.recommendationScore || recommendation.score || 0)}`}>
                    {recommendation.recommendationScore || recommendation.score || 0}
                  </span>
                  <small className="d-block text-center score-text">
                    {getScoreText(recommendation.recommendationScore || recommendation.score || 0)}
                  </small>
                </div>
              </Card.Header>

              <Card.Body>
                {/* Ranking position */}
                <div className="d-flex align-items-center mb-3">
                  <Badge bg="primary" className="me-2">#{index + 1}</Badge>
                  <small className="text-muted">Recomendación</small>
                </div>

                {/* Afinidad */}
                <div className="mb-3">
                  <Row className="align-items-center">
                    <Col sm={4}>
                      <small className="text-muted">Afinidad:</small>
                    </Col>
                    <Col sm={8}>
                      <div className="d-flex align-items-center">
                        {renderAffinityStars(recommendation.affinity)}
                        <small className="ms-2 text-muted">
                          ({recommendation.affinity}/5)
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Capacidad */}
                <div className="mb-3">
                  <Row className="align-items-center">
                    <Col sm={4}>
                      <small className="text-muted">Capacidad:</small>
                    </Col>
                    <Col sm={8}>
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small>
                            {recommendation.currentLoad.toFixed(1)}/{recommendation.capacity.toFixed(1)} utilizada
                          </small>
                          <small className="text-muted">
                            {Math.round((recommendation.currentLoad / recommendation.capacity) * 100)}%
                          </small>
                        </div>
                        <ProgressBar 
                          now={(recommendation.currentLoad / recommendation.capacity) * 100}
                          variant={
                            recommendation.currentLoad >= recommendation.capacity ? 'danger' :
                            recommendation.currentLoad >= (recommendation.capacity * 0.8) ? 'warning' : 'success'
                          }
                          style={{ height: '6px' }}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Fechas posibles */}
                <div className="mb-3">
                  <Row>
                    <Col sm={6}>
                      <small className="text-muted d-block">Inicio posible:</small>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-primary" />
                        <small><strong>{formatDate(recommendation.possibleStartDate)}</strong></small>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <small className="text-muted d-block">Fin estimado:</small>
                      <div className="d-flex align-items-center">
                        <FontAwesomeIcon icon={faClock} className="me-1 text-primary" />
                        <small><strong>{formatDate(recommendation.possibleEndDate)}</strong></small>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Proyectos actuales del equipo - NUEVA FUNCIONALIDAD */}
                <CurrentProjectsList 
                  projects={recommendation.currentProjects}
                  teamName={recommendation.teamName}
                />

                {/* Explicación del algoritmo de recomendación */}
                <RecommendationAlgorithmExplanation 
                  recommendation={recommendation}
                />

                {/* Disponibilidad inmediata */}
                {(recommendation.capacity - recommendation.currentLoad) > 0 && (
                  <Badge bg="success" className="mb-2">
                    <FontAwesomeIcon icon={faUsers} className="me-1" />
                    Disponibilidad inmediata
                  </Badge>
                )}
              </Card.Body>

              <Card.Footer>
                <Button 
                  variant="primary" 
                  className="w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTeamSelect(recommendation.teamId);
                  }}
                >
                  Seleccionar Equipo
                  <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TeamRecommendationsList; 