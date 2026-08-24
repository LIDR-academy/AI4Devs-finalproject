import React from 'react';
import { Clock, AlertTriangle, MinusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';

interface ActiveRemanentesListProps {
  items: RemanenteFEFOItem[];
  onConsume: (id: string, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const DISCRETE_UNITS = ['UNITS', 'UNIDADES', 'PZA', 'PACK', 'UD', 'UDS'];

const RemanentesEmptyState: React.FC = () => (
  <div className="card-dashboard" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
    <CheckCircle2 size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 12px' }} />
    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      ¡No hay remanentes abiertos en cocina!
    </h3>
    <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
      Extrae insumos desde bodega para iniciar las preparaciones del turno.
    </p>
  </div>
);

interface RemanenteInfoBlockProps {
  item: RemanenteFEFOItem;
  index: number;
  isCritical: boolean;
}

const RemanenteInfoBlock: React.FC<RemanenteInfoBlockProps> = ({ item, index, isCritical }) => (
  <div style={{ minWidth: '220px', flex: 1 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span
        style={{ backgroundColor: 'var(--bg-main)', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', color: 'var(--color-primary)' }}
      >
        FEFO #{index + 1}
      </span>
      {isCritical && (
        <span
          style={{
            backgroundColor: 'rgba(255, 42, 42, 0.15)',
            color: 'var(--color-danger)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertTriangle size={12} /> ALERTA CRÍTICA
        </span>
      )}
    </div>

    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.insumoName}</h3>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={14} style={{ color: isCritical ? 'var(--color-danger)' : 'var(--color-primary)' }} />
        Vence en: <strong>{item.hoursRemaining} hrs</strong>
      </span>
      <span>•</span>
      <span>Ubicación: <strong>{item.location}</strong></span>
    </div>
  </div>
);

const RemanenteQuantityDisplay: React.FC<{ item: RemanenteFEFOItem }> = ({ item }) => (
  <div style={{ textAlign: 'right', minWidth: '140px' }}>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      {formatQuantity(item.currentQuantity, item.unitOfMeasure)}{' '}
      <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {formatUnitLabel(item.unitOfMeasure)}
      </span>
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
      Inicial: {formatQuantity(item.initialQuantity, item.unitOfMeasure)} {formatUnitLabel(item.unitOfMeasure)}
    </div>
  </div>
);

interface RemanenteActionButtonsProps {
  item: RemanenteFEFOItem;
  isDiscrete: boolean;
  onConsume: (id: string, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const RemanenteActionButtons: React.FC<RemanenteActionButtonsProps> = ({ item, isDiscrete, onConsume, onDiscard }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
    <button
      className="btn-touch btn-secondary"
      onClick={() => onConsume(item.id, isDiscrete ? 1 : 0.25)}
      style={{ minWidth: '70px', height: '48px', padding: '0 12px', fontSize: '0.9rem', fontWeight: 700 }}
      title={isDiscrete ? 'Consumir 1 unidad' : 'Consumir 0.25 porciones'}
      id={`btn-consume-025-${item.id}`}
    >
      {isDiscrete ? '-1' : '-0.25'}
    </button>

    <button
      className="btn-touch btn-secondary"
      onClick={() => onConsume(item.id, isDiscrete ? 2 : 0.5)}
      style={{ minWidth: '70px', height: '48px', padding: '0 12px', fontSize: '0.9rem', fontWeight: 700 }}
      title={isDiscrete ? 'Consumir 2 unidades' : 'Consumir 0.5 porciones'}
      id={`btn-consume-050-${item.id}`}
    >
      {isDiscrete ? '-2' : '-0.5'}
    </button>

    <button
      className="btn-touch btn-primary"
      onClick={() => onConsume(item.id, isDiscrete ? 5 : 1.0)}
      style={{ minWidth: '75px', height: '48px', padding: '0 12px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
      title={isDiscrete ? 'Consumir 5 unidades' : 'Consumir 1.0 porcion'}
      id={`btn-consume-100-${item.id}`}
    >
      <MinusCircle size={16} />
      {isDiscrete ? '-5' : '-1.0'}
    </button>

    <button
      className="btn-touch btn-danger"
      onClick={() => onDiscard(item)}
      style={{ width: '48px', height: '48px', padding: 0 }}
      title="Registrar Descarte de Merma"
      id={`btn-discard-${item.id}`}
    >
      <Trash2 size={20} />
    </button>
  </div>
);

interface RemanenteListItemProps {
  item: RemanenteFEFOItem;
  index: number;
  onConsume: (id: string, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const RemanenteListItem: React.FC<RemanenteListItemProps> = ({ item, index, onConsume, onDiscard }) => {
  const isCritical = item.hoursRemaining < 24;
  const isDiscrete = DISCRETE_UNITS.includes(item.unitOfMeasure.toUpperCase());

  return (
    <div
      className="card-dashboard"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        borderLeft: isCritical ? '6px solid var(--color-danger)' : '6px solid var(--color-primary)',
      }}
    >
      <RemanenteInfoBlock item={item} index={index} isCritical={isCritical} />
      <RemanenteQuantityDisplay item={item} />
      <RemanenteActionButtons item={item} isDiscrete={isDiscrete} onConsume={onConsume} onDiscard={onDiscard} />
    </div>
  );
};

export const ActiveRemanentesList: React.FC<ActiveRemanentesListProps> = ({ items, onConsume, onDiscard }) => {
  if (items.length === 0) {
    return <RemanentesEmptyState />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((item, index) => (
        <RemanenteListItem key={item.id} item={item} index={index} onConsume={onConsume} onDiscard={onDiscard} />
      ))}
    </div>
  );
};
