import React from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faExclamationTriangle, faCheckCircle, faSync } from '@fortawesome/free-solid-svg-icons';
import { useTeamCapacity } from '../hooks/useTeamCapacity';
import { TeamCapacityCard } from '../components/capacity/TeamCapacityCard';
import { CapacityStats } from '../components/capacity/CapacityStats';
import './TeamCapacityPage.css';

const TeamCapacityPage: React.FC = () => {
  const { data, loading, error, refreshData } = useTeamCapacity();

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading) {
    return (
      <Container fluid className="team-capacity-page">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando capacidad de equipos...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="team-capacity-page">
        <Alert variant="danger" className="mt-3">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
        <Button variant="outline-primary" onClick={handleRefresh} className="mt-2">
          <FontAwesomeIcon icon={faSync} className="me-2" />
          Reintentar
        </Button>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container fluid className="team-capacity-page">
        <Alert variant="warning" className="mt-3">
          No hay datos de capacidad disponibles
        </Alert>
      </Container>
    );
  }

  const { equipos, estadisticas } = data;

  return (
    <Container fluid className="team-capacity-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Capacidad de Equipos
              </h2>
              <p className="text-muted mb-0">
                Visualización de carga actual y disponibilidad de equipos de desarrollo
              </p>
            </div>
            <Button variant="outline-primary" onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSync} className="me-2" />
              Actualizar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alertas de sobrecarga */}
      {estadisticas.equiposSobrecargados > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>¡Atención!</strong> Hay {estadisticas.equiposSobrecargados} equipo(s) sobrecargado(s) (&gt;100% capacidad)
            </Alert>
          </Col>
        </Row>
      )}

      {estadisticas.equiposEnAdvertencia > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              <strong>Advertencia:</strong> Hay {estadisticas.equiposEnAdvertencia} equipo(s) cerca del límite de capacidad (&gt;90%)
            </Alert>
          </Col>
        </Row>
      )}

      {/* Estadísticas generales */}
      <Row className="mb-4">
        <Col>
          <CapacityStats stats={estadisticas} />
        </Col>
      </Row>

      {/* Lista de equipos */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Equipos de Desarrollo</h5>
              <small className="text-muted">
                Ordenados por porcentaje de ocupación (mayor a menor)
              </small>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="team-capacity-list">
                {equipos.map((equipo, index) => (
                  <TeamCapacityCard 
                    key={equipo.id} 
                    team={equipo} 
                    isFirst={index === 0}
                  />
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Footer con información del período */}
      <Row className="mt-4">
        <Col>
          <Card className="bg-light">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                  Datos actualizados: {data.fechaConsulta.toLocaleString()}
                </small>
                <small className="text-muted">
                  Período de análisis: {data.periodoAnalisis.desde.toLocaleDateString()} - {data.periodoAnalisis.hasta.toLocaleDateString()}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeamCapacityPage; 