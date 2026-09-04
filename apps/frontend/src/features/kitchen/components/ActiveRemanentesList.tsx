import React from 'react';
import { Clock, MinusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { formatQuantity, formatUnitLabel } from '../../../utils/formatters.js';
import { UrgencyChip } from '../../../shared/components/UrgencyChip.js';
import { urgencyFromHours } from '../../../shared/components/urgency.js';
import { RowButton } from '../../../shared/components/RowButton.js';
import styles from './ActiveRemanentesList.module.css';

interface ActiveRemanentesListProps {
  items: RemanenteFEFOItem[];
  // ADR-004 / TK-108-FE: ya no consume directo — abre ConsumeReasonModal (motivo obligatorio).
  onRequestConsume: (item: RemanenteFEFOItem, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const DISCRETE_UNITS = ['UNITS', 'UNIDADES', 'PZA', 'PACK', 'UD', 'UDS'];

const RemanentesEmptyState: React.FC = () => (
  <div className={`card-dashboard ${styles['remanentes-empty-state']}`}>
    <CheckCircle2 size={48} className={styles['empty-state-icon']} />
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

const RemanenteInfoBlock: React.FC<RemanenteInfoBlockProps> = ({ item, index, isCritical }) => {
  const urgency = urgencyFromHours(item.hoursRemaining);
  return (
    <div className={styles['remanente-info-block']}>
      <div className="flex-gap-sm flex-wrap mb-1">
        <span className={styles['fefo-index-badge']}>FEFO #{index + 1}</span>
        <UrgencyChip level={urgency.level} label={urgency.label} />
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
};

const RemanenteQuantityDisplay: React.FC<{ item: RemanenteFEFOItem }> = ({ item }) => (
  <div className={styles['remanente-qty-display']}>
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
  isCritical: boolean;
  onRequestConsume: (item: RemanenteFEFOItem, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const RemanenteActionButtons: React.FC<RemanenteActionButtonsProps> = ({ item, isDiscrete, isCritical, onRequestConsume, onDiscard }) => (
  <div className="flex-gap-sm flex-wrap">
    <button
      type="button"
      className={`btn-touch btn-secondary ${styles['remanente-qty-btn']}`}
      onClick={() => onRequestConsume(item, isDiscrete ? 1 : 0.25)}
      title={isDiscrete ? 'Consumir 1 unidad' : 'Consumir 0.25 porciones'}
      id={`btn-consume-025-${item.id}`}
    >
      {isDiscrete ? '-1' : '-0.25'}
    </button>

    <button
      type="button"
      className={`btn-touch btn-secondary ${styles['remanente-qty-btn']}`}
      onClick={() => onRequestConsume(item, isDiscrete ? 2 : 0.5)}
      title={isDiscrete ? 'Consumir 2 unidades' : 'Consumir 0.5 porciones'}
      id={`btn-consume-050-${item.id}`}
    >
      {isDiscrete ? '-2' : '-0.5'}
    </button>

    {/* Consumo principal ("Usar"): variante `urgent` cuando la fila es crítica (TK-086-FE). */}
    <RowButton
      variant={isCritical ? 'urgent' : 'default'}
      className={`${styles['remanente-qty-btn']} ${styles['remanente-qty-btn--wide']}`}
      onClick={() => onRequestConsume(item, isDiscrete ? 5 : 1.0)}
      title={isDiscrete ? 'Consumir 5 unidades' : 'Consumir 1.0 porcion'}
      id={`btn-consume-100-${item.id}`}
    >
      <MinusCircle size={16} />
      {isDiscrete ? '-5' : '-1.0'}
    </RowButton>

    <button
      type="button"
      className={`btn-touch btn-danger btn-icon ${styles['icon-badge-sm']}`}
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
  onRequestConsume: (item: RemanenteFEFOItem, qty: number) => void;
  onDiscard: (item: RemanenteFEFOItem) => void;
}

const RemanenteListItem: React.FC<RemanenteListItemProps> = ({ item, index, onRequestConsume, onDiscard }) => {
  const isCritical = item.hoursRemaining < 24;
  const isDiscrete = DISCRETE_UNITS.includes(item.unitOfMeasure.toUpperCase());

  return (
    <div
      className={`card-dashboard flex-between flex-wrap ${styles['flex-gap-lg']} ${isCritical ? styles['remanente-card--critical'] : styles['remanente-card']}`}
    >
      <RemanenteInfoBlock item={item} index={index} isCritical={isCritical} />
      <RemanenteQuantityDisplay item={item} />
      <RemanenteActionButtons item={item} isDiscrete={isDiscrete} isCritical={isCritical} onRequestConsume={onRequestConsume} onDiscard={onDiscard} />
    </div>
  );
};

export const ActiveRemanentesList: React.FC<ActiveRemanentesListProps> = ({ items, onRequestConsume, onDiscard }) => {
  if (items.length === 0) {
    return <RemanentesEmptyState />;
  }

  return (
    <div className="flex-column gap-4">
      {items.map((item, index) => (
        <RemanenteListItem key={item.id} item={item} index={index} onRequestConsume={onRequestConsume} onDiscard={onDiscard} />
      ))}
    </div>
  );
};
