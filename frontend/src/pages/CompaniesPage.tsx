import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Table, type TableColumn } from "../components/Table";
import {
   companiesService,
   type CompanyRecord,
   type CompanySearchResult,
} from "../services/companiesService";

export function CompaniesPage() {
   const [proyecto, setProyecto] = useState("ADMIN");
   const [query, setQuery] = useState("");
   const [results, setResults] = useState<CompanySearchResult[]>([]);
   const [mirrored, setMirrored] = useState<CompanyRecord[]>([]);
   const [error, setError] = useState<string | null>(null);

   function reloadMirrored() {
      companiesService.list().then(setMirrored).catch(() => undefined);
   }

   useEffect(reloadMirrored, []);

   async function handleSearch(event: FormEvent) {
      event.preventDefault();
      setError(null);
      try {
         const found = await companiesService.search(proyecto, query);
         setResults(found);
      } catch {
         setError("Busqueda fallida");
      }
   }

   async function handleRetrieve(result: CompanySearchResult) {
      setError(null);
      try {
         await companiesService.retrieve(result.proyecto, result.id_externo);
         reloadMirrored();
      } catch {
         setError("No se pudo recuperar la empresa");
      }
   }

   const resultColumns: TableColumn<CompanySearchResult>[] = [
      { key: "id_externo", header: "ID externo", render: (r) => r.id_externo },
      { key: "razon_social", header: "Razon social", render: (r) => r.razon_social },
      { key: "estado", header: "Estado", render: (r) => r.estado },
      {
         key: "acciones",
         header: "Acciones",
         render: (r) => (
            <Button variant="secondary" onClick={() => handleRetrieve(r)}>
               Recuperar
            </Button>
         ),
      },
   ];

   const mirroredColumns: TableColumn<CompanyRecord>[] = [
      { key: "proyecto", header: "Proyecto", render: (c) => c.proyecto },
      { key: "id_externo", header: "ID externo", render: (c) => c.id_externo },
      { key: "razon_social", header: "Razon social", render: (c) => c.razon_social },
      {
         key: "estado",
         header: "Estado",
         render: (c) => (
            <Badge tone={c.estado === "baja_erp" ? "danger" : "success"}>{c.estado}</Badge>
         ),
      },
      {
         key: "ultima_sync",
         header: "Ultima sync",
         render: (c) => new Date(c.ultima_sync).toLocaleString(),
      },
      {
         key: "detalle",
         header: "Acciones",
         render: (c) => (
            <Link to={`/empresas/${c.id}`} className="btn btn-secondary">
               Ver / asignar
            </Link>
         ),
      },
   ];

   return (
      <main>
         <h1>Empresas</h1>

         <section>
            <h2>Buscar en el ERP</h2>
            {error && <p role="alert">{error}</p>}
            <form onSubmit={handleSearch} className="form-row">
               <label>
                  ERP
                  <Select
                     value={proyecto}
                     onChange={(e) => setProyecto(e.target.value)}
                     options={[
                        { value: "ADMIN", label: "ADMIN" },
                        { value: "PEOPLE", label: "PEOPLE" },
                     ]}
                  />
               </label>
               <label>
                  Buscar
                  <input value={query} onChange={(e) => setQuery(e.target.value)} required />
               </label>
               <Button type="submit">Buscar</Button>
            </form>

            <h2 style={{ marginTop: 20 }}>Resultados</h2>
            <Table
               columns={resultColumns}
               rows={results}
               rowKey={(r) => `${r.proyecto}-${r.id_externo}`}
               emptyMessage="Sin resultados"
            />
         </section>

         <section>
            <h2>Empresas recuperadas</h2>
            <Table
               columns={mirroredColumns}
               rows={mirrored}
               rowKey={(c) => String(c.id)}
               emptyMessage="Sin empresas recuperadas"
            />
         </section>
      </main>
   );
}
