import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listGenres } from '../api/client';
import { Select } from './ui';
import './GenreSelect.css';

export type GenreSelectProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  className?: string;
};

export function GenreSelect({
  value,
  onChange,
  disabled,
  id = 'book-genre',
  label = 'Género',
  className = '',
}: GenreSelectProps) {
  const { data: genres = [], isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: listGenres,
  });

  if (!isLoading && genres.length === 0) {
    return (
      <div className={`genre-select genre-select--empty ${className}`.trim()}>
        <p className="genre-select__empty-notice">
          Aún no tienes géneros.{' '}
          <Link to="/profile">Añádelos en Ajustes</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={`genre-select ${className}`.trim()}>
      <Select
        id={id}
        label={label}
        className="genre-select"
        value={value ?? ''}
        disabled={disabled || isLoading}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? null : next);
        }}
      >
        <option value="">—</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
