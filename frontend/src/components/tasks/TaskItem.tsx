import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUsers, 
  faCalendarAlt, 
  faExclamationTriangle,
  faCheckCircle,
  faHourglass,
  faClock,
  faPlay,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { Task, TaskStatus } from '../../types';
import { getTeamNameById } from '../../services/dataAdapters';

interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
  actionButtons?: React.ReactNode;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick, actionButtons }) => {
  const [teamName, setTeamName] = useState<string>('Cargando...');

  useEffect(() => {
    // Cargar nombre del equipo si existe
    if (task.team) {
      getTeamNameById(task.team)
        .then(name => setTeamName(name))
        .catch(() => setTeamName('Error'));
    } else {
      setTeamName('Sin asignar');
    }
  }, [task.team]);
  
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.BACKLOG: return 'secondary';
      case TaskStatus.TODO: return 'warning';
      case TaskStatus.DOING: return 'primary';
      case TaskStatus.DEMO: return 'info';
      case TaskStatus.DONE: return 'success';
      default: return 'secondary';
    }
  };
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.BACKLOG: return faClock;
      case TaskStatus.TODO: return faPlay;
      case TaskStatus.DOING: return faHourglass;
      case TaskStatus.DEMO: return faEye;
      case TaskStatus.DONE: return faCheckCircle;
      default: return faClock;
    }
  };
  
  const getStatusText = (status: TaskStatus): string => {
    // Debug para entender qué status está llegando
    console.log(`🔍 TaskItem rendering status: "${status}" (type: ${typeof status}) for task ${task.id}`);
    
    switch (status) {
      case TaskStatus.BACKLOG: return 'Backlog';
      case TaskStatus.TODO: return 'To Do';
      case TaskStatus.DOING: return 'Doing';
      case TaskStatus.DEMO: return 'Demo';
      case TaskStatus.DONE: return 'Done';
      default: 
        console.log(`❌ Unknown status: "${status}" for task ${task.id}`);
        return `Desconocido (${status})`;
    }
  };
  
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      default: return 'secondary';
    }
  };
  
  const formatDate = (date: Date | undefined): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };
  
  return (
    <tr 
      className={`task-item ${onClick ? 'clickable' : ''}`}
      onClick={handleClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <td>
        <div className="d-flex align-items-center">
          <Badge 
            bg={getStatusColor(task.status)} 
            className="me-2"
          >
            <FontAwesomeIcon icon={getStatusIcon(task.status)} className="me-1" />
            {getStatusText(task.status)}
          </Badge>
        </div>
      </td>
      
      <td>
        <div>
          <strong>#{task.id}</strong>
          <div className="text-muted small">
            {task.departmentName || 'Sin departamento'}
          </div>
        </div>
      </td>
      
      <td>
        <div>
          <div className="fw-bold">{task.subject}</div>
          <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
            {task.description}
          </div>
        </div>
      </td>
      
      <td>
        <Badge bg={getPriorityColor(task.priority)}>
          Prioridad {task.priority}
        </Badge>
      </td>
      
      <td>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUser} className="me-1 text-muted" />
          <span className="small">
            {task.assignedToName || 'Sin asignar'}
          </span>
        </div>
      </td>
      
      <td>
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faUsers} className="me-1 text-muted" />
          <span className="small">
            {teamName}
          </span>
        </div>
      </td>
      
      <td>
        <div className="small">
          {task.sprints ? (
            <div>
              <div><strong>{task.sprints}</strong> sprint{task.sprints !== 1 ? 's' : ''}</div>
              {task.loadFactor && (
                <div className="text-muted">
                  {task.loadFactor} trabajador{task.loadFactor !== 1 ? 'es' : ''}
                </div>
              )}
            </div>
          ) : (
            '-'
          )}
        </div>
      </td>
      
      <td>
        <div className="small">
          <div>Inicio: {formatDate(task.startDate)}</div>
          <div>Fin: {formatDate(task.endDate)}</div>
        </div>
      </td>
      
      <td>
        <div className="d-flex gap-1">
          {!task.assignedTo && (
            <Badge bg="warning" className="small">Sin responsable</Badge>
          )}
          {!task.functional && (
            <Badge bg="warning" className="small">Sin funcional</Badge>
          )}
          {!task.sprints && task.status !== TaskStatus.BACKLOG && (
            <Badge bg="danger" className="small">Sin estimación</Badge>
          )}
        </div>
      </td>
      
      <td>
        {actionButtons}
      </td>
    </tr>
  );
};

export default TaskItem; 