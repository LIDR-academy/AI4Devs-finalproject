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
  <div className="card-dashboard remanentes-empty-state">
    <CheckCircle2 size={48} className="empty-state-icon" />
    <h3 className="fs-lg fw-semibold">
      ¡No hay remanentes abiertos en cocina!
    </h3>
    <p className="mt-1 fs-md">
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
  <div className="remanente-info-block">
    <div className="flex-gap-sm mb-1">
      <span className="fefo-index-badge">FEFO #{index + 1}</span>
      {isCritical && (
        <span className="fefo-alert-badge">
          <AlertTriangle size={12} /> ALERTA CRÍTICA
        </span>
      )}
    </div>

    <h3 className="fs-lg fw-bold">{item.insumoName}</h3>

    <div className="flex-gap-md mt-2 text-secondary-color fs-sm">
      <span className="flex-gap-xs">
        <Clock size={14} className={isCritical ? 'text-danger-color' : 'text-primary-color'} />
        Vence en: <strong>{item.hoursRemaining} hrs</strong>
      </span>
      <span>•</span>
      <span>Ubicación: <strong>{item.location}</strong></span>
    </div>
  </div>
);

const RemanenteQuantityDisplay: React.FC<{ item: RemanenteFEFOItem }> = ({ item }) => (
  <div className="remanente-qty-display">
    <div className="fs-2xl fw-black">
      {formatQuantity(item.currentQuantity, item.unitOfMeasure)}{' '}
      <span className="fs-base fw-semibold text-secondary-color">
        {formatUnitLabel(item.unitOfMeasure)}
      </span>
    </div>
    <div className="fs-xs text-secondary-color">
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
  <div className="flex-gap-sm flex-wrap">
    <button
      className="btn-touch btn-secondary remanente-qty-btn"
      onClick={() => onConsume(item.id, isDiscrete ? 1 : 0.25)}
      title={isDiscrete ? 'Consumir 1 unidad' : 'Consumir 0.25 porciones'}
      id={`btn-consume-025-${item.id}`}
    >
      {isDiscrete ? '-1' : '-0.25'}
    </button>

    <button
      className="btn-touch btn-secondary remanente-qty-btn"
      onClick={() => onConsume(item.id, isDiscrete ? 2 : 0.5)}
      title={isDiscrete ? 'Consumir 2 unidades' : 'Consumir 0.5 porciones'}
      id={`btn-consume-050-${item.id}`}
    >
      {isDiscrete ? '-2' : '-0.5'}
    </button>

    <button
      className="btn-touch btn-primary remanente-qty-btn remanente-qty-btn--wide"
      onClick={() => onConsume(item.id, isDiscrete ? 5 : 1.0)}
      title={isDiscrete ? 'Consumir 5 unidades' : 'Consumir 1.0 porcion'}
      id={`btn-consume-100-${item.id}`}
    >
      <MinusCircle size={16} />
      {isDiscrete ? '-5' : '-1.0'}
    </button>

    <button
      className="btn-touch btn-danger btn-icon icon-badge-sm"
      onClick={() => onDiscard(item)}
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
      className={`card-dashboard flex-between flex-wrap flex-gap-lg ${isCritical ? 'remanente-card--critical' : 'remanente-card'}`}
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
    <div className="flex-column gap-4">
      {items.map((item, index) => (
        <RemanenteListItem key={item.id} item={item} index={index} onConsume={onConsume} onDiscard={onDiscard} />
      ))}
    </div>
  );
};
