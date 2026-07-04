import { edgeVisionImageUrl } from "../api/edgeVision";
import type { EdgeVisionPanelData } from "../types/edgeVision";

type Props = {
  data: EdgeVisionPanelData;
  loading: boolean;
};

const colorLabels = ["red", "blue", "green", "yellow"] as const;

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
  const connectionState = serviceError ? "error" : data.enabled && data.status ? "conectado" : "desconectado";

  return (
    <section className="panel panel-span-3">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Vision / Camara</p>
          <h2>Snapshot de vision</h2>
          <p className="panel-subtitle">
            Auto-refresh cada {formatSeconds(data.refreshMs)} segundos · Ultima actualizacion:{" "}
            {formatDate(data.lastUpdatedAt)}
          </p>
        </div>
        <span className={`status-badge status-${serviceError ? "error" : "success"}`}>
          {loading ? "CONSULTANDO" : serviceError ? "NO DISPONIBLE" : "OK"}
        </span>
      </div>

      <div className="vision-layout">
        <div className="vision-frame">
          {imageUrl ? (
            <img src={imageUrl} alt="Snapshot anotado de vision Edge" />
          ) : (
            <div className="vision-placeholder">{serviceError ? "Imagen no disponible" : "Sin snapshot todavia"}</div>
          )}
        </div>

        <div className="vision-details">
          <div className="trace-grid vision-trace-grid">
            <div><span className="metric-label">Servicio</span><strong>{data.enabled ? value(data.status?.status) : "No configurado"}</strong></div>
            <div><span className="metric-label">Estado</span><strong>{connectionState}</strong></div>
            <div><span className="metric-label">Fuente</span><strong>{value(data.status?.source ?? data.snapshot?.source)}</strong></div>
            <div><span className="metric-label">Camara configurada</span><strong>{value(data.status?.configuredCameraIndex)}</strong></div>
            <div><span className="metric-label">Camara activa</span><strong>{value(data.status?.activeCameraIndex)}</strong></div>
            <div><span className="metric-label">Camara snapshot</span><strong>{value(data.snapshot?.snapshotCameraIndex ?? data.status?.snapshotCameraIndex)}</strong></div>
            <div><span className="metric-label">Timestamp</span><strong>{formatDate(data.snapshot?.timestamp ?? data.status?.lastSnapshotAt)}</strong></div>
            <div><span className="metric-label">Truck code</span><strong>{value(data.snapshot?.truckCode)}</strong></div>
            <div><span className="metric-label">Cubos detectados</span><strong>{total}</strong></div>
            <div className={serviceError ? "trace-error" : ""}>
              <span className="metric-label">Estado seguro</span>
              <strong>{serviceError ?? "Sin errores reportados"}</strong>
            </div>
          </div>

          <div className="vision-counts">
            {colorLabels.map((color) => (
              <div className="count-row" key={color}>
                <span className={`swatch swatch-${color}`} />
                <span>{color}</span>
                <strong>{counts?.[color] ?? 0}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
