import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Table, type TableColumn } from "../components/Table";
import { clientsService, type ClientRecord } from "../services/clientsService";
import {
   commercialService,
   type CompanyCommercialStatus,
   type Distributor,
   type Group,
} from "../services/commercialService";
import {
   financialService,
   type EmpresaPlan,
   type Pago,
   type PlanCatalogEntry,
} from "../services/financialService";
import { statusService, type EstadoDerivado } from "../services/statusService";

const ESTATUS_PLAN_LABEL: Record<number, string> = { 0: "expirado", 1: "vigente", 4: "bloqueado" };
const ESTATUS_PAGO_LABEL: Record<number, string> = {
   0: "eliminado",
   1: "pagado",
   2: "pendiente",
   3: "facturado",
};

export function CompanyDetailPage() {
   const { id } = useParams<{ id: string }>();
   const empresaId = Number(id);

   const [status, setStatus] = useState<CompanyCommercialStatus | null>(null);
   const [groups, setGroups] = useState<Group[]>([]);
   const [distributors, setDistributors] = useState<Distributor[]>([]);
   const [clients, setClients] = useState<ClientRecord[]>([]);
   const [plans, setPlans] = useState<EmpresaPlan[]>([]);
   const [payments, setPayments] = useState<Pago[]>([]);
   const [planCatalog, setPlanCatalog] = useState<PlanCatalogEntry[]>([]);
   const [estadoDerivado, setEstadoDerivado] = useState<EstadoDerivado>(null);
   const [adeudo, setAdeudo] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [savedMessage, setSavedMessage] = useState<string | null>(null);

   function showSaved(message: string) {
      setSavedMessage(message);
      setTimeout(() => setSavedMessage(null), 2500);
   }

   const [newPlanId, setNewPlanId] = useState("");
   const [newPlanInicio, setNewPlanInicio] = useState("");
   const [newPlanFinal, setNewPlanFinal] = useState("");
   const [newPlanPrecio, setNewPlanPrecio] = useState("");
   const [newPlanTipo, setNewPlanTipo] = useState<"1" | "2">("2");

   function reload() {
      commercialService.getStatus(empresaId).then(setStatus).catch(() => undefined);
      financialService.getPlans(empresaId).then(setPlans).catch(() => undefined);
      financialService.getPayments(empresaId).then(setPayments).catch(() => undefined);
      statusService
         .getCompanyStatus(empresaId)
         .then((r) => setEstadoDerivado(r.estado_derivado))
         .catch(() => undefined);
      statusService
         .getCompanyBalance(empresaId)
         .then((r) => setAdeudo(r.adeudo))
         .catch(() => undefined);
   }

   useEffect(() => {
      reload();
      commercialService.listGroups().then(setGroups).catch(() => undefined);
      commercialService.listDistributors().then(setDistributors).catch(() => undefined);
      clientsService.list().then(setClients).catch(() => undefined);
      financialService.listPlanCatalog().then(setPlanCatalog).catch(() => undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [empresaId]);

   async function handleAssignPlan(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await financialService.assignPlanToCompany(empresaId, {
            plan_id: Number(newPlanId),
            fecha_inicio: newPlanInicio,
            fecha_final: newPlanFinal,
            tipo_contrato: Number(newPlanTipo) as 1 | 2,
            precio_unitario: newPlanPrecio,
         });
         setNewPlanId("");
         setNewPlanInicio("");
         setNewPlanFinal("");
         setNewPlanPrecio("");
         reload();
      } catch {
         setError("No se pudo asignar el plan a la empresa");
      }
   }

   async function handleAssignClient(clienteId: number) {
      setError(null);
      try {
         await commercialService.assignClient(empresaId, clienteId);
         reload();
         showSaved("Cliente guardado");
      } catch {
         setError("No se pudo asignar el cliente");
      }
   }

   async function handleAssignGroup(grupoId: number) {
      setError(null);
      try {
         await commercialService.assignGroup(empresaId, grupoId);
         reload();
         showSaved("Grupo guardado");
      } catch {
         setError("No se pudo asignar el grupo");
      }
   }

   async function handleAssignDistributor(distribuidorId: number) {
      setError(null);
      try {
         await commercialService.assignDistributor(empresaId, distribuidorId);
         reload();
         showSaved("Distribuidor guardado");
      } catch {
         setError(
            "No se pudo asignar el distribuidor (puede estar heredado del grupo)",
         );
      }
   }

   if (!status) return <main>Cargando...</main>;

   const inheritedDistributor = status.grupo_id !== null;
   const currentClientName = clients.find((c) => c.id === status.cliente_id)?.razon_social;
   const currentGroupName = groups.find((g) => g.id === status.grupo_id)?.nombre;
   const currentDistributorName = distributors.find(
      (d) => d.id === status.distribuidor_efectivo_id,
   )?.nombre;

   return (
      <main>
         <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            Empresa #{empresaId}
            {estadoDerivado && (
               <Badge
                  tone={
                     estadoDerivado === "vigente"
                        ? "success"
                        : estadoDerivado === "bloqueado"
                          ? "danger"
                          : "warning"
                  }
               >
                  {estadoDerivado}
               </Badge>
            )}
         </h1>
         <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Adeudo: <strong style={{ color: "var(--text-h)" }}>{adeudo ?? "—"}</strong>
         </p>
         {error && <p role="alert">{error}</p>}
         {savedMessage && (
            <p style={{ color: "var(--success)", fontWeight: 600 }}>✓ {savedMessage}</p>
         )}

         <section>
            <h2>Cliente</h2>
            <p>
               Actual:{" "}
               <strong>
                  {status.cliente_id
                     ? (currentClientName ?? `#${status.cliente_id}`)
                     : "sin asignar"}
               </strong>
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
               Se guarda automaticamente al elegir una opcion.
            </p>
            <Select
               value={status.cliente_id ? String(status.cliente_id) : ""}
               onChange={(e) => e.target.value && handleAssignClient(Number(e.target.value))}
               options={[
                  { value: "", label: "Seleccionar cliente..." },
                  ...clients.map((c) => ({ value: String(c.id), label: c.razon_social })),
               ]}
            />
         </section>

         <section>
            <h2>Grupo</h2>
            <p>
               Actual: <strong>{status.grupo_id ? (currentGroupName ?? `#${status.grupo_id}`) : "sin asignar"}</strong>
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
               Se guarda automaticamente al elegir una opcion.
            </p>
            <Select
               value={status.grupo_id ? String(status.grupo_id) : ""}
               onChange={(e) => e.target.value && handleAssignGroup(Number(e.target.value))}
               options={[
                  { value: "", label: "Seleccionar grupo..." },
                  ...groups.map((g) => ({ value: String(g.id), label: g.nombre })),
               ]}
            />
         </section>

         <section>
            <h2>Distribuidor</h2>
            <p>
               Efectivo:{" "}
               <strong>
                  {status.distribuidor_efectivo_id
                     ? (currentDistributorName ?? `#${status.distribuidor_efectivo_id}`)
                     : "sin asignar"}
               </strong>
               {inheritedDistributor && " (heredado del grupo)"}
            </p>
            {!inheritedDistributor && (
               <>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                     Se guarda automaticamente al elegir una opcion.
                  </p>
                  <Select
                     value={status.distribuidor_efectivo_id ? String(status.distribuidor_efectivo_id) : ""}
                     onChange={(e) =>
                        e.target.value && handleAssignDistributor(Number(e.target.value))
                     }
                     options={[
                        { value: "", label: "Seleccionar distribuidor..." },
                        ...distributors.map((d) => ({ value: String(d.id), label: d.nombre })),
                     ]}
                  />
               </>
            )}
            {inheritedDistributor && (
               <Button variant="secondary" disabled>
                  Heredado del grupo — quite el grupo para asignar uno directo
               </Button>
            )}
         </section>

         <section>
            <h2>Planes</h2>
            <Table
               columns={planColumns}
               rows={plans}
               rowKey={(p) => String(p.id)}
               emptyMessage="Sin planes"
            />

            <h2 style={{ marginTop: 20 }}>Asignar un plan</h2>
            <form onSubmit={handleAssignPlan}>
               <div className="form-row">
                  <label>
                     Plan
                     <select
                        className="select"
                        value={newPlanId}
                        onChange={(e) => setNewPlanId(e.target.value)}
                        required
                     >
                        <option value="">Seleccionar plan del catalogo...</option>
                        {planCatalog.map((p) => (
                           <option key={p.id} value={p.id}>
                              {p.nombre} {p.precio_base ? `($${p.precio_base})` : ""}
                           </option>
                        ))}
                     </select>
                  </label>
                  <label>
                     Tipo de contrato
                     <select
                        className="select"
                        value={newPlanTipo}
                        onChange={(e) => setNewPlanTipo(e.target.value as "1" | "2")}
                     >
                        <option value="2">Pagado</option>
                        <option value="1">Freemium</option>
                     </select>
                  </label>
               </div>
               <div className="form-row">
                  <label>
                     Fecha inicio
                     <input
                        type="date"
                        value={newPlanInicio}
                        onChange={(e) => setNewPlanInicio(e.target.value)}
                        required
                     />
                  </label>
                  <label>
                     Fecha fin
                     <input
                        type="date"
                        value={newPlanFinal}
                        onChange={(e) => setNewPlanFinal(e.target.value)}
                        required
                     />
                  </label>
                  <label>
                     Precio acordado
                     <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPlanPrecio}
                        onChange={(e) => setNewPlanPrecio(e.target.value)}
                        required
                     />
                  </label>
                  <Button type="submit">Asignar plan</Button>
               </div>
            </form>
            {planCatalog.length === 0 && (
               <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  No hay planes en el catalogo todavia — crea uno en "Catalogo de planes".
               </p>
            )}
         </section>

         <section>
            <h2>Pagos</h2>
            <Table
               columns={paymentColumns}
               rows={payments}
               rowKey={(p) => String(p.id)}
               emptyMessage="Sin pagos"
            />
         </section>
      </main>
   );
}

const planColumns: TableColumn<EmpresaPlan>[] = [
   { key: "plan_nombre", header: "Plan", render: (p) => p.plan_nombre },
   {
      key: "origen",
      header: "Origen",
      render: (p) => (
         <Badge tone={p.origen === "eyemaster" ? "success" : "neutral"}>{p.origen}</Badge>
      ),
   },
   {
      key: "estatus",
      header: "Estatus",
      render: (p) => (
         <Badge tone={p.estatus === 1 ? "success" : p.estatus === 4 ? "danger" : "neutral"}>
            {ESTATUS_PLAN_LABEL[p.estatus]}
         </Badge>
      ),
   },
   { key: "fecha_final", header: "Vence", render: (p) => p.fecha_final },
   { key: "precio_unitario", header: "Precio", render: (p) => p.precio_unitario },
   {
      key: "ultima_sync",
      header: "Ultima sync",
      render: (p) => new Date(p.ultima_sync).toLocaleString(),
   },
];

const paymentColumns: TableColumn<Pago>[] = [
   {
      key: "estatus",
      header: "Estatus",
      render: (p) => (
         <Badge tone={p.estatus === 2 ? "warning" : "success"}>
            {ESTATUS_PAGO_LABEL[p.estatus]}
         </Badge>
      ),
   },
   { key: "total", header: "Total", render: (p) => p.total },
   { key: "fecha", header: "Fecha", render: (p) => p.fecha },
];
