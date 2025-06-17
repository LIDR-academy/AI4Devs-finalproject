import React, { useState, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { TaskFilters as ITaskFilters, TaskStatus, UserRole, Team, Department } from '../../types';
import { teamService, departmentService } from '../../services/api';
import { adaptBackendTeamsResponse, adaptBackendDepartmentsResponse } from '../../services/dataAdapters';

interface TaskFiltersProps {
  filters: ITaskFilters;
  onChange: (filters: ITaskFilters) => void;
  userRole?: UserRole;
  userDepartment?: number;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onChange,
  userRole,
  userDepartment
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [departmentsResponse, teamsResponse] = await Promise.all([
        departmentService.getDepartments(),
        teamService.getTeams()
      ]);

      const departmentsData = adaptBackendDepartmentsResponse(departmentsResponse);
      const teamsData = adaptBackendTeamsResponse(teamsResponse);

      setDepartments(departmentsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading filter options:', error);
      setError('Error al cargar opciones de filtros');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof ITaskFilters, value: any) => {
    onChange({
      ...filters,
      [field]: value === '' ? undefined : value
    });
  };
  
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({
      ...filters,
      [field]: value ? new Date(value) : undefined
    });
  };
  
  // Filtrar departamentos según el rol del usuario
  const availableDepartments = userRole === UserRole.NEGOCIO && userDepartment
    ? departments.filter(dept => dept.id === userDepartment)
    : departments;
  
  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  return (
    <div className="task-filters">
      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Departamento</Form.Label>
            <Form.Select
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', parseInt(e.target.value) || undefined)}
              disabled={loading}
            >
              <option value="">
                {loading ? 'Cargando departamentos...' : 'Todos los departamentos'}
              </option>
              {!loading && availableDepartments.length === 0 && (
                <option value="" disabled>No hay departamentos disponibles</option>
              )}
              {availableDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </Form.Select>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">Todos los estados</option>
              <option value={TaskStatus.BACKLOG}>Backlog</option>
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.DOING}>Doing</option>
              <option value={TaskStatus.DEMO}>Demo</option>
              <option value={TaskStatus.DONE}>Done</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Prioridad</Form.Label>
            <Form.Select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', parseInt(e.target.value) || undefined)}
            >
              <option value="">Todas las prioridades</option>
              <option value={1}>Prioridad 1 (Alta)</option>
              <option value={2}>Prioridad 2 (Media)</option>
              <option value={3}>Prioridad 3 (Baja)</option>
            </Form.Select>
          </Form.Group>
        </Col>
        
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Equipo</Form.Label>
            <Form.Select
              value={filters.team || ''}
              onChange={(e) => handleFilterChange('team', parseInt(e.target.value) || undefined)}
              disabled={loading}
            >
              <option value="">
                {loading ? 'Cargando equipos...' : 'Todos los equipos'}
              </option>
              {!loading && teams.length === 0 && (
                <option value="" disabled>No hay equipos disponibles</option>
              )}
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.isExternal ? '(Externo)' : '(Interno)'}
                </option>
              ))}
            </Form.Select>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de inicio (desde)</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(filters.startDate)}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </Form.Group>
        </Col>
        
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Fecha de fin (hasta)</Form.Label>
            <Form.Control
              type="date"
              value={formatDateForInput(filters.endDate)}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={4}>
          <Form.Check
            type="checkbox"
            label="Solo tareas sin responsable"
            checked={filters.hasResponsible === false}
            onChange={(e) => handleFilterChange('hasResponsible', e.target.checked ? false : undefined)}
          />
        </Col>
        
        <Col md={4}>
          <Form.Check
            type="checkbox"
            label="Solo tareas sin funcional"
            checked={filters.hasFunctional === false}
            onChange={(e) => handleFilterChange('hasFunctional', e.target.checked ? false : undefined)}
          />
        </Col>
        
        <Col md={4}>
          <Form.Check
            type="checkbox"
            label="Solo tareas sin estimación"
            checked={filters.hasEstimation === false}
            onChange={(e) => handleFilterChange('hasEstimation', e.target.checked ? false : undefined)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default TaskFiltersComponent; 