export type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type LayerStatus = 'PROCESSING' | 'READY' | 'ERROR';
export type LayerType = 'BASE' | 'OVERLAY';

export interface Layer {
  id: string;
  planId: string;
  name: string;
  type: LayerType;
  status: LayerStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  projectId: string;
  sheetName: string; // "Planta Baja", "Alzados"
  version: number;
  status: PlanStatus;
  layers?: Layer[];
  createdAt: string;
  updatedAt: string;
}

// Estructura agrupada para el listado (Por Sheet)
export interface PlanGroup {
  sheetName: string;
  latestVersion: number;
  plans: Plan[]; // Histórico de versiones
}

export interface CreatePlanDto {
  sheetName: string;
}

export interface UploadLayerDto {
  name: string; // "Instalaciones AACC"
  type: LayerType;
  file: File;
  pageNumber?: number; // Para PDFs
}
