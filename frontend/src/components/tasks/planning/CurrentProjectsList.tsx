import React, { useState } from 'react';
import { Collapse, Badge, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronDown, 
  faChevronUp, 
  faCalendarAlt, 
  faClock,
  faUser,
  faBuilding,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { CurrentProject } from '../../../types';
import './CurrentProjectsList.css';

interface CurrentProjectsListProps {
  projects: CurrentProject[];
  teamName: string;
}

const CurrentProjectsList: React.FC<CurrentProjectsListProps> = ({ projects, teamName }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: CurrentProject['status']) => {
    switch (status) {
      case 'doing':
        return <Badge bg="primary" className="status-badge">En Progreso</Badge>;
      case 'demo':
        return <Badge bg="warning" text="dark" className="status-badge">En Demo</Badge>;
      case 'todo':
        return <Badge bg="info" className="status-badge">Por Iniciar</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge">Unknown</Badge>;
    }
  };

  const getStatusClass = (status: CurrentProject['status']): string => {
    switch (status) {
      case 'doing':
        return 'project-in-progress';
      case 'demo':
        return 'project-finishing-soon';
      case 'todo':
        return 'project-starting-soon';
      default:
        return '';
    }
  };

  const getDurationText = (startDate: Date, endDate: Date): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    
    if (weeks === 0) {
      return `${days} día${days !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return `${weeks} semana${weeks !== 1 ? 's' : ''}`;
    } else {
      return `${weeks}s ${days}d`;
    }
  };

  if (projects.length === 0) {
    return (
      <div className="current-projects-empty">
        <small className="text-muted">
          <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
          Sin proyectos actuales
        </small>
      </div>
    );
  }

  return (
    <div className="current-projects-container">
      <div className="current-projects-header">
        <div 
          className="d-flex align-items-center justify-content-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="d-flex align-items-center">
            <small className="text-muted me-2">Proyectos actuales:</small>
            <Badge bg="secondary" className="projects-count">
              {projects.length}
            </Badge>
          </div>
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronUp : faChevronDown} 
            className="text-muted expand-icon"
            size="sm"
          />
        </div>
        
        {/* Vista resumida cuando está colapsado */}
        {!isExpanded && (
          <div className="projects-summary mt-1">
            <div className="projects-summary-row">
              {projects.slice(0, 2).map((project, index) => (
                <div key={project.id} className={`project-summary-item ${getStatusClass(project.status)}`}>
                  <small>
                    <strong>{project.name}</strong>
                    <span className="text-muted ms-1">
                      ({project.department || 'Sin Depto'})
                    </span>
                    <span className="text-muted ms-1">
                      - {project.loadFactor} trab., {project.sprints || '?'} sprints
                    </span>
                  </small>
                </div>
              ))}
              {projects.length > 2 && (
                <small className="text-muted">
                  y {projects.length - 2} más...
                </small>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vista expandida */}
      <Collapse in={isExpanded}>
        <div className="projects-detailed-view">
          {projects.map((project, index) => (
            <div key={project.id} className={`project-detail-card ${getStatusClass(project.status)}`}>
              <Row className="g-2">
                <Col xs={12}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="project-name">
                      <strong>{project.name}</strong>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </Col>
                
                <Col sm={6}>
                  <div className="project-date-info">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1 text-primary" />
                    <small>
                      <strong>Inicio:</strong> {formatDate(project.startDate)}
                    </small>
                  </div>
                </Col>
                
                <Col sm={6}>
                  <div className="project-date-info">
                    <FontAwesomeIcon icon={faClock} className="me-1 text-primary" />
                    <small>
                      <strong>Fin:</strong> {formatDate(project.endDate)}
                    </small>
                  </div>
                </Col>
                
                <Col sm={4}>
                  <div className="project-info">
                    <FontAwesomeIcon icon={faBuilding} className="me-1 text-muted" />
                    <small>
                      <strong>Depto:</strong> {project.department || 'Sin Departamento'}
                    </small>
                  </div>
                </Col>
                
                <Col sm={4}>
                  <div className="project-info">
                    <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
                    <small>
                      <strong>Carga:</strong> {project.loadFactor} trabajador{project.loadFactor !== 1 ? 'es' : ''}
                    </small>
                  </div>
                </Col>
                
                <Col sm={4}>
                  <div className="project-info">
                    <FontAwesomeIcon icon={faLayerGroup} className="me-1 text-muted" />
                    <small>
                      <strong>Sprints:</strong> {project.sprints || 'No estimado'}
                    </small>
                  </div>
                </Col>
              </Row>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

export default CurrentProjectsList; 