import { httpClient } from "./httpClient";

export type ClientRecord = {
   id: number;
   rfc: string;
   razon_social: string;
   id_admin_catalogo_clientes: string | null;
   origen: "existente" | "creado" | null;
   estado_sync: "sincronizado" | "pendiente" | "error";
};

export const clientsService = {
   list: () => httpClient.get<ClientRecord[]>("/api/clientes/"),
   register: (rfc: string, razon_social: string) =>
      httpClient.post<ClientRecord>("/api/clientes/", { rfc, razon_social }),
   retry: (id: number) => httpClient.post<ClientRecord>(`/api/clientes/${id}/retry/`),
};
