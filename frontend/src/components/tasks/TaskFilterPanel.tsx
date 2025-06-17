import React, { useState } from 'react';
import { Card, Button, Collapse, Row, Col, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faChevronDown, 
  faChevronUp, 
  faTimes,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { TaskFilters, UserRole } from '../../types';
import TaskFiltersComponent from './TaskFilters';

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  userRole?: UserRole;
  userDepartment?: number;
  loading?: boolean;
}

const TaskFilterPanel: React.FC<TaskFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
  userRole,
  userDepartment,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(activeFiltersCount > 0);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setIsExpanded(false);
  };

  return (
    <Card className="mb-3 task-filter-panel">
      <Card.Header className="bg-light">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="p-0 text-decoration-none d-flex align-items-center"
                onClick={handleToggleExpanded}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={faFilter} 
                  className="me-2 text-primary" 
                />
                <span className="fw-semibold text-dark">
                  Filtros de búsqueda
                </span>
                {activeFiltersCount > 0 && (
                  <Badge 
                    bg="primary" 
                    className="ms-2"
                    title={`${activeFiltersCount} filtro${activeFiltersCount !== 1 ? 's' : ''} activo${activeFiltersCount !== 1 ? 's' : ''}`}
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
                <FontAwesomeIcon 
                  icon={isExpanded ? faChevronUp : faChevronDown} 
                  className="ms-2 text-muted" 
                  size="sm"
                />
              </Button>
            </div>
          </Col>
          
          <Col xs="auto">
            <div className="d-flex gap-2">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClearFilters}
                  disabled={loading}
                  title="Limpiar todos los filtros"
                >
                  <FontAwesomeIcon icon={faTimes} className="me-1" />
                  Limpiar filtros
                </Button>
              )}
              
              <Button
                variant={isExpanded ? "outline-primary" : "primary"}
                size="sm"
                onClick={handleToggleExpanded}
                disabled={loading}
              >
                <FontAwesomeIcon 
                  icon={isExpanded ? faChevronUp : faSearch} 
                  className="me-1" 
                />
                {isExpanded ? 'Ocultar' : 'Buscar'}
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Header>
      
      <Collapse in={isExpanded}>
        <div>
          <Card.Body>
            <TaskFiltersComponent
              filters={filters}
              onChange={onFiltersChange}
              userRole={userRole}
              userDepartment={userDepartment}
            />
            
            {activeFiltersCount > 0 && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
                  </small>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-decoration-none p-0"
                    onClick={handleClearFilters}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Limpiar todos
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
};

export default TaskFilterPanel; 