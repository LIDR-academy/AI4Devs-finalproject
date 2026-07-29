import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listFormats } from '../api/client';
import { Select } from './ui';
import './ReadFormatSelect.css';

export type ReadFormatSelectProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
};

export function ReadFormatSelect({
  value,
  onChange,
  disabled,
  id = 'book-read-format',
  label = 'Formato',
  className = '',
}: ReadFormatSelectProps) {
  const { data: formats = [], isLoading } = useQuery({
    queryKey: ['formats'],
    queryFn: listFormats,
  });

  if (!isLoading && formats.length === 0) {
    return (
      <div className={`read-format-select read-format-select--empty ${className}`.trim()}>
        <p className="read-format-select__empty-notice">
          Aún no tienes formatos. <Link to="/profile">Añádelos en Ajustes</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={`read-format-select ${className}`.trim()}>
      <Select
        id={id}
        label={label}
        value={value ?? ''}
        disabled={disabled || isLoading}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? null : next);
        }}
      >
        <option value="">—</option>
        {formats.map((format) => (
          <option key={format.id} value={format.id}>
            {format.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
