import React, { useState } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Collapse, Button, Alert } from 'react-bootstrap';
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
  faInfoCircle,
  faLightbulb,
  faChartLine,
  faBalanceScale
} from '@fortawesome/free-solid-svg-icons';
import './AlgorithmExplanation.css';

const AlgorithmExplanation: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const factors = [
    {
      name: 'Afinidad con Departamento',
      weight: 40,
      icon: faStar,
      color: 'warning',
      description: 'Nivel de experiencia y especialización del equipo en el tipo de trabajo del departamento',
      calculation: 'Valor de la matriz de afinidad (1-5 estrellas) normalizado a porcentaje',
      example: 'Equipo con 4/5 estrellas = (4/5) × 40% = 32 puntos'
    },
    {
      name: 'Disponibilidad de Capacidad',
      weight: 35,
      icon: faUsers,
      color: 'success',
      description: 'Capacidad libre del equipo para asumir nuevos proyectos',
      calculation: 'Porcentaje de capacidad disponible del equipo',
      example: 'Equipo con 1.5/2.0 libre = (1.5/2.0) × 35% = 26.25 puntos'
    },
    {
      name: 'Disponibilidad Temporal',
      weight: 15,
      icon: faClock,
      color: 'info',
      description: 'Qué tan pronto puede comenzar el equipo con el proyecto',
      calculation: 'Penalización por días de espera hasta poder iniciar',
      example: 'Puede iniciar en 3 días = 15% - (3/7) × 15% ≈ 8.6 puntos'
    },
    {
      name: 'Bonus Equipo Interno',
      weight: 10,
      icon: faHome,
      color: 'primary',
      description: 'Ventaja por ser equipo interno vs externo (comunicación, costos, etc.)',
      calculation: 'Bonus fijo para equipos internos',
      example: 'Equipo interno = +10 puntos, Equipo externo = +0 puntos'
    }
  ];

  const getVariantFromColor = (color: string): string => {
    switch (color) {
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'info';
      case 'primary': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="algorithm-explanation-card mb-4">
      <Card.Header className="algorithm-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faLightbulb} className="text-warning me-2" />
            <h5 className="mb-0">Algoritmo de Recomendación de Equipos</h5>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details-btn"
          >
            <FontAwesomeIcon icon={showDetails ? faChevronUp : faChevronDown} className="me-1" />
            {showDetails ? 'Ocultar' : 'Ver'} Detalles
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Fórmula Principal */}
        <Alert variant="light" className="formula-alert">
          <div className="text-center">
            <FontAwesomeIcon icon={faCalculator} className="text-primary me-2" />
            <strong className="formula-title">Fórmula de Puntuación:</strong>
          </div>
          <div className="formula-container mt-2">
            <code className="formula">
              Puntuación = (Afinidad × 40%) + (Disponibilidad × 35%) + (Tiempo × 15%) + (Bonus Interno × 10%)
            </code>
          </div>
          <div className="text-center mt-2">
            <small className="text-muted">
              <FontAwesomeIcon icon={faChartLine} className="me-1" />
              Puntuación máxima: 100 puntos
            </small>
          </div>
        </Alert>

        {/* Resumen Visual de Factores */}
        <Row className="factors-summary mb-3">
          {factors.map((factor, index) => (
            <Col md={6} lg={3} key={index} className="mb-3">
              <div className="factor-summary-card">
                <div className="factor-header">
                  <FontAwesomeIcon 
                    icon={factor.icon} 
                    className={`text-${factor.color} me-2`} 
                  />
                  <span className="factor-name">{factor.name}</span>
                </div>
                <div className="factor-weight">
                  <Badge bg={factor.color} className="weight-badge">
                    {factor.weight}%
                  </Badge>
                </div>
                <div className="factor-bar">
                  <ProgressBar 
                    now={factor.weight} 
                    variant={getVariantFromColor(factor.color)}
                    style={{ height: '6px' }}
                  />
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Explicación Detallada */}
        <Collapse in={showDetails}>
          <div>
            <hr />
            <h6 className="mb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-info me-2" />
              Desglose Detallado del Algoritmo
            </h6>

            {factors.map((factor, index) => (
              <Card key={index} className="factor-detail-card mb-3">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <h6 className="factor-detail-title">
                        <FontAwesomeIcon 
                          icon={factor.icon} 
                          className={`text-${factor.color} me-2`} 
                        />
                        {factor.name}
                        <Badge bg={factor.color} className="ms-2">
                          {factor.weight}%
                        </Badge>
                      </h6>
                      <p className="factor-description mb-2">
                        {factor.description}
                      </p>
                      <div className="calculation-info">
                        <strong>Cálculo:</strong> {factor.calculation}
                      </div>
                      <div className="example-info mt-1">
                        <strong>Ejemplo:</strong> <code>{factor.example}</code>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      <div className="weight-visualization">
                        <div className="weight-circle">
                          <span className="weight-number">{factor.weight}</span>
                          <span className="weight-percent">%</span>
                        </div>
                        <ProgressBar 
                          now={factor.weight} 
                          variant={getVariantFromColor(factor.color)}
                          className="mt-2"
                          style={{ height: '8px' }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}

            {/* Consideraciones Adicionales */}
            <Card className="considerations-card">
              <Card.Header>
                <h6 className="mb-0">
                  <FontAwesomeIcon icon={faBalanceScale} className="text-secondary me-2" />
                  Consideraciones del Algoritmo
                </h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6 className="text-success">✅ Factores Positivos</h6>
                    <ul className="considerations-list">
                      <li>Alta afinidad con el departamento</li>
                      <li>Capacidad disponible inmediata</li>
                      <li>Posibilidad de inicio rápido</li>
                      <li>Equipo interno (comunicación directa)</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6 className="text-warning">⚠️ Factores de Penalización</h6>
                    <ul className="considerations-list">
                      <li>Baja afinidad con el tipo de trabajo</li>
                      <li>Equipo saturado o sin capacidad</li>
                      <li>Demora en fecha de inicio</li>
                      <li>Costos adicionales por externalización</li>
                    </ul>
                  </Col>
                </Row>
                
                <Alert variant="info" className="mt-3 mb-0">
                  <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                  <strong>Nota:</strong> El algoritmo está diseñado para ser transparente y modificable. 
                  Los pesos pueden ajustarse según las necesidades específicas de cada organización.
                </Alert>
              </Card.Body>
            </Card>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
};

export default AlgorithmExplanation; 