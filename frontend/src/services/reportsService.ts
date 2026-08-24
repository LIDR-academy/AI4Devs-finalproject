import { httpClient } from "./httpClient";

export type CatalogEntry = {
   key: string;
   label: string;
   medida: string;
   dimensiones: string[];
   filtros: Record<string, string>;
};

export type ReportRow = Record<string, string | number>;

export type ReportResult = {
   medida: string;
   filas: ReportRow[];
   total: string;
};

export type ReportQuery = {
   medida: string;
   dimensiones: string[];
   filtros?: Record<string, string>;
   a_fecha?: string;
};

export const reportsService = {
   catalogo: () => httpClient.get<CatalogEntry[]>("/api/reportes/catalogo"),
   consultar: (query: ReportQuery) =>
      httpClient.post<ReportResult>("/api/reportes/consulta", query),
};
