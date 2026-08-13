export type {
  HistoryTask as VehicleVisitTask,
  OwnerAtVisit,
  VehicleHistoryResponse,
  VehicleVisit,
  VisitNotes as VehicleVisitNotes,
} from '@/features/history/types/history.types';

export interface CurrentOwner {
  id: string;
  fullName: string;
  nationalId: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  currentOwner: CurrentOwner | null;
}

export interface VehicleSearchResponse {
  items: Vehicle[];
  total: number;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  clientId?: string;
}

export interface UpdateVehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
}

export interface ExistingVehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}
