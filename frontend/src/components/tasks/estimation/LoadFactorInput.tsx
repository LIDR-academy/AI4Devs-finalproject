import React, { useState, useEffect } from 'react';
import { Form, ButtonGroup, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faInfoCircle, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';

interface LoadFactorInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  error?: string;
}

const LoadFactorInput: React.FC<LoadFactorInputProps> = ({
  value,
  onChange,
  disabled = false,
  error
}) => {
  const [localValue, setLocalValue] = useState<number | undefined>(value);
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    setLocalValue(value);
    if (value && ![0.5, 1, 2, 3, 4, 5].includes(value)) {
      setShowCustomInput(true);
      setCustomValue(value.toString());
    } else {
      setShowCustomInput(false);
      setCustomValue('');
    }
  }, [value]);

  const loadFactorOptions = [
    { 
      value: 0.5, 
      label: '0.5', 
      description: 'Medio trabajador (50% dedicación)', 
      icon: faUser,
      variant: 'outline-info'
    },
    { 
      value: 1, 
      label: '1', 
      description: '1 trabajador a tiempo completo', 
      icon: faUser,
      variant: 'outline-primary'
    },
    { 
      value: 2, 
      label: '2', 
      description: '2 trabajadores a tiempo completo', 
      icon: faUsers,
      variant: 'outline-warning'
    },
    { 
      value: 3, 
      label: '3', 
      description: '3 trabajadores a tiempo completo', 
      icon: faUsers,
      variant: 'outline-warning'
    },
    { 
      value: 4, 
      label: '4', 
      description: '4 trabajadores a tiempo completo', 
      icon: faUsers,
      variant: 'outline-danger'
    },
    { 
      value: 5, 
      label: '5', 
      description: '5 trabajadores a tiempo completo', 
      icon: faUsers,
      variant: 'outline-danger'
    }
  ];

  const handleFactorSelect = (factorValue: number) => {
    setLocalValue(factorValue);
    setValidationError('');
    setShowCustomInput(false);
    setCustomValue('');
    onChange(factorValue);
  };

  const handleCustomValue = () => {
    setShowCustomInput(true);
    setLocalValue(undefined);
  };

  const validateAndUpdateCustom = (inputValue: string) => {
    setCustomValue(inputValue);
    setValidationError('');

    if (inputValue === '') {
      setLocalValue(undefined);
      onChange(undefined);
      return;
    }

    const numValue = parseFloat(inputValue);
    
    if (isNaN(numValue)) {
      setValidationError('Debe ingresar un número válido');
      return;
    }

    if (numValue <= 0) {
      setValidationError('El factor de carga debe ser mayor a 0');
      return;
    }

    if (numValue > 20) {
      setValidationError('El factor de carga no puede ser mayor a 20 trabajadores');
      return;
    }

    setLocalValue(numValue);
    onChange(numValue);
  };

  const getSelectedVariant = (optionValue: number): string => {
    if (localValue === optionValue) {
      const option = loadFactorOptions.find(opt => opt.value === optionValue);
      return option?.variant.replace('outline-', '') || 'primary';
    }
    return loadFactorOptions.find(opt => opt.value === optionValue)?.variant || 'outline-primary';
  };

  return (
    <div className="load-factor-input">
      <Form.Group>
        <Form.Label className="fw-bold">
          <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
          Factor de Carga
        </Form.Label>

        <div className="mb-3">
          <ButtonGroup className="w-100 flex-wrap">
            {loadFactorOptions.map((option) => (
              <OverlayTrigger
                key={option.value}
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-${option.value}`}>
                    {option.description}
                  </Tooltip>
                }
              >
                <Button
                  variant={getSelectedVariant(option.value)}
                  size="sm"
                  className="flex-fill"
                  onClick={() => handleFactorSelect(option.value)}
                  disabled={disabled}
                  active={localValue === option.value && !showCustomInput}
                >
                  <FontAwesomeIcon icon={option.icon} className="me-1" />
                  {option.label}
                </Button>
              </OverlayTrigger>
            ))}
            <Button
              variant={showCustomInput ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={handleCustomValue}
              disabled={disabled}
            >
              <FontAwesomeIcon icon={faUserPlus} className="me-1" />
              Otro
            </Button>
          </ButtonGroup>
        </div>

        {showCustomInput && (
          <div className="mb-3">
            <Form.Label className="small text-muted">Valor personalizado:</Form.Label>
            <Form.Control
              type="number"
              step="0.5"
              min="0.5"
              max="20"
              placeholder="Ej: 6.5"
              value={customValue}
              onChange={(e) => validateAndUpdateCustom(e.target.value)}
              disabled={disabled}
              isInvalid={!!(error || validationError)}
              size="sm"
            />
            {(error || validationError) && (
              <Form.Control.Feedback type="invalid">
                {error || validationError}
              </Form.Control.Feedback>
            )}
          </div>
        )}

        <Form.Text className="text-muted d-flex align-items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
          Representa la cantidad de trabajadores a tiempo completo necesarios
        </Form.Text>

        {/* Información contextual */}
        <Alert variant="info" className="mt-3 mb-0">
          <small>
            <strong>Guía de factor de carga:</strong>
            <ul className="mb-0 mt-1">
              <li><strong>0.5</strong> - Tareas que requieren medio trabajador</li>
              <li><strong>1</strong> - Una persona a jornada completa</li>
              <li><strong>2-3</strong> - Proyectos medianos con equipo pequeño</li>
              <li><strong>4-5</strong> - Proyectos grandes con equipo dedicado</li>
              <li><strong>Más de 5</strong> - Proyectos muy complejos (considerar dividir)</li>
            </ul>
          </small>
        </Alert>

        {localValue && (
          <div className="mt-2">
            <small className="text-success">
              <strong>Seleccionado:</strong> {localValue} trabajador{localValue !== 1 ? 'es' : ''} 
              {localValue < 1 ? ' a tiempo parcial' : ' a tiempo completo'}
            </small>
          </div>
        )}
      </Form.Group>
    </div>
  );
};

export default LoadFactorInput; 