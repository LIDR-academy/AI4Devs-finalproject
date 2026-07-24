import { edgeVisionImageUrl } from "../api/edgeVision";
import type { EdgeVisionPanelData } from "../types/edgeVision";

type Props = {
  data: EdgeVisionPanelData;
  loading: boolean;
};

const colorLabels = [
  { key: "red", label: "Rojo" },
  { key: "blue", label: "Azul" },
  { key: "green", label: "Verde" },
  { key: "yellow", label: "Amarillo" },
] as const;

const value = (input: string | number | null | undefined) => input ?? "-";

function formatDate(valueToFormat: string | null | undefined) {
  if (!valueToFormat) {
    return "Sin snapshot todavia";
  }
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(valueToFormat));
}

function formatSeconds(milliseconds: number) {
  return (milliseconds / 1000).toLocaleString("es-CL", {
    maximumFractionDigits: 1,
  });
}

export function VisionSnapshotPanel({ data, loading }: Props) {
  const cacheKey = data.snapshot?.timestamp ?? data.lastUpdatedAt;
  const imageUrl = edgeVisionImageUrl(data.snapshot?.imageUrl, cacheKey);
  const counts = data.snapshot?.counts;
  const total = data.snapshot?.detections.length ?? 0;
  const serviceError = data.error ?? data.status?.lastError ?? data.snapshot?.lastError ?? null;
  const source = data.status?.source ?? data.snapshot?.source;

  return (
    <section className="panel vision-card">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Vision / Camara</p>
          <h2>Snapshot de vision</h2>
          <p className="panel-subtitle">
            Auto-refresh cada {formatSeconds(data.refreshMs)} segundos - {formatDate(data.lastUpdatedAt)}
          </p>
        </div>
        <span className={`status-badge status-${serviceError ? "error" : "success"}`}>
          {loading ? "CONSULTANDO" : serviceError ? "NO DISPONIBLE" : "OK"}
        </span>
      </div>

      {serviceError ? (
        <div className="executive-state" role="alert">
          <strong>Edge Vision no disponible</strong>
          <span>No se puede planificar ni ejecutar descarga fisica hasta levantar el servicio Edge.</span>
          <span>Levanta vision_api.py con la configuracion correspondiente.</span>
        </div>
      ) : (
        <div className="vision-layout compact">
          <div className="vision-frame">
            {imageUrl ? (
              <img src={imageUrl} alt="Snapshot anotado de vision Edge" />
            ) : (
              <div className="vision-placeholder">Sin snapshot todavia</div>
            )}
          </div>

          <div className="vision-summary">
            <div className="summary-line"><span>QR / camion</span><strong>{value(data.snapshot?.truckCode)}</strong></div>
            <div className="summary-line"><span>QR valido</span><strong>{data.snapshot?.qrValid ? "Si" : "No disponible"}</strong></div>
            <div className="summary-line"><span>Cubos detectados</span><strong>{total}</strong></div>
            <div className="summary-line"><span>Fuente</span><strong>{value(source)}</strong></div>
            <div className="metric-chip-row">
              {colorLabels.map((color) => (
                <span className="metric-chip" key={color.key}>
                  <span className={`swatch swatch-${color.key}`} aria-hidden="true" />
                  {color.label}: <strong>{counts?.[color.key] ?? 0}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
