import React, { useState } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Button, Collapse, Table } from 'react-bootstrap';
import { TeamCapacity } from '../../types';

interface TeamCapacityCardProps {
  team: TeamCapacity;
  isFirst: boolean;
}

export const TeamCapacityCard: React.FC<TeamCapacityCardProps> = ({ team, isFirst }) => {
  const [showTasks, setShowTasks] = useState(false);

  const getStatusVariant = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'danger';
      case 'advertencia':
        return 'warning';
      default:
        return 'success';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'critico':
        return 'Sobrecargado';
      case 'advertencia':
        return 'Advertencia';
      default:
        return 'Normal';
    }
  };

  const getProgressVariant = (porcentaje: number) => {
    if (porcentaje > 100) return 'danger';
    if (porcentaje > 90) return 'warning';
    return 'success';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className={`mb-3 ${isFirst ? 'border-top-0' : ''}`}>
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="mb-1">
                  {team.nombre}
                  <Badge 
                    bg={team.tipo === 'INTERNO' ? 'primary' : 'secondary'} 
                    className="ms-2"
                  >
                    {team.tipo === 'INTERNO' ? 'Interno' : 'Externo'}
                  </Badge>
                </h5>
                <small className="text-muted">
                  {team.totalTareasAsignadas} tarea(s) asignada(s)
                </small>
              </div>
              <Badge bg={getStatusVariant(team.estadoSobrecarga)}>
                {getStatusText(team.estadoSobrecarga)}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small">Ocupación</span>
                <span className="small fw-bold">
                  {team.porcentajeOcupacion}% ({team.cargaActual}/{team.capacidadTotal})
                </span>
              </div>
              <ProgressBar 
                now={Math.min(team.porcentajeOcupacion, 100)} 
                variant={getProgressVariant(team.porcentajeOcupacion)}
                style={{ height: '8px' }}
              />
              {team.porcentajeOcupacion > 100 && (
                <div className="text-danger small mt-1">
                  Sobrecarga: +{team.porcentajeOcupacion - 100}%
                </div>
              )}
            </div>
          </Col>

          <Col md={4}>
            <div className="text-end">
              <div className="mb-2">
                <div className="small text-muted">Disponibilidad</div>
                <div className="h6 mb-0">
                  {team.disponibilidad > 0 ? (
                    <span className="text-success">{team.disponibilidad} sprints</span>
                  ) : (
                    <span className="text-danger">Sin disponibilidad</span>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <div className="small text-muted">Próxima fecha disponible</div>
                <div className="small">
                  {formatDate(team.proximaFechaDisponible)}
                </div>
              </div>

              {team.tareasActuales.length > 0 && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowTasks(!showTasks)}
                  aria-expanded={showTasks}
                  aria-controls={`tasks-${team.id}`}
                >
                  {showTasks ? 'Ocultar' : 'Ver'} tareas ({team.tareasActuales.length})
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <Collapse in={showTasks}>
          <div id={`tasks-${team.id}`}>
            <hr />
            <h6>Tareas Actuales</h6>
            <Table size="sm" responsive>
              <thead>
                <tr>
                  <th>ID Redmine</th>
                  <th>Factor Carga</th>
                  <th>Sprints</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Asignado</th>
                </tr>
              </thead>
              <tbody>
                {team.tareasActuales.map((tarea) => (
                  <tr key={tarea.id}>
                    <td>#{tarea.redmineTaskId}</td>
                    <td>{tarea.factorCarga}</td>
                    <td>{tarea.estimacionSprints || '-'}</td>
                    <td>
                      {tarea.fechaInicio ? formatDate(tarea.fechaInicio) : '-'}
                    </td>
                    <td>
                      {tarea.fechaFin ? formatDate(tarea.fechaFin) : '-'}
                    </td>
                    <td>
                      {formatDate(tarea.fechaAsignacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Collapse>
      </Card.Body>
    </Card>
  );
}; 