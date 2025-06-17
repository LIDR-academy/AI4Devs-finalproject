import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { TeamCapacityStats } from '../../types';

interface CapacityStatsProps {
  stats: TeamCapacityStats;
}

export const CapacityStats: React.FC<CapacityStatsProps> = ({ stats }) => {
  const porcentajeOcupacionTotal = stats.capacidadTotalSistema > 0 
    ? Math.round((stats.cargaTotalSistema / stats.capacidadTotalSistema) * 100) 
    : 0;

  return (
    <Row>
      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className="h-100 border-primary">
          <Card.Body className="text-center">
            <div className="display-6 text-primary fw-bold">{stats.totalEquipos}</div>
            <div className="text-muted small">Total Equipos</div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className="h-100 border-success">
          <Card.Body className="text-center">
            <div className="display-6 text-success fw-bold">{stats.equiposDisponibles}</div>
            <div className="text-muted small">Equipos Disponibles</div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className="h-100 border-warning">
          <Card.Body className="text-center">
            <div className="display-6 text-warning fw-bold">{stats.equiposEnAdvertencia}</div>
            <div className="text-muted small">En Advertencia (&gt;90%)</div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} sm={6} lg={3} className="mb-3">
        <Card className="h-100 border-danger">
          <Card.Body className="text-center">
            <div className="display-6 text-danger fw-bold">{stats.equiposSobrecargados}</div>
            <div className="text-muted small">Sobrecargados (&gt;100%)</div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} lg={6} className="mb-3">
        <Card className="h-100">
          <Card.Body>
            <h6 className="card-title">Capacidad Total del Sistema</h6>
            <div className="d-flex justify-content-between">
              <span>Capacidad:</span>
              <span className="fw-bold">{stats.capacidadTotalSistema} sprints</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Carga actual:</span>
              <span className="fw-bold">{stats.cargaTotalSistema} sprints</span>
            </div>
            <div className="d-flex justify-content-between mt-2 pt-2 border-top">
              <span>Ocupación total:</span>
              <span className={`fw-bold ${porcentajeOcupacionTotal > 90 ? 'text-danger' : 'text-success'}`}>
                {porcentajeOcupacionTotal}%
              </span>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xs={12} lg={6} className="mb-3">
        <Card className="h-100 bg-light">
          <Card.Body>
            <h6 className="card-title">Resumen de Estado</h6>
            <div className="small">
              <div className="d-flex justify-content-between">
                <span className="text-success">● Disponibles:</span>
                <span>{stats.equiposDisponibles} equipos</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-warning">● En advertencia:</span>
                <span>{stats.equiposEnAdvertencia} equipos</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-danger">● Sobrecargados:</span>
                <span>{stats.equiposSobrecargados} equipos</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}; 