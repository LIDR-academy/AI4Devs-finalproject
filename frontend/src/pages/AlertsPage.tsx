import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCode, 
  faCog, 
  faCalendarCheck,
  faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';

const AlertsPage: React.FC = () => {
  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">
            <FontAwesomeIcon icon={faBell} className="me-3 text-primary" />
            Sistema de Alertas
          </h1>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">
                <FontAwesomeIcon icon={faCode} className="me-2" />
                Funcionalidad en Desarrollo
              </h4>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                <FontAwesomeIcon 
                  icon={faCog} 
                  className="fa-spin text-primary mb-3" 
                  size="3x" 
                />
              </div>
              
              <h5 className="mb-3">Sistema de Alertas Próximamente</h5>
              
              <p className="text-muted mb-4">
                Estamos trabajando en el sistema de alertas que te notificará sobre:
              </p>

              <Alert variant="info" className="text-start">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                <strong>Funcionalidades planificadas:</strong>
                <ul className="mt-2 mb-0">
                  <li>Notificaciones de tareas próximas a vencer</li>
                  <li>Alertas de equipos con alta carga de trabajo</li>
                  <li>Avisos de tareas sin asignar</li>
                  <li>Recordatorios de fechas límite</li>
                  <li>Notificaciones en tiempo real</li>
                </ul>
              </Alert>

              <div className="mt-4">
                <FontAwesomeIcon icon={faCalendarCheck} className="me-2 text-success" />
                <span className="text-muted">
                  Esta sección estará disponible en la próxima fase de desarrollo
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AlertsPage; 