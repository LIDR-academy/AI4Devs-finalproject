import type { RobotAction } from "../types/dashboard";

type Props = {
  actions: RobotAction[];
};

const formatTime = (value: string) => {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
};

export function ActionsTable({ actions }: Props) {
  return (
    <section className="panel panel-span-3">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Robot</p>
          <h2>Ultimas acciones</h2>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="table-empty">Sin acciones registradas.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Modo</th>
                <th>Color</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id}>
                  <td>{action.code}</td>
                  <td>{action.actionType}</td>
                  <td>
                    <span className={`status-badge status-${action.status.toLowerCase()}`}>{action.status}</span>
                  </td>
                  <td>{action.mode}</td>
                  <td>{action.color ?? "-"}</td>
                  <td>{formatTime(action.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
