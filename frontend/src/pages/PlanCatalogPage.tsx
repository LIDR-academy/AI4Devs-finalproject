import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Table, type TableColumn } from "../components/Table";
import {
   financialService,
   type Complemento,
   type PlanCatalogEntry,
} from "../services/financialService";

type ComplementoDraft = { complemento_id: string; limite: string };

export function PlanCatalogPage() {
   const [complementos, setComplementos] = useState<Complemento[]>([]);
   const [plans, setPlans] = useState<PlanCatalogEntry[]>([]);
   const [error, setError] = useState<string | null>(null);

   const [complementoClave, setComplementoClave] = useState("");
   const [complementoNombre, setComplementoNombre] = useState("");

   const [planNombre, setPlanNombre] = useState("");
   const [planPrecio, setPlanPrecio] = useState("");
   const [draftComplementos, setDraftComplementos] = useState<ComplementoDraft[]>([
      { complemento_id: "", limite: "" },
   ]);

   function reload() {
      financialService.listComplementos().then(setComplementos).catch(() => undefined);
      financialService.listPlanCatalog().then(setPlans).catch(() => undefined);
   }

   useEffect(reload, []);

   async function handleCreateComplemento(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await financialService.createComplemento(complementoClave, complementoNombre);
         setComplementoClave("");
         setComplementoNombre("");
         reload();
      } catch {
         setError("No se pudo crear el complemento");
      }
   }

   function updateDraftRow(index: number, field: keyof ComplementoDraft, value: string) {
      setDraftComplementos((prev) =>
         prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
      );
   }

   function addDraftRow() {
      setDraftComplementos((prev) => [...prev, { complemento_id: "", limite: "" }]);
   }

   function removeDraftRow(index: number) {
      setDraftComplementos((prev) => prev.filter((_, i) => i !== index));
   }

   async function handleCreatePlan(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         const validRows = draftComplementos.filter((row) => row.complemento_id && row.limite);
         await financialService.createPlan(
            planNombre,
            planPrecio,
            validRows.map((row) => ({
               complemento_id: Number(row.complemento_id),
               limite: row.limite,
            })),
         );
         setPlanNombre("");
         setPlanPrecio("");
         setDraftComplementos([{ complemento_id: "", limite: "" }]);
         reload();
      } catch {
         setError("No se pudo crear el plan");
      }
   }

   const planColumns: TableColumn<PlanCatalogEntry>[] = [
      { key: "nombre", header: "Plan", render: (p) => p.nombre },
      { key: "precio_base", header: "Precio base", render: (p) => p.precio_base ?? "—" },
      {
         key: "origen",
         header: "Origen",
         render: (p) => (
            <Badge tone={p.origen === "eyemaster" ? "success" : "neutral"}>{p.origen}</Badge>
         ),
      },
      {
         key: "complementos",
         header: "Complementos",
         render: (p) =>
            p.complementos.length === 0
               ? "—"
               : p.complementos.map((c) => `${c.complemento_nombre} (limite ${c.limite})`).join(", "),
      },
   ];

   const complementoColumns: TableColumn<Complemento>[] = [
      { key: "clave", header: "Clave", render: (c) => c.clave },
      { key: "nombre", header: "Nombre", render: (c) => c.nombre },
   ];

   return (
      <main>
         <h1>Catalogo de planes</h1>
         {error && <p role="alert">{error}</p>}

         <section>
            <h2>Complementos</h2>
            <Table
               columns={complementoColumns}
               rows={complementos}
               rowKey={(c) => String(c.id)}
               emptyMessage="Sin complementos"
            />
            <form onSubmit={handleCreateComplemento} className="form-row">
               <label>
                  Clave
                  <input
                     value={complementoClave}
                     onChange={(e) => setComplementoClave(e.target.value)}
                     placeholder="COMP-USUARIOS"
                     required
                  />
               </label>
               <label>
                  Nombre
                  <input
                     value={complementoNombre}
                     onChange={(e) => setComplementoNombre(e.target.value)}
                     placeholder="Usuarios adicionales"
                     required
                  />
               </label>
               <Button type="submit">Crear complemento</Button>
            </form>
         </section>

         <section>
            <h2>Planes</h2>
            <Table
               columns={planColumns}
               rows={plans}
               rowKey={(p) => String(p.id)}
               emptyMessage="Sin planes"
            />

            <form onSubmit={handleCreatePlan}>
               <div className="form-row">
                  <label>
                     Nombre del plan
                     <input
                        value={planNombre}
                        onChange={(e) => setPlanNombre(e.target.value)}
                        required
                     />
                  </label>
                  <label>
                     Precio base
                     <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={planPrecio}
                        onChange={(e) => setPlanPrecio(e.target.value)}
                        required
                     />
                  </label>
               </div>

               <fieldset>
                  <legend>Complementos del plan (opcional)</legend>
                  {draftComplementos.map((row, index) => (
                     <div key={index} className="form-row" style={{ marginBottom: 8 }}>
                        <select
                           className="select"
                           value={row.complemento_id}
                           onChange={(e) => updateDraftRow(index, "complemento_id", e.target.value)}
                        >
                           <option value="">Seleccionar complemento...</option>
                           {complementos.map((c) => (
                              <option key={c.id} value={c.id}>
                                 {c.nombre}
                              </option>
                           ))}
                        </select>
                        <input
                           type="number"
                           step="0.01"
                           min="0"
                           placeholder="Limite de consumo"
                           value={row.limite}
                           onChange={(e) => updateDraftRow(index, "limite", e.target.value)}
                        />
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={() => removeDraftRow(index)}
                        >
                           Quitar
                        </Button>
                     </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addDraftRow}>
                     + Agregar complemento
                  </Button>
               </fieldset>

               <Button type="submit" style={{ marginTop: 12 }}>
                  Crear plan
               </Button>
            </form>
         </section>
      </main>
   );
}
