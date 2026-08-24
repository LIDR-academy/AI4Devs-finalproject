import { httpClient } from "./httpClient";

export type EmpresaPlan = {
   id: number;
   plan_nombre: string;
   origen: "erp" | "eyemaster";
   tipo_contrato: 1 | 2;
   estatus: 0 | 1 | 4;
   fecha_inicio: string;
   fecha_final: string;
   prorroga: number;
   precio_unitario: string;
   ultima_sync: string;
};

export type Pago = {
   id: number;
   estatus: 0 | 1 | 2 | 3;
   subtotal: string;
   importe_descuento: string;
   impuesto: string;
   total: string;
   fecha: string;
   ultima_sync: string;
};

export type Complemento = { id: number; clave: string; nombre: string };

export type PlanComplemento = {
   complemento_id: number;
   complemento_nombre: string;
   limite: string;
};

export type PlanCatalogEntry = {
   id: number;
   nombre: string;
   precio_base: string | null;
   origen: "erp" | "eyemaster";
   complementos: PlanComplemento[];
};

export type AssignPlanPayload = {
   plan_id: number;
   fecha_inicio: string;
   fecha_final: string;
   tipo_contrato: 1 | 2;
   precio_unitario: string;
   estatus?: 0 | 1 | 4;
};

export const financialService = {
   getPlans: (empresaId: number) =>
      httpClient.get<EmpresaPlan[]>(`/api/empresas/${empresaId}/planes`),
   getPayments: (empresaId: number) =>
      httpClient.get<Pago[]>(`/api/empresas/${empresaId}/pagos`),
   listComplementos: () => httpClient.get<Complemento[]>("/api/complementos"),
   createComplemento: (clave: string, nombre: string) =>
      httpClient.post<Complemento>("/api/complementos", { clave, nombre }),
   listPlanCatalog: () => httpClient.get<PlanCatalogEntry[]>("/api/planes"),
   createPlan: (
      nombre: string,
      precio_base: string,
      complementos: { complemento_id: number; limite: string }[],
   ) => httpClient.post<PlanCatalogEntry>("/api/planes", { nombre, precio_base, complementos }),
   assignPlanToCompany: (empresaId: number, payload: AssignPlanPayload) =>
      httpClient.post<EmpresaPlan>(`/api/empresas/${empresaId}/planes/asignar`, payload),
};
