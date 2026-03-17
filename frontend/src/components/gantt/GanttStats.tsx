import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faCalendarAlt, 
  faUsers, 
  faBuilding 
} from '@fortawesome/free-solid-svg-icons';
import { GanttFilters, GanttService } from '../../services/ganttService';
import { TaskStatus } from '../../types';

interface GanttStatsProps {
  filters: GanttFilters;
  tasksCount: number;
}

interface StatsData {
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasksByTeam: Record<string, number>;
  tasksByDepartment: Record<string, number>;
  timeRange: { start: Date; end: Date } | null;
}

const GanttStats: React.FC<GanttStatsProps> = ({ filters, tasksCount }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await GanttService.getGanttStats(filters);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (timeRange: { start: Date; end: Date } | null): string => {
    if (!timeRange) return 'Sin datos';
    
    const startStr = timeRange.start.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    const endStr = timeRange.end.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    return `${startStr} - ${endStr}`;
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'Backlog':
        return 'Backlog';
      case 'To Do':
        return 'To Do';
      case 'Doing':
        return 'En Progreso';
      case 'Demo':
        return 'Demo';
      case 'Done':
        return 'Completadas';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Backlog':
        return 'secondary';
      case 'To Do':
        return 'warning';
      case 'Doing':
        return 'primary';
      case 'Demo':
        return 'info';
      case 'Done':
        return 'success';
      default:
        return 'light';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 mb-0">Cargando estadísticas...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <Card.Body>
          <p className="text-muted mb-0">No se pudieron cargar las estadísticas.</p>
        </Card.Body>
      </Card>
    );
  }

  // Obtener los top 3 equipos y departamentos
  const topTeams = Object.entries(stats.tasksByTeam)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const topDepartments = Object.entries(stats.tasksByDepartment)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <Card className="mb-3">
      <Card.Body className="py-3">
        <Row className="align-items-center">
          {/* Estadísticas principales compactas */}
          <Col md={8}>
            <Row className="g-3">
              <Col sm={6} md={3}>
                <div className="d-flex align-items-center">
                  <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '2rem', height: '2rem' }}>
                    <FontAwesomeIcon icon={faTasks} size="sm" />
                  </div>
                  <div>
                    <div className="fw-bold h6 mb-0">{stats.totalTasks}</div>
                    <div className="text-muted small">Tareas</div>
                  </div>
                </div>
              </Col>
              
              <Col sm={6} md={3}>
                <div className="d-flex align-items-center">
                  <div className="bg-success text-white rounded d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '2rem', height: '2rem' }}>
                    <FontAwesomeIcon icon={faUsers} size="sm" />
                  </div>
                  <div>
                    <div className="fw-bold h6 mb-0">{Object.keys(stats.tasksByTeam).length}</div>
                    <div className="text-muted small">Equipos</div>
                  </div>
                </div>
              </Col>
              
              <Col sm={6} md={3}>
                <div className="d-flex align-items-center">
                  <div className="bg-warning text-white rounded d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '2rem', height: '2rem' }}>
                    <FontAwesomeIcon icon={faBuilding} size="sm" />
                  </div>
                  <div>
                    <div className="fw-bold h6 mb-0">{Object.keys(stats.tasksByDepartment).length}</div>
                    <div className="text-muted small">Deptos</div>
                  </div>
                </div>
              </Col>
              
              <Col sm={6} md={3}>
                <div className="d-flex align-items-center">
                  <div className="bg-info text-white rounded d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '2rem', height: '2rem' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} size="sm" />
                  </div>
                  <div>
                    <div className="fw-bold small mb-0">{formatDateRange(stats.timeRange)}</div>
                    <div className="text-muted small">Período</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>

          {/* Distribución por estado compacta */}
          <Col md={4}>
            <div className="border-start ps-3">
              <div className="fw-semibold small mb-2 text-muted">Estados:</div>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(stats.tasksByStatus).map(([status, count]) => {
                  if (count === 0) return null;
                  return (
                    <div key={status} className="d-flex align-items-center">
                      <div 
                        className={`bg-${getStatusColor(status)} rounded me-1`}
                        style={{ width: '8px', height: '8px' }}
                      ></div>
                      <span className="small me-1">{getStatusLabel(status)}:</span>
                      <span className="fw-bold small">{count}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Top equipos y departamentos en línea */}
              {(topTeams.length > 0 || topDepartments.length > 0) && (
                <div className="mt-2">
                  {topTeams.length > 0 && (
                    <div className="small text-muted">
                      <strong>Top Equipos:</strong> {topTeams.slice(0, 2).map(([team, count]) => `${team} (${count})`).join(', ')}
                    </div>
                  )}
                  {topDepartments.length > 0 && (
                    <div className="small text-muted">
                      <strong>Top Deptos:</strong> {topDepartments.slice(0, 2).map(([dept, count]) => `${dept} (${count})`).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GanttStats; 