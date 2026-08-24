import { httpClient } from "./httpClient";

export type AuditRecord = {
   id: number;
   usuario: string | null;
   accion: string;
   entidad: string;
   entidad_id: string | null;
   detalle: string;
   fecha: string;
};

export const auditService = {
   list: () => httpClient.get<AuditRecord[]>("/api/auditoria/"),
};
