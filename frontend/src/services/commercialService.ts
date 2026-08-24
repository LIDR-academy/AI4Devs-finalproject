import { httpClient } from "./httpClient";

export type Group = { id: number; nombre: string };
export type Distributor = { id: number; nombre: string };

export type CompanyCommercialStatus = {
   empresa_id: number;
   cliente_id: number | null;
   grupo_id: number | null;
   distribuidor_efectivo_id: number | null;
};

export type GroupDistributor = { grupo_id: number; distribuidor_id: number | null };

export const commercialService = {
   listGroups: () => httpClient.get<Group[]>("/api/grupos/"),
   listDistributors: () => httpClient.get<Distributor[]>("/api/distribuidores/"),
   createGroup: (nombre: string) => httpClient.post<Group>("/api/grupos/", { nombre }),
   createDistributor: (nombre: string) =>
      httpClient.post<Distributor>("/api/distribuidores/", { nombre }),
   getGroupDistributor: (grupoId: number) =>
      httpClient.get<GroupDistributor>(`/api/grupos/${grupoId}/distribuidor`),
   assignDistributorToGroup: (grupoId: number, distribuidorId: number) =>
      httpClient.put(`/api/grupos/${grupoId}/distribuidor`, { distribuidor_id: distribuidorId }),
   getStatus: (empresaId: number) =>
      httpClient.get<CompanyCommercialStatus>(`/api/empresas/${empresaId}/comercial`),
   assignClient: (empresaId: number, clienteId: number) =>
      httpClient.put(`/api/empresas/${empresaId}/cliente`, { cliente_id: clienteId }),
   assignGroup: (empresaId: number, grupoId: number) =>
      httpClient.put(`/api/empresas/${empresaId}/grupo`, { grupo_id: grupoId }),
   assignDistributor: (empresaId: number, distribuidorId: number) =>
      httpClient.put(`/api/empresas/${empresaId}/distribuidor`, {
         distribuidor_id: distribuidorId,
      }),
};
