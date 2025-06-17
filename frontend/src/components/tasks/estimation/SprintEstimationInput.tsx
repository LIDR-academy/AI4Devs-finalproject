import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface SprintEstimationInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  error?: string;
}

const SprintEstimationInput: React.FC<SprintEstimationInputProps> = ({
  value,
  onChange,
  disabled = false,
  error
}) => {
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const validateAndUpdate = (inputValue: string) => {
    setLocalValue(inputValue);
    setValidationError('');

    if (inputValue === '') {
      onChange(undefined);
      return;
    }

    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) {
      setValidationError('Debe ingresar un número válido');
      return;
    }

    if (numValue <= 0) {
      setValidationError('La estimación debe ser mayor a 0');
      return;
    }

    if (numValue > 50) {
      setValidationError('La estimación no puede ser mayor a 50 sprints');
      return;
    }

    // Permitir decimales para mayor flexibilidad (ej: 0.5, 1.5, etc.)
    onChange(numValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUpdate(e.target.value);
  };

  const handlePresetClick = (presetValue: number) => {
    validateAndUpdate(presetValue.toString());
  };

  const presetValues = [0.5, 1, 2, 3, 5, 8]; // Escala de Fibonacci modificada

  return (
    <div className="sprint-estimation-input">
      <Form.Group>
        <Form.Label className="fw-bold">
          <FontAwesomeIcon icon={faCalendarDays} className="me-2 text-primary" />
          Estimación en Sprints
        </Form.Label>
        
        <InputGroup className={error || validationError ? 'is-invalid' : ''}>
          <Form.Control
            type="number"
            step="0.5"
            min="0.5"
            max="50"
            placeholder="Ej: 2.5"
            value={localValue}
            onChange={handleInputChange}
            disabled={disabled}
            isInvalid={!!(error || validationError)}
          />
          <InputGroup.Text>sprints</InputGroup.Text>
        </InputGroup>

        {(error || validationError) && (
          <Form.Control.Feedback type="invalid">
            {error || validationError}
          </Form.Control.Feedback>
        )}

        <Form.Text className="text-muted d-flex align-items-center mt-2">
          <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
          1 sprint = 2 semanas de desarrollo
        </Form.Text>

        {/* Valores predefinidos para selección rápida */}
        <div className="mt-3">
          <Form.Text className="text-muted mb-2 d-block">
            <strong>Valores comunes:</strong>
          </Form.Text>
          <div className="d-flex flex-wrap gap-2">
            {presetValues.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`btn btn-outline-primary btn-sm ${
                  parseFloat(localValue) === preset ? 'active' : ''
                }`}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
              >
                {preset} sprint{preset !== 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Información contextual */}
        <Alert variant="info" className="mt-3 mb-0">
          <small>
            <strong>Guía de estimación:</strong>
            <ul className="mb-0 mt-1">
              <li><strong>0.5 sprints</strong> - Tareas muy pequeñas (1 semana)</li>
              <li><strong>1-2 sprints</strong> - Funcionalidades simples</li>
              <li><strong>3-5 sprints</strong> - Desarrollos medianos</li>
              <li><strong>8+ sprints</strong> - Proyectos grandes (considerar dividir)</li>
            </ul>
          </small>
        </Alert>
      </Form.Group>
    </div>
  );
};

export default SprintEstimationInput; 