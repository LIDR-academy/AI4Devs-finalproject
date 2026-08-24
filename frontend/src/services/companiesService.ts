import { httpClient } from "./httpClient";

export type CompanySearchResult = {
   proyecto: "ADMIN" | "PEOPLE";
   id_externo: string;
   app: string;
   razon_social: string;
   nombre_comercial: string;
   estado: string;
};

export type CompanyRecord = CompanySearchResult & {
   id: number;
   ultima_sync: string;
};

export const companiesService = {
   search: (proyecto: string, query: string) =>
      httpClient.get<CompanySearchResult[]>(
         `/api/empresas/buscar/?proyecto=${encodeURIComponent(proyecto)}&query=${encodeURIComponent(query)}`,
      ),
   retrieve: (proyecto: string, id_externo: string) =>
      httpClient.post<CompanyRecord>("/api/empresas/recuperar/", { proyecto, id_externo }),
   list: () => httpClient.get<CompanyRecord[]>("/api/empresas/"),
};
