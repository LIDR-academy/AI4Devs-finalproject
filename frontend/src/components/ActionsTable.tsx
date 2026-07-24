import type { RobotAction } from "../types/dashboard";

type Props = {
  actions: RobotAction[];
  compact?: boolean;
};

const formatTime = (value: string) => {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
};

export function ActionsTable({ actions, compact = false }: Props) {
  const content = (
    <>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Robot</p>
          <h2>Ultimas acciones</h2>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="table-empty">Sin acciones para la operacion actual.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Estado</th>
                <th>Modo</th>
                <th>Color</th>
                <th>Drop zone</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id}>
                  <td>{action.code}</td>
                  <td>
                    <span className={`status-badge status-${action.status.toLowerCase()}`}>{action.status}</span>
                  </td>
                  <td>{action.mode}</td>
                  <td>{action.color ?? "-"}</td>
                  <td>{action.execution?.dropZoneCode ?? "-"}</td>
                  <td>{formatTime(action.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (compact) {
    return <div className="actions-table-compact">{content}</div>;
  }

  return (
    <section className="panel panel-span-3">
      {content}
    </section>
  );
}
