import { httpClient } from "./httpClient";

export type EstadoDerivado = "vigente" | "vencido" | "bloqueado" | null;

export const statusService = {
   getCompanyStatus: (empresaId: number) =>
      httpClient.get<{ estado_derivado: EstadoDerivado }>(`/api/empresas/${empresaId}/estado`),
   getCompanyBalance: (empresaId: number) =>
      httpClient.get<{ adeudo: string }>(`/api/empresas/${empresaId}/adeudo`),
};
