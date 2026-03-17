import React from 'react';
import { ButtonGroup, Button, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarDay, 
  faCalendarWeek, 
  faCalendarAlt, 
  faDownload,
  faEye
} from '@fortawesome/free-solid-svg-icons';

interface GanttControlsProps {
  viewMode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month';
  onViewModeChange: (viewMode: 'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month') => void;
  onExportPDF: () => void;
  tasksCount: number;
}

const GanttControls: React.FC<GanttControlsProps> = ({
  viewMode,
  onViewModeChange,
  onExportPDF,
  tasksCount
}) => {
  const viewModeOptions = [
    { value: 'Quarter Day', label: 'Cuarto de Día', icon: faCalendarDay },
    { value: 'Half Day', label: 'Medio Día', icon: faCalendarDay },
    { value: 'Day', label: 'Día', icon: faCalendarDay },
    { value: 'Week', label: 'Semana', icon: faCalendarWeek },
    { value: 'Month', label: 'Mes', icon: faCalendarAlt }
  ] as const;

  const getCurrentViewModeLabel = () => {
    const option = viewModeOptions.find(opt => opt.value === viewMode);
    return option ? option.label : 'Semana';
  };

  const getCurrentViewModeIcon = () => {
    const option = viewModeOptions.find(opt => opt.value === viewMode);
    return option ? option.icon : faCalendarWeek;
  };

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Contador de tareas */}
      <span className="text-muted small me-3">
        {tasksCount} tareas mostradas
      </span>

      {/* Selector de modo de vista */}
      <Dropdown as={ButtonGroup}>
        <Button variant="outline-secondary" size="sm">
          <FontAwesomeIcon icon={getCurrentViewModeIcon()} className="me-2" />
          <FontAwesomeIcon icon={faEye} className="me-2" />
          {getCurrentViewModeLabel()}
        </Button>

        <Dropdown.Toggle 
          split 
          variant="outline-secondary" 
          size="sm"
          id="dropdown-split-basic" 
        />

        <Dropdown.Menu>
          <Dropdown.Header>Modo de Vista</Dropdown.Header>
          {viewModeOptions.map((option) => (
            <Dropdown.Item
              key={option.value}
              active={viewMode === option.value}
              onClick={() => onViewModeChange(option.value)}
            >
              <FontAwesomeIcon icon={option.icon} className="me-2" />
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Botón de exportar */}
      <Button 
        variant="outline-primary" 
        size="sm"
        onClick={onExportPDF}
        title="Exportar a PDF"
      >
        <FontAwesomeIcon icon={faDownload} className="me-2" />
        Exportar
      </Button>
    </div>
  );
};

export default GanttControls; 