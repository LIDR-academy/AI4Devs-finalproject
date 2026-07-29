import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listAudiences } from '../api/client';
import { Select } from './ui';
import './AudienceSelect.css';

export type AudienceSelectProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
};

export function AudienceSelect({
  value,
  onChange,
  disabled,
  id = 'book-audience',
  label = 'Público objetivo',
  className = '',
}: AudienceSelectProps) {
  const { data: audiences = [], isLoading } = useQuery({
    queryKey: ['audiences'],
    queryFn: listAudiences,
  });

  if (!isLoading && audiences.length === 0) {
    return (
      <div className={`audience-select audience-select--empty ${className}`.trim()}>
        <p className="audience-select__empty-notice">
          Aún no tienes públicos objetivo.{' '}
          <Link to="/profile">Añádelos en Ajustes</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={`audience-select ${className}`.trim()}>
      <Select
        id={id}
        label={label}
        className="audience-select"
        value={value ?? ''}
        disabled={disabled || isLoading}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? null : next);
        }}
      >
        <option value="">—</option>
        {audiences.map((audience) => (
          <option key={audience.id} value={audience.id}>
            {audience.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
