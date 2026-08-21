import React, { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw, Search } from 'lucide-react';
import { StockService, StockMovementHistoryItem } from '../services/stock.service.js';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';

interface MovementHistoryPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

interface MovementFiltersBarProps {
  insumoId: string;
  onInsumoIdChange: (v: string) => void;
  onSearch: () => void;
}

const MovementFiltersBar: React.FC<MovementFiltersBarProps> = ({ insumoId, onInsumoIdChange, onSearch }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
    <input
      type="text"
      className="input-touch"
      placeholder="Filtrar por ID de insumo (opcional)"
      value={insumoId}
      onChange={(e) => onInsumoIdChange(e.target.value)}
      style={{ flex: 1 }}
      id="input-filter-insumo-id"
    />
    <button type="button" className="btn-touch btn-secondary" onClick={onSearch} id="btn-search-movements">
      <Search size={18} />
    </button>
  </div>
);

const MovementRow: React.FC<{ item: StockMovementHistoryItem }> = ({ item }) => (
  <tr style={{ borderBottom: '1px solid var(--border-card)' }}>
    <td style={{ padding: '10px 8px', fontSize: '0.85rem' }}>{item.insumoName}</td>
    <td style={{ padding: '10px 8px', fontSize: '0.85rem' }}>{item.type}</td>
    <td style={{ padding: '10px 8px', fontSize: '0.85rem', textAlign: 'right' }}>{item.quantity}</td>
    <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      {item.fromLoc} → {item.toLoc}
    </td>
    <td style={{ padding: '10px 8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
      {new Date(item.createdAt).toLocaleString('es')}
    </td>
  </tr>
);

const MovementTable: React.FC<{ items: StockMovementHistoryItem[] }> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Sin movimientos registrados en este rango.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-card)', textAlign: 'left' }}>
            <th style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Insumo</th>
            <th style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo</th>
            <th style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Cantidad</th>
            <th style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Origen → Destino</th>
            <th style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fecha</th>
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

function useMovementHistory(isOpen: boolean, userRole: string) {
  const [items, setItems] = useState<StockMovementHistoryItem[]>([]);
  const [insumoId, setInsumoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await StockService.getMovementHistory(insumoId ? { insumoId } : {});
      setItems(result);
    } catch (err) {
      // Sin fallback a datos sintéticos: es un registro de auditoría, mostrar
      // movimientos falsos como si fueran reales sería activamente engañoso.
      setError(err instanceof Error ? err.message : 'Error consultando el historial de movimientos.');
    } finally {
      setIsLoading(false);
    }
  }, [insumoId]);

  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userRole]);

  return { items, insumoId, setInsumoId, isLoading, error, load };
}

export const MovementHistoryPanel: React.FC<MovementHistoryPanelProps> = ({ isOpen, userRole, onClose }) => {
  const history = useMovementHistory(isOpen, userRole);

  if (!isOpen) return null;
  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Auditoría de Movimientos" onClose={onClose} />;
  }

  return (
    <Modal maxWidth="720px" width="94%">
      <ModalHeader
        icon={<History style={{ color: 'var(--color-primary)' }} />}
        title="Auditoría de Movimientos de Stock"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      <MovementFiltersBar insumoId={history.insumoId} onInsumoIdChange={history.setInsumoId} onSearch={history.load} />

      {history.error && <ErrorBanner message={history.error} />}

      {history.isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <RefreshCw className="spin" size={24} /> Cargando historial...
        </div>
      ) : (
        !history.error && <MovementTable items={history.items} />
      )}
    </Modal>
  );
};
