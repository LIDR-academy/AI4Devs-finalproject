import React, { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw, Search } from 'lucide-react';
import { StockService, StockMovementHistoryItem } from '../services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import styles from './MovementHistoryPanel.module.css';

interface MovementHistoryPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

interface MovementFiltersBarProps {
  insumoId: string;
  onInsumoIdChange: (v: string) => void;
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  onSearch: () => void;
}

const MovementFiltersBar: React.FC<MovementFiltersBarProps> = ({
  insumoId,
  onInsumoIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onSearch,
}) => (
  <div className={`flex-wrap flex-gap-xs ${styles['movement-filters-bar']}`}>
    <input
      type="text"
      className={`input-touch flex-2 ${styles['movement-filter-input']}`}
      placeholder="Filtrar por ID de insumo (opcional)"
      value={insumoId}
      onChange={(e) => onInsumoIdChange(e.target.value)}
      id="input-filter-insumo-id"
    />
    <input
      type="date"
      className={`input-touch flex-1 ${styles['movement-filter-date']}`}
      value={startDate}
      onChange={(e) => onStartDateChange(e.target.value)}
      aria-label="Fecha desde"
      id="input-filter-start-date"
    />
    <input
      type="date"
      className={`input-touch flex-1 ${styles['movement-filter-date']}`}
      value={endDate}
      onChange={(e) => onEndDateChange(e.target.value)}
      aria-label="Fecha hasta"
      id="input-filter-end-date"
    />
    <button type="button" className="btn-touch btn-secondary" onClick={onSearch} id="btn-search-movements">
      <Search size={18} />
    </button>
  </div>
);

const MovementRow: React.FC<{ item: StockMovementHistoryItem }> = ({ item }) => (
  <tr>
    <td className="fs-sm">{item.insumoName}</td>
    <td className="fs-sm">{item.type}</td>
    <td className="fs-sm text-right">{item.quantity}</td>
    <td className="text-secondary-color fs-xs">
      {item.fromLoc} → {item.toLoc}
    </td>
    <td className="text-secondary-color fs-xs">
      {new Date(item.createdAt).toLocaleString('es')}
    </td>
  </tr>
);

const MovementTable: React.FC<{ items: StockMovementHistoryItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-secondary-color p-5 fs-md">
        Sin movimientos registrados en este rango.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Tipo</th>
            <th className="text-right">Cantidad</th>
            <th>Origen → Destino</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <MovementRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// input[type=date] entrega "YYYY-MM-DD" — el backend espera ISO 8601 date-time completo.
function toStartOfDayIso(dateOnly: string): string {
  return `${dateOnly}T00:00:00.000Z`;
}
function toEndOfDayIso(dateOnly: string): string {
  return `${dateOnly}T23:59:59.999Z`;
}

function useMovementHistory(isOpen: boolean, userRole: string) {
  const [items, setItems] = useState<StockMovementHistoryItem[]>([]);
  const [insumoId, setInsumoId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await StockService.getMovementHistory({
        ...(insumoId ? { insumoId } : {}),
        ...(startDate ? { startDate: toStartOfDayIso(startDate) } : {}),
        ...(endDate ? { endDate: toEndOfDayIso(endDate) } : {}),
      });
      setItems(result);
    } catch (err) {
      // Sin fallback a datos sintéticos: es un registro de auditoría, mostrar
      // movimientos falsos como si fueran reales sería activamente engañoso.
      setError(err instanceof Error ? err.message : 'Error consultando el historial de movimientos.');
    } finally {
      setIsLoading(false);
    }
  }, [insumoId, startDate, endDate]);

  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userRole]);

  return { items, insumoId, setInsumoId, startDate, setStartDate, endDate, setEndDate, isLoading, error, load };
}

export const MovementHistoryPanel: React.FC<MovementHistoryPanelProps> = ({ isOpen, userRole, onClose }) => {
  const history = useMovementHistory(isOpen, userRole);

  if (!isOpen) return null;
  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Auditoría de Movimientos" onClose={onClose} />;
  }

  return (
    <Modal size="xl">
      <ModalHeader
        icon={<History className="text-primary-color" />}
        title="Auditoría de Movimientos de Stock"
        size="lg"
        onClose={onClose}
      />

      <MovementFiltersBar
        insumoId={history.insumoId}
        onInsumoIdChange={history.setInsumoId}
        startDate={history.startDate}
        onStartDateChange={history.setStartDate}
        endDate={history.endDate}
        onEndDateChange={history.setEndDate}
        onSearch={history.load}
      />

      {history.error && <ErrorBanner message={history.error} />}

      {history.isLoading ? (
        <div className="text-center text-secondary-color p-6">
          <RefreshCw className="spin" size={24} /> Cargando historial...
        </div>
      ) : (
        !history.error && <MovementTable items={history.items} />
      )}
    </Modal>
  );
};
