import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faExclamationTriangle, 
  faCheck, 
  faHourglass,
  faClock,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  calculateDashboardMetrics, 
  getUpcomingDeadlines, 
  getHighLoadTeams,
  getAllTeamsWithUtilization,
  DashboardMetrics 
} from '../services/dashboardService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [highLoadTeams, setHighLoadTeams] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Cargar métricas desde el backend
        const dashboardMetrics = await calculateDashboardMetrics();
        setMetrics(dashboardMetrics);
        
        // Cargar fechas límite próximas (aún desde mock)
        setUpcomingDeadlines(getUpcomingDeadlines());
        
        // Cargar todos los equipos con su utilización
        const allTeamsData = await getAllTeamsWithUtilization();
        setAllTeams(allTeamsData);
        
        // Cargar equipos con alta carga (filtrado de todos los equipos)
        const highLoadTeamsData = await getHighLoadTeams();
        setHighLoadTeams(highLoadTeamsData);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Error al cargar datos del dashboard. Verifique su conexión.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Determina qué elementos mostrar según el rol
  const isNegocio = user?.role === UserRole.NEGOCIO;
  const isTecnologia = user?.role === UserRole.TECNOLOGIA;

  if (isLoading) {
    return <div className="d-flex justify-content-center p-4">Cargando métricas...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h4>Error al cargar el Dashboard</h4>
        <p>{error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) {
    return <div className="d-flex justify-content-center p-4">No hay datos disponibles.</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* Primera fila: KPIs */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted">Total Tareas</h6>
                  <h2 className="mt-2 mb-0">{metrics.totalTasks}</h2>
                </div>
                <div className="dashboard-icon">
                  <FontAwesomeIcon icon={faTasks} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted">Pendientes</h6>
                  <h2 className="mt-2 mb-0">{metrics.pendingTasks}</h2>
                </div>
                <div className="dashboard-icon warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted">En Progreso</h6>
                  <h2 className="mt-2 mb-0">{metrics.inProgressTasks}</h2>
                </div>
                <div className="dashboard-icon info">
                  <FontAwesomeIcon icon={faHourglass} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-subtitle text-muted">Completadas</h6>
                  <h2 className="mt-2 mb-0">{metrics.completedTasks}</h2>
                </div>
                <div className="dashboard-icon success">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Segunda fila: Utilización de equipos (izquierda) + Estado de equipos (derecha) */}
      {isTecnologia && (
        <Row className="mb-4">
          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Utilización de Equipos ({metrics.teamUtilization}% promedio)
              </Card.Header>
              <Card.Body className="p-0">
                {allTeams.length > 0 ? (
                  <div className="team-utilization-scroll">
                    <div className="p-3">
                      {allTeams
                        .sort((a, b) => b.utilization - a.utilization) // Ordenar por utilización descendente
                        .slice(0, 10) // Mostrar solo los primeros 10 equipos
                        .map((team, index) => (
                        <div key={team.id} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="team-name">{team.name}</span>
                            <span className={`badge ${team.utilization > 100 ? 'bg-danger' : team.utilization > 80 ? 'bg-warning' : 'bg-success'}`}>
                              {team.utilization}%
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <small className="text-muted">
                              {team.currentLoad.toFixed(1)}/{team.capacity.toFixed(1)} capacidad
                            </small>
                            <small className="text-muted">
                              {team.isExternal ? 'Externo' : 'Interno'}
                            </small>
                          </div>
                          <ProgressBar 
                            now={Math.min(team.utilization, 100)} 
                            variant={team.utilization > 100 ? 'danger' : team.utilization > 80 ? 'warning' : 'success'}
                            style={{ height: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3">
                    <p className="text-muted">No hay datos de equipos disponibles.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card>
              <Card.Header>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Estado de Equipos
              </Card.Header>
              <Card.Body>
                {allTeams.length > 0 ? (
                  <div className="team-status">
                    <div className="row text-center mb-3">
                      <div className="col-4">
                        <div className="status-metric">
                          <h4 className="text-success">
                            {allTeams.filter(t => t.utilization < 80).length}
                          </h4>
                          <small className="text-muted">Disponibles</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="status-metric">
                          <h4 className="text-warning">
                            {allTeams.filter(t => t.utilization >= 80 && t.utilization <= 100).length}
                          </h4>
                          <small className="text-muted">Alta Carga</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="status-metric">
                          <h4 className="text-danger">
                            {allTeams.filter(t => t.utilization > 100).length}
                          </h4>
                          <small className="text-muted">Sobrecargados</small>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <small className="text-muted">
                        Total de equipos activos: <strong>{allTeams.length}</strong>
                      </small>
                      <br />
                      <small className="text-muted">
                        Utilización promedio global: <strong>{metrics.teamUtilization}%</strong>
                      </small>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center">No hay datos de equipos disponibles</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Fila para usuarios de negocio: Distribución por departamento */}
      {isNegocio && (
        <Row className="mb-4">
          <Col md={12} className="mb-4">
            <Card>
              <Card.Header>
                <FontAwesomeIcon icon={faTasks} className="me-2" />
                Tareas por Departamento
              </Card.Header>
              <Card.Body>
                {metrics.departmentDistribution.length > 0 ? (
                  <div className="department-distribution">
                    {metrics.departmentDistribution.map((dept, index) => (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="department-name">{dept.department}</span>
                          <span className="badge bg-primary">{dept.count} tareas</span>
                        </div>
                        <ProgressBar 
                          now={dept.percentage} 
                          label={`${dept.percentage}%`}
                          variant={dept.percentage > 20 ? 'primary' : 'secondary'}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No hay datos de distribución disponibles.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tercera fila: Fechas límite (izquierda) + Alertas (derecha) */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <FontAwesomeIcon icon={faClock} className="me-2" />
              Próximas Fechas Límite
            </Card.Header>
            <Card.Body>
              {/* Advertencia de datos pendientes */}
              <div className="alert alert-info alert-dismissible mb-3" role="alert">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                <strong>Funcionalidad pendiente:</strong> Esta sección mostrará las tareas próximas a vencer. 
                Actualmente muestra datos de ejemplo.
              </div>
              
              {/* Datos mock para demostración */}
              <Table striped size="sm">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Departamento</th>
                    <th>Días Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <small className="text-muted">#1234</small>
                      <br />
                      Sistema de autenticación
                    </td>
                    <td>Tecnología</td>
                    <td>
                      <span className="badge bg-danger">
                        2 días
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <small className="text-muted">#1235</small>
                      <br />
                      Migración de base de datos
                    </td>
                    <td>Tecnología</td>
                    <td>
                      <span className="badge bg-warning">
                        4 días
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <small className="text-muted">#1236</small>
                      <br />
                      Análisis de rendimiento
                    </td>
                    <td>Calidad</td>
                    <td>
                      <span className="badge bg-info">
                        7 días
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <small className="text-muted">#1237</small>
                      <br />
                      Documentación técnica
                    </td>
                    <td>Tecnología</td>
                    <td>
                      <span className="badge bg-info">
                        10 días
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              Alertas Críticas ({metrics.criticalAlerts})
            </Card.Header>
            <Card.Body>
              {/* Advertencia de datos mockeados */}
              <div className="alert alert-warning alert-dismissible mb-3" role="alert">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <strong>Datos de prueba:</strong> Las alertas mostradas son datos simulados. 
                Pendiente de conectar con el sistema de alertas en tiempo real.
              </div>
              
              {metrics.alerts.length > 0 ? (
                <ul className="alert-list">
                  {metrics.alerts.map((alert) => (
                    <li key={alert.id} className="alert-item">
                      <span className="alert-icon">
                        <FontAwesomeIcon icon={faExclamationTriangle} />
                      </span>
                      <span className="alert-text">{alert.message}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted text-center">
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  No hay alertas críticas en este momento
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 