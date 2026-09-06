export interface OwnerAtVisit {
  id: string;
  fullName: string;
  nationalId: string;
}

export interface VisitNotes {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
}

export interface HistoryTask {
  id: string;
  description: string;
  status: string;
  cost: number | null;
  costNotes: string | null;
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}

export interface VehicleVisit {
  workOrderId: string;
  checkedInAt: string;
  deliveredAt: string | null;
  status: string;
  statusLabel: string;
  entryReason: string;
  mileage: number | null;
  totalAmount: number;
  ownerAtVisit: OwnerAtVisit | null;
  broughtByName: string | null;
  broughtByPhone: string | null;
  visitNotes: VisitNotes;
  tasks: HistoryTask[];
}

export interface VehicleHistoryResponse {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  currentOwner: { id: string; fullName: string; nationalId: string } | null;
  visits: VehicleVisit[];
  total: number;
}

export interface ClientVehicleSummary {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  lastVisitAt: string | null;
  lastVisitStatus: string | null;
}

export interface ClientProfileResponse {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  createdAt?: string;
  vehicles: ClientVehicleSummary[];
}
