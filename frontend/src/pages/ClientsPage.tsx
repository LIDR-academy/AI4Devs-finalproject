import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Table, type TableColumn } from "../components/Table";
import { clientsService, type ClientRecord } from "../services/clientsService";

function statusTone(estado: ClientRecord["estado_sync"]) {
   if (estado === "sincronizado") return "success" as const;
   if (estado === "pendiente") return "warning" as const;
   return "danger" as const;
}

export function ClientsPage() {
   const [clients, setClients] = useState<ClientRecord[]>([]);
   const [rfc, setRfc] = useState("");
   const [razonSocial, setRazonSocial] = useState("");
   const [error, setError] = useState<string | null>(null);

   function reload() {
      clientsService.list().then(setClients).catch(() => setError("No se pudo cargar la lista"));
   }

   useEffect(reload, []);

   async function handleRegister(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await clientsService.register(rfc, razonSocial);
         setRfc("");
         setRazonSocial("");
         reload();
      } catch {
         setError("No se pudo registrar el cliente");
      }
   }

   async function handleRetry(id: number) {
      setError(null);
      try {
         await clientsService.retry(id);
         reload();
      } catch {
         setError("Reintento fallido");
      }
   }

   const columns: TableColumn<ClientRecord>[] = [
      { key: "rfc", header: "RFC", render: (c) => c.rfc },
      { key: "razon_social", header: "Razon social", render: (c) => c.razon_social },
      { key: "origen", header: "Origen", render: (c) => c.origen ?? "—" },
      {
         key: "estado_sync",
         header: "Estado",
         render: (c) => <Badge tone={statusTone(c.estado_sync)}>{c.estado_sync}</Badge>,
      },
      {
         key: "acciones",
         header: "Acciones",
         render: (c) =>
            c.estado_sync !== "sincronizado" ? (
               <Button variant="secondary" onClick={() => handleRetry(c.id)}>
                  Reintentar
               </Button>
            ) : null,
      },
   ];

   return (
      <main>
         <h1>Clientes</h1>

         <section>
            <h2>Clientes registrados</h2>
            <Table
               columns={columns}
               rows={clients}
               rowKey={(c) => String(c.id)}
               emptyMessage="Sin clientes"
            />
         </section>

         <section>
            <h2>Registrar cliente</h2>
            <form onSubmit={handleRegister}>
               <label>
                  RFC
                  <input value={rfc} onChange={(e) => setRfc(e.target.value)} required />
               </label>
               <label>
                  Razon social
                  <input
                     value={razonSocial}
                     onChange={(e) => setRazonSocial(e.target.value)}
                     required
                  />
               </label>
               {error && <p role="alert">{error}</p>}
               <Button type="submit">Registrar</Button>
            </form>
         </section>
      </main>
   );
}
