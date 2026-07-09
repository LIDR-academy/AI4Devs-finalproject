import { useCallback, useEffect, useState } from "react";
import { fetchOperationalDashboard } from "../api/dashboard";
import type { OperationalDashboard } from "../types/dashboard";
import { ActionsTable } from "./ActionsTable";
import { CountsPanel } from "./CountsPanel";
import { StatusPanel } from "./StatusPanel";

type LoadState = "loading" | "ready" | "empty" | "error";

export function Dashboard() {
  const [data, setData] = useState<OperationalDashboard | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setState("loading");
    setError(null);

    try {
      const dashboard = await fetchOperationalDashboard();
      setData(dashboard);
      setState(dashboard.activeSession ? "ready" : "empty");
    } catch (unknownError) {
      setData(null);
      setError(unknownError instanceof Error ? unknownError.message : "No se pudo consultar el backend");
      setState("error");
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RoboDock AI</p>
          <h1>Dashboard Operacional</h1>
        </div>
        <button className="icon-button" type="button" aria-label="Actualizar dashboard" onClick={loadDashboard}>
          <span aria-hidden="true">Actualizar</span>
        </button>
      </header>

      {state === "loading" && <section className="state-panel">Cargando estado operacional...</section>}

      {state === "error" && (
        <section className="state-panel state-panel-error" role="alert">
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
          <ActionsTable actions={data.lastActions} />
        </div>
      )}
    </main>
  );
}
