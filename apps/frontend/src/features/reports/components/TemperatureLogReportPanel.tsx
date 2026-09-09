import React from 'react';
import { Thermometer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KitchenService, TemperatureLogItem } from '../../kitchen/services/kitchen.service.js';
import { StorageLocationDto, LocationsService } from '../../stock/services/locations.service.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { useAsyncData } from '../../../shared/hooks/useAsyncData.js';

interface TemperatureLogReportPanelProps {
  startDate: string;
  endDate: string;
}

const UNIT_TYPE_LABEL: Record<TemperatureLogItem['unitType'], string> = {
  REFRIGERATOR: 'Refrigerador',
  FREEZER: 'Congelador',
};

interface TemperatureReportData {
  logs: TemperatureLogItem[];
  locationNames: Map<string, string>;
}

async function loadTemperatureReport(startDate: string, endDate: string): Promise<TemperatureReportData> {
  // fetchLocations() (no solo las activas): una lectura histórica puede apuntar a un
  // sub-sector desactivado después, y aun así hay que poder nombrarlo en el reporte.
  const [logs, locations]: [TemperatureLogItem[], StorageLocationDto[]] = await Promise.all([
    KitchenService.fetchTemperatureLogs({ startDate, endDate }),
    LocationsService.fetchLocations(),
  ]);
  return { logs, locationNames: new Map(locations.map((l) => [l.id, l.name])) };
}

/** Estado binario dentro/fuera de rango — marca + texto, nunca solo color (WCAG 1.4.1). */
const RangeStatus: React.FC<{ isWithinSafeRange: boolean }> = ({ isWithinSafeRange }) =>
  isWithinSafeRange ? (
    <span className="flex-gap-xs text-success-color">
      <CheckCircle2 size={16} aria-hidden="true" /> Dentro de rango
    </span>
  ) : (
    <span className="flex-gap-xs text-danger-color fw-semibold">
      <AlertTriangle size={16} aria-hidden="true" /> Fuera de rango
    </span>
  );

const TemperatureLogRow: React.FC<{ log: TemperatureLogItem; locationName: string }> = ({ log, locationName }) => (
  <tr>
    <td>{new Date(log.recordedAt).toLocaleString()}</td>
    <td>{locationName}</td>
    <td>{UNIT_TYPE_LABEL[log.unitType]}</td>
    <td className="text-right font-mono">{log.temperatureCelsius} °C</td>
    <td>
      <RangeStatus isWithinSafeRange={log.isWithinSafeRange} />
    </td>
  </tr>
);

/**
 * US-033 / TK-120-FE: histórico de lecturas de temperatura, solo visible en `/reportes`
 * (ruta ya gateada a `ADMIN` por `ProtectedRoute`; el backend además exige
 * `requireRole('ADMIN')` en el `GET`). Una lectura fuera de rango se marca, nunca se
 * oculta ni se trata como error — el registro es válido, el dato es lo que amerita atención.
 */
export const TemperatureLogReportPanel: React.FC<TemperatureLogReportPanelProps> = ({ startDate, endDate }) => {
  const { data, loading, error } = useAsyncData(
    () => loadTemperatureReport(startDate, endDate),
    `${startDate}|${endDate}`
  );

  if (error) return <ErrorBanner message={error} />;

  const logs = data?.logs ?? [];
  const locationNames = data?.locationNames ?? new Map<string, string>();
  const outOfRangeCount = logs.filter((l) => !l.isWithinSafeRange).length;

  return (
    <section className="card-dashboard mb-5">
      <h3 className="flex-gap-xs mb-2 fs-lg fw-bold">
        <Thermometer size={18} className="text-primary-color" /> Control de Temperatura de Refrigeración
      </h3>
      <p className="text-secondary-color fs-sm mb-4 measure">
        Umbral FDA: refrigerador ≤ 4 °C, congelador ≤ -18 °C.{' '}
        {outOfRangeCount > 0 && <strong>{outOfRangeCount} lectura(s) fuera de rango en este período.</strong>}
      </p>

      {loading ? (
        <p className="fs-sm text-secondary-color">Cargando registros de temperatura…</p>
      ) : logs.length === 0 ? (
        <p className="fs-sm text-secondary-color">Sin lecturas registradas en este período.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Sub-sector</th>
                <th>Tipo</th>
                <th className="text-right">Temperatura</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <TemperatureLogRow
                  key={log.id}
                  log={log}
                  locationName={locationNames.get(log.storageLocationId) ?? log.storageLocationId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
