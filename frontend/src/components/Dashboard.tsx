import { useCallback, useEffect, useState } from "react";
import { dashboardRefreshIntervalMs, fetchOperationalDashboard } from "../api/dashboard";
import { edgeVisionRefreshIntervalMs, fetchEdgeVisionPanel } from "../api/edgeVision";
import type { OperationalDashboard } from "../types/dashboard";
import type { EdgeVisionPanelData } from "../types/edgeVision";
import { ActionsTable } from "./ActionsTable";
import { CountsPanel } from "./CountsPanel";
import { StatusPanel } from "./StatusPanel";
import { ExecutionPanel } from "./ExecutionPanel";
import { VisionSnapshotPanel } from "./VisionSnapshotPanel";

type LoadState = "loading" | "ready" | "empty" | "error";

export function Dashboard() {
  const [data, setData] = useState<OperationalDashboard | null>(null);
  const [visionData, setVisionData] = useState<EdgeVisionPanelData>({
    enabled: false,
    status: null,
    snapshot: null,
    error: null,
    baseUrl: null,
    refreshMs: edgeVisionRefreshIntervalMs(),
    lastUpdatedAt: null,
  });
  const [state, setState] = useState<LoadState>("loading");
  const [visionLoading, setVisionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDashboardUpdatedAt, setLastDashboardUpdatedAt] = useState<string | null>(null);

  const dashboardRefreshMs = dashboardRefreshIntervalMs();

  const loadDashboard = useCallback(async (options?: { quiet?: boolean; signal?: AbortSignal }) => {
    if (!options?.quiet) {
      setState("loading");
    }
    setError(null);

    try {
      const dashboard = await fetchOperationalDashboard(options?.signal);
      setData(dashboard);
      setState(dashboard.activeSession ? "ready" : "empty");
      setLastDashboardUpdatedAt(new Date().toISOString());
    } catch (unknownError) {
      if (unknownError instanceof DOMException && unknownError.name === "AbortError") {
        return;
      }
      setData(null);
      setError(unknownError instanceof Error ? unknownError.message : "No se pudo consultar el backend");
      setState("error");
    }
  }, []);

  const loadVision = useCallback(async (signal?: AbortSignal) => {
    setVisionLoading(true);
    try {
      const vision = await fetchEdgeVisionPanel(signal);
      setVisionData(vision);
    } catch (unknownError) {
      if (!(unknownError instanceof DOMException && unknownError.name === "AbortError")) {
        setVisionData({
          enabled: true,
          status: null,
          snapshot: null,
          error: unknownError instanceof Error ? unknownError.message : "Servicio de vision no disponible",
          baseUrl: null,
          refreshMs: edgeVisionRefreshIntervalMs(),
          lastUpdatedAt: new Date().toISOString(),
        });
      }
    } finally {
      if (!signal?.aborted) {
        setVisionLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboard({ signal: controller.signal });
    const intervalId = window.setInterval(() => {
      void loadDashboard({ quiet: true, signal: controller.signal });
    }, dashboardRefreshMs);

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [dashboardRefreshMs, loadDashboard]);

  useEffect(() => {
    const controller = new AbortController();
    void loadVision(controller.signal);
    const intervalId = window.setInterval(() => {
      void loadVision(controller.signal);
    }, edgeVisionRefreshIntervalMs());

    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [loadVision]);

  const refreshAll = useCallback(() => {
    void loadDashboard();
    void loadVision();
  }, [loadDashboard, loadVision]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RoboDock AI</p>
          <h1>Dashboard Operacional</h1>
          <p className="refresh-meta">
            Actualizacion automatica cada {Math.round(dashboardRefreshMs / 1000)}s
            {lastDashboardUpdatedAt ? ` · Ultima actualizacion ${new Date(lastDashboardUpdatedAt).toLocaleTimeString()}` : ""}
          </p>
        </div>
        <button className="icon-button" type="button" aria-label="Actualizar dashboard" onClick={refreshAll}>
          <span aria-hidden="true">Actualizar</span>
        </button>
      </header>

      {state === "loading" && <section className="state-panel">Cargando estado operacional...</section>}

      {state === "error" && (
        <section className="state-panel state-panel-error">
          <strong>Error de conexion</strong>
          <span>{error}</span>
        </section>
      )}

      {state === "empty" && (
        <section className="state-panel">
          <strong>Sin sesion activa</strong>
          <span>Ejecuta el Edge en modo simulation para poblar el dashboard.</span>
        </section>
      )}

      {state === "ready" && data && (
        <div className="dashboard-grid">
          <StatusPanel session={data.activeSession} lastAction={data.lastActions[0]} />
          <CountsPanel counts={data.counts} />
          <ExecutionPanel dashboard={data} />
          <VisionSnapshotPanel data={visionData} loading={visionLoading} />
          <ActionsTable actions={data.lastActions} />
        </div>
      )}
    </main>
  );
}
