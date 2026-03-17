import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SearchParams } from '../../types';

interface TaskSearchProps {
  search: SearchParams;
  onChange: (search: SearchParams) => void;
  placeholder?: string;
}

const TaskSearch: React.FC<TaskSearchProps> = ({
  search,
  onChange,
  placeholder = "Buscar en tareas..."
}) => {
  const [localQuery, setLocalQuery] = useState(search.query);
  
  // Debounce para evitar demasiadas búsquedas
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({
        ...search,
        query: localQuery
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localQuery, search, onChange]);
  
  const handleClear = () => {
    setLocalQuery('');
    onChange({
      ...search,
      query: ''
    });
  };
  
  return (
    <div className="task-search">
      <Form.Group>
        <Form.Label>Búsqueda</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          {localQuery && (
            <Button
              variant="outline-secondary"
              onClick={handleClear}
              title="Limpiar búsqueda"
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          )}
        </InputGroup>
        <Form.Text className="text-muted">
          Busca en título y descripción de las tareas
        </Form.Text>
      </Form.Group>
    </div>
  );
};

export default TaskSearch; 