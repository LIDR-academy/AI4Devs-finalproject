import React, { useEffect, useState } from 'react';
import { AlertTriangle, ChefHat, Scale } from 'lucide-react';
import { ReportsService, PreparationWasteLine, RecipeConsumptionLine } from '../services/reports.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { mapToUserFriendlyError } from '../../../shared/utils/errorMessageMapper.js';
import { DecimalQuantity } from '../../../shared/domain/DecimalQuantity.js';
import styles from './PreparationWasteReportPanel.module.css';

interface PreparationWasteReportPanelProps {
  startDate: string;
  endDate: string;
  currencySymbol: string;
}

interface RecipeGroup<T> {
  recipeId: string;
  recipeName: string;
  items: T[];
}

function groupByRecipe<T extends { recipeId: string; recipeName: string }>(items: T[]): RecipeGroup<T>[] {
  const byId = new Map<string, RecipeGroup<T>>();
  for (const item of items) {
    const existing = byId.get(item.recipeId);
    if (existing) {
      existing.items.push(item);
    } else {
      byId.set(item.recipeId, { recipeId: item.recipeId, recipeName: item.recipeName, items: [item] });
    }
  }
  return Array.from(byId.values());
}

function useReportData(startDate: string, endDate: string) {
  const [wasteByReason, setWasteByReason] = useState<PreparationWasteLine[]>([]);
  const [consumptionVsTheoretical, setConsumptionVsTheoretical] = useState<RecipeConsumptionLine[]>([]);
  const [thresholdPercent, setThresholdPercent] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    ReportsService.fetchPreparationWasteReport(startDate, endDate)
      .then((report) => {
        if (cancelled) return;
        setWasteByReason(report.wasteByReason);
        setConsumptionVsTheoretical(report.consumptionVsTheoretical);
        setThresholdPercent(report.wasteAlertThresholdPercent);
      })
      .catch((err) => {
        if (!cancelled) setError(mapToUserFriendlyError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return { wasteByReason, consumptionVsTheoretical, thresholdPercent, loading, error };
}

const WasteReasonRow: React.FC<{ line: PreparationWasteLine; currencySymbol: string }> = ({ line, currencySymbol }) => (
  <div className={`${styles.row}${line.overThreshold ? ` ${styles['row--over-threshold']}` : ''}`}>
    <div>
      <strong>{line.insumoName}</strong>
      <span className="text-secondary-color fs-sm"> · {line.wasteReason}</span>
    </div>
    <div className="flex-gap-md fs-sm">
      <span>{line.totalWastedQty} {line.unitOfMeasure} de {line.totalExtractedQty}</span>
      <span className={line.overThreshold ? 'text-danger-color fw-bold' : 'text-secondary-color'}>
        {line.overThreshold && <AlertTriangle size={14} className="flex-gap-xs" />} {line.wastePercent}%
      </span>
      <span>{line.wastedCost !== null ? `${currencySymbol}${line.wastedCost}` : 'Sin costo registrado'}</span>
    </div>
  </div>
);

const WasteByRecipeGroups: React.FC<{ groups: RecipeGroup<PreparationWasteLine>[]; currencySymbol: string }> = ({ groups, currencySymbol }) => (
  <>
    {groups.map((group) => (
      <details key={group.recipeId} className={styles.group} open>
        <summary className={styles['group-summary']}>
          {group.recipeName} — {group.items.length} {group.items.length === 1 ? 'línea' : 'líneas'} de merma
        </summary>
        {group.items.map((line) => (
          <WasteReasonRow key={`${line.insumoId}-${line.wasteReason}`} line={line} currencySymbol={currencySymbol} />
        ))}
      </details>
    ))}
  </>
);

function diffClass(differenceQty: string): string {
  const diff = new DecimalQuantity(differenceQty);
  if (diff.isZero()) return styles['diff-zero'];
  return diff.isPositive() ? styles['diff-positive'] : styles['diff-negative'];
}

const ConsumptionRow: React.FC<{ line: RecipeConsumptionLine }> = ({ line }) => (
  <div className={styles.row}>
    <strong>{line.insumoName}</strong>
    <div className="flex-gap-md fs-sm">
      <span>Teórico: {line.theoreticalQty} {line.unitOfMeasure}</span>
      <span>Real: {line.actualQty} {line.unitOfMeasure}</span>
      <span className={diffClass(line.differenceQty)}>
        Diferencia: {new DecimalQuantity(line.differenceQty).isPositive() ? '+' : ''}
        {line.differenceQty} {line.unitOfMeasure}
      </span>
    </div>
  </div>
);

const ConsumptionByRecipeGroups: React.FC<{ groups: RecipeGroup<RecipeConsumptionLine>[] }> = ({ groups }) => (
  <>
    {groups.map((group) => (
      <details key={group.recipeId} className={styles.group}>
        <summary className={styles['group-summary']}>{group.recipeName} — consumo real vs. teórico</summary>
        {group.items.map((line) => (
          <ConsumptionRow key={`${line.insumoId}`} line={line} />
        ))}
      </details>
    ))}
  </>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <p className="fs-sm text-secondary-color">{message}</p>
);

/**
 * US-029 / TK-105-FE: sección "Mermas de Preparación" del dashboard de reportes.
 * Agrupa por receta (tabla colapsable vía `<details>`) la merma por ingrediente/motivo
 * (con valorización `$` y % destacado sobre `wasteAlertThresholdPercent` — solo marca
 * visual, sin toast/notificación, decisión #12 diferida) y, aparte, el consumo real vs.
 * teórico por receta/ingrediente.
 */
export const PreparationWasteReportPanel: React.FC<PreparationWasteReportPanelProps> = ({
  startDate,
  endDate,
  currencySymbol,
}) => {
  const { wasteByReason, consumptionVsTheoretical, thresholdPercent, loading, error } = useReportData(startDate, endDate);

  if (error) return <ErrorBanner message={error} />;

  const wasteGroups = groupByRecipe(wasteByReason);
  const consumptionGroups = groupByRecipe(consumptionVsTheoretical);

  return (
    <section className="card-dashboard mb-5">
      <h3 className="flex-gap-xs mb-2 fs-lg fw-bold">
        <Scale size={18} className="text-primary-color" /> Mermas de Preparación de Recetas
      </h3>
      <p className="text-secondary-color fs-sm mb-4">
        Umbral de alerta configurado: {thresholdPercent}% — las líneas que lo superan se destacan (sin notificación).
      </p>

      {loading ? (
        <EmptyState message="Cargando reporte de mermas de preparación…" />
      ) : wasteGroups.length === 0 ? (
        <EmptyState message="Sin mermas de preparación registradas en este período." />
      ) : (
        <WasteByRecipeGroups groups={wasteGroups} currencySymbol={currencySymbol} />
      )}

      <h4 className="flex-gap-xs mt-5 mb-2 fs-md fw-bold">
        <ChefHat size={16} className="text-primary-color" /> Consumo Real vs. Teórico
      </h4>
      {loading ? (
        <EmptyState message="Cargando…" />
      ) : consumptionGroups.length === 0 ? (
        <EmptyState message="Sin preparaciones cerradas en este período." />
      ) : (
        <ConsumptionByRecipeGroups groups={consumptionGroups} />
      )}
    </section>
  );
};
