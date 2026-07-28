import { Button } from './ui';
import './TbrShared.css';

interface TbrEmptyStateProps {
  onAddBooks: () => void;
}

export function TbrEmptyState({ onAddBooks }: TbrEmptyStateProps) {
  return (
    <div className="tbr-empty-state">
      <p>
        Tu lista TBR está vacía. Añade libros de tu biblioteca para planificar qué
        leer este mes.
      </p>
      <Button type="button" onClick={onAddBooks}>
        Añadir libros
      </Button>
    </div>
  );
}
