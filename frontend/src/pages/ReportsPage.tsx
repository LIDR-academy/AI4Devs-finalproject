import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { Table, type TableColumn } from "../components/Table";
import {
   reportsService,
   type CatalogEntry,
   type ReportResult,
   type ReportRow,
} from "../services/reportsService";

const MEASURES = ["adeudo", "pagado"];
const DIMENSIONS = ["empresa", "cliente", "grupo", "distribuidor"];

export function ReportsPage() {
   const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
   const [medida, setMedida] = useState("adeudo");
   const [dimensiones, setDimensiones] = useState<string[]>(["empresa"]);
   const [result, setResult] = useState<ReportResult | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      reportsService.catalogo().then(setCatalog).catch(() => undefined);
   }, []);

   async function runQuery(medidaToRun: string, dimensionesToRun: string[], filtros = {}) {
      setError(null);
      try {
         const data = await reportsService.consultar({
            medida: medidaToRun,
            dimensiones: dimensionesToRun,
            filtros,
         });
         setResult(data);
      } catch {
         setError("No se pudo ejecutar el reporte");
         setResult(null);
      }
   }

   function handleCustomSubmit() {
      runQuery(medida, dimensiones);
   }

   function toggleDimension(dimension: string) {
      setDimensiones((prev) =>
         prev.includes(dimension) ? prev.filter((d) => d !== dimension) : [...prev, dimension],
      );
   }

   const columns: TableColumn<ReportRow>[] =
      result?.filas && result.filas.length > 0
         ? Object.keys(result.filas[0])
              // "<dimension>_nombre" keys don't get their own column - they
              // replace the raw id shown under the base dimension column.
              .filter((key) => !key.endsWith("_nombre"))
              .map((key) => {
                 const nameKey = `${key}_nombre`;
                 const hasName = nameKey in result.filas[0];
                 return {
                    key,
                    header: key,
                    render: (row: ReportRow) => String(hasName ? row[nameKey] : row[key]),
                 };
              })
         : [];

   return (
      <main>
         <h1>Reportes</h1>

         <section>
            <h2>Catalogo</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
               {catalog.map((entry) => (
                  <Button
                     key={entry.key}
                     variant="secondary"
                     onClick={() => runQuery(entry.medida, entry.dimensiones, entry.filtros)}
                  >
                     {entry.label}
                  </Button>
               ))}
               {catalog.length === 0 && (
                  <p style={{ color: "var(--text-muted)" }}>Cargando catalogo...</p>
               )}
            </div>
         </section>

         <section>
            <h2>Consulta personalizada</h2>
            <label>
               Medida
               <Select
                  value={medida}
                  onChange={(e) => setMedida(e.target.value)}
                  options={MEASURES.map((m) => ({ value: m, label: m }))}
               />
            </label>
            <fieldset>
               <legend>Dimensiones</legend>
               {DIMENSIONS.map((dimension) => (
                  <label key={dimension}>
                     <input
                        type="checkbox"
                        checked={dimensiones.includes(dimension)}
                        onChange={() => toggleDimension(dimension)}
                     />
                     {dimension}
                  </label>
               ))}
            </fieldset>
            <Button onClick={handleCustomSubmit}>Consultar</Button>
         </section>

         {error && <p role="alert">{error}</p>}

         {result && (
            <section>
               <h2>Resultados</h2>
               <Table
                  columns={columns}
                  rows={result.filas}
                  rowKey={(row) => JSON.stringify(row)}
                  emptyMessage="Sin resultados"
               />
               <p>Total: {result.total}</p>
            </section>
         )}
      </main>
   );
}
