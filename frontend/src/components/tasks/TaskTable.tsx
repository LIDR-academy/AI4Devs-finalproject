import React from 'react';
import { Table, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSort, 
  faSortUp, 
  faSortDown, 
  faCalculator, 
  faCalendarPlus 
} from '@fortawesome/free-solid-svg-icons';
import { Task, TaskStatus, UserRole, PaginationInfo, SortConfig } from '../../types';
import { useAuth } from '../../context/AuthContext';
import TaskItem from './TaskItem';

interface TaskTableProps {
  tasks: Task[];
  loading?: boolean;
  error?: string;
  pagination?: PaginationInfo;
  sort?: SortConfig;
  onTaskClick?: (task: Task) => void;
  onPageChange?: (page: number) => void;
  onSortChange?: (field: string) => void;
  onEstimateTask?: (task: Task) => void;
  onPlanTask?: (task: Task) => void;
}

const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  loading = false,
  error,
  pagination,
  sort,
  onTaskClick,
  onPageChange,
  onSortChange,
  onEstimateTask,
  onPlanTask
}) => {
  
  const { user } = useAuth();
  
  const getSortIcon = (field: string) => {
    if (!sort || sort.field !== field) return faSort;
    return sort.direction === 'asc' ? faSortUp : faSortDown;
  };
  
  const handleSort = (field: string) => {
    if (onSortChange) {
      onSortChange(field);
    }
  };

  // Condiciones para habilitar botones según los nuevos estados
  const canEstimate = (task: Task): boolean => {
    // Se puede estimar cuando está en Backlog (pendiente de estimar)
    return user?.role === UserRole.TECNOLOGIA && task.status === TaskStatus.BACKLOG;
  };

  const canPlan = (task: Task): boolean => {
    // Se puede planificar cuando está en Backlog y ya tiene estimación, o cuando está en To Do sin equipo
    return user?.role === UserRole.TECNOLOGIA && 
           (
             // Caso 1: En Backlog con estimación (puede asignar equipo)
             (task.status === TaskStatus.BACKLOG && !!task.sprints && !!task.loadFactor) ||
             // Caso 2: En To Do sin equipo asignado (puede reasignar equipo)
             (task.status === TaskStatus.TODO && !!task.sprints && !!task.loadFactor && !task.team)
           );
  };

  const canChangeStatus = (task: Task, newStatus: TaskStatus): boolean => {
    const currentStatus = task.status;
    
    // Transiciones permitidas según el flujo de trabajo
    switch (newStatus) {
      case TaskStatus.TODO:
        return currentStatus === TaskStatus.BACKLOG && !!task.sprints && !!task.team;
      case TaskStatus.DOING:
        return currentStatus === TaskStatus.TODO && !!task.startDate;
      case TaskStatus.DEMO:
        return currentStatus === TaskStatus.DOING;
      case TaskStatus.DONE:
        return currentStatus === TaskStatus.DEMO;
      default:
        return false;
    }
  };

  const renderActionButtons = (task: Task) => {
    return (
      <div className="d-flex gap-1">
        {canEstimate(task) && (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEstimateTask?.(task);
            }}
            title="Estimar tarea"
          >
            <FontAwesomeIcon icon={faCalculator} />
          </Button>
        )}
        {canPlan(task) && (
          <Button
            variant="outline-success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlanTask?.(task);
            }}
            title="Planificar tarea"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
          </Button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    const items = [];
    const { currentPage, totalPages } = pagination;
    
    // Botón anterior
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => onPageChange && onPageChange(currentPage - 1)}
      />
    );
    
    // Páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => onPageChange && onPageChange(1)}>1</Pagination.Item>);
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange && onPageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={totalPages} 
          onClick={() => onPageChange && onPageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }
    
    // Botón siguiente
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange && onPageChange(currentPage + 1)}
      />
    );
    
    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2">Cargando tareas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Alert variant="info" className="m-3">
        No se encontraron tareas que coincidan con los criterios de búsqueda.
      </Alert>
    );
  }

  return (
    <div className="task-table">
      <div className="table-responsive">
        <Table hover striped>
          <thead className="table-dark">
            <tr>
              <th 
                style={{ cursor: onSortChange ? 'pointer' : 'default' }}
                onClick={() => handleSort('status')}
              >
                Estado
                {onSortChange && (
                  <FontAwesomeIcon 
                    icon={getSortIcon('status')} 
                    className="ms-1" 
                  />
                )}
              </th>
              <th 
                style={{ cursor: onSortChange ? 'pointer' : 'default' }}
                onClick={() => handleSort('id')}
              >
                ID / Departamento
                {onSortChange && (
                  <FontAwesomeIcon 
                    icon={getSortIcon('id')} 
                    className="ms-1" 
                  />
                )}
              </th>
              <th 
                style={{ cursor: onSortChange ? 'pointer' : 'default' }}
                onClick={() => handleSort('subject')}
              >
                Tarea
                {onSortChange && (
                  <FontAwesomeIcon 
                    icon={getSortIcon('subject')} 
                    className="ms-1" 
                  />
                )}
              </th>
              <th 
                style={{ cursor: onSortChange ? 'pointer' : 'default' }}
                onClick={() => handleSort('priority')}
              >
                Prioridad
                {onSortChange && (
                  <FontAwesomeIcon 
                    icon={getSortIcon('priority')} 
                    className="ms-1" 
                  />
                )}
              </th>
              <th>Responsable</th>
              <th>Equipo</th>
              <th>Estimación / Recursos</th>
              <th>Fechas</th>
              <th>Alertas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={onTaskClick}
                actionButtons={renderActionButtons(task)}
              />
            ))}
          </tbody>
        </Table>
      </div>
      {renderPagination()}
    </div>
  );
};

export default TaskTable; 