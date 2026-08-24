import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Table, type TableColumn } from "../components/Table";
import {
   commercialService,
   type Distributor,
   type Group,
} from "../services/commercialService";

type GroupRow = Group & { distribuidorId: number | null };

export function GroupsPage() {
   const [groups, setGroups] = useState<GroupRow[]>([]);
   const [distributors, setDistributors] = useState<Distributor[]>([]);
   const [groupName, setGroupName] = useState("");
   const [distributorName, setDistributorName] = useState("");
   const [error, setError] = useState<string | null>(null);

   async function reloadGroups() {
      const list = await commercialService.listGroups();
      const withDistributor = await Promise.all(
         list.map(async (group) => {
            const current = await commercialService
               .getGroupDistributor(group.id)
               .catch(() => ({ distribuidor_id: null }));
            return { ...group, distribuidorId: current.distribuidor_id };
         }),
      );
      setGroups(withDistributor);
   }

   function reloadDistributors() {
      commercialService.listDistributors().then(setDistributors).catch(() => undefined);
   }

   useEffect(() => {
      reloadGroups().catch(() => setError("No se pudo cargar la lista de grupos"));
      reloadDistributors();
   }, []);

   async function handleCreateGroup(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await commercialService.createGroup(groupName);
         setGroupName("");
         reloadGroups();
      } catch {
         setError("No se pudo crear el grupo");
      }
   }

   async function handleCreateDistributor(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         await commercialService.createDistributor(distributorName);
         setDistributorName("");
         reloadDistributors();
      } catch {
         setError("No se pudo crear el distribuidor");
      }
   }

   async function handleAssignDistributor(groupId: number, distribuidorId: number) {
      setError(null);
      try {
         await commercialService.assignDistributorToGroup(groupId, distribuidorId);
         reloadGroups();
      } catch {
         setError("No se pudo asignar el distribuidor al grupo");
      }
   }

   const distributorName_ = (id: number | null) =>
      id === null ? "sin asignar" : (distributors.find((d) => d.id === id)?.nombre ?? id);

   const groupColumns: TableColumn<GroupRow>[] = [
      { key: "nombre", header: "Grupo", render: (g) => g.nombre },
      { key: "distribuidor", header: "Distribuidor", render: (g) => distributorName_(g.distribuidorId) },
      {
         key: "asignar",
         header: "Asignar distribuidor",
         render: (g) => (
            <Select
               value=""
               onChange={(e) =>
                  e.target.value && handleAssignDistributor(g.id, Number(e.target.value))
               }
               options={[
                  { value: "", label: "Seleccionar..." },
                  ...distributors.map((d) => ({ value: String(d.id), label: d.nombre })),
               ]}
            />
         ),
      },
   ];

   const distributorColumns: TableColumn<Distributor>[] = [
      { key: "nombre", header: "Distribuidor", render: (d) => d.nombre },
   ];

   return (
      <main>
         <h1>Grupos y distribuidores</h1>
         {error && <p role="alert">{error}</p>}

         <section>
            <h2>Grupos</h2>
            <Table
               columns={groupColumns}
               rows={groups}
               rowKey={(g) => String(g.id)}
               emptyMessage="Sin grupos"
            />
            <form onSubmit={handleCreateGroup} className="form-row">
               <label>
                  Nuevo grupo
                  <input value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
               </label>
               <Button type="submit">Crear grupo</Button>
            </form>
         </section>

         <section>
            <h2>Distribuidores</h2>
            <Table
               columns={distributorColumns}
               rows={distributors}
               rowKey={(d) => String(d.id)}
               emptyMessage="Sin distribuidores"
            />
            <form onSubmit={handleCreateDistributor} className="form-row">
               <label>
                  Nuevo distribuidor
                  <input
                     value={distributorName}
                     onChange={(e) => setDistributorName(e.target.value)}
                     required
                  />
               </label>
               <Button type="submit">Crear distribuidor</Button>
            </form>
         </section>
      </main>
   );
}
