import { useEffect, useState } from "react";
import { Table, type TableColumn } from "../components/Table";
import { auditService, type AuditRecord } from "../services/auditService";

const columns: TableColumn<AuditRecord>[] = [
   { key: "fecha", header: "Fecha", render: (r) => new Date(r.fecha).toLocaleString() },
   { key: "usuario", header: "Usuario", render: (r) => r.usuario ?? "—" },
   { key: "accion", header: "Accion", render: (r) => r.accion },
   { key: "entidad", header: "Entidad", render: (r) => r.entidad || "—" },
   { key: "detalle", header: "Detalle", render: (r) => r.detalle },
];

export function AuditLogPage() {
   const [records, setRecords] = useState<AuditRecord[]>([]);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      auditService
         .list()
         .then(setRecords)
         .catch(() => setError("No se pudo cargar la bitacora"));
   }, []);

   return (
      <main>
         <h1>Bitacora de auditoria</h1>
         <section>
            {error && <p role="alert">{error}</p>}
            <Table
               columns={columns}
               rows={records}
               rowKey={(r) => String(r.id)}
               emptyMessage="Sin registros"
            />
         </section>
      </main>
   );
}
