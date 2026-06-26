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
  currentOwner: CurrentOwner;
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
  clientId: string;
}

export interface VehicleVisit {
  workOrderId: string;
  checkedInAt: string;
  status: string;
  entryReason: string;
  totalAmount: number | null;
  ownerAtVisit: { fullName: string; nationalId: string };
}

export interface VehicleHistoryResponse {
  vehicleId: string;
  visits: VehicleVisit[];
}

export interface ExistingVehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
}
