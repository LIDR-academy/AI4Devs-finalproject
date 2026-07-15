export type WorkOrderStatus =
  | 'EN_PROCESO'
  | 'LISTA_PARA_ENTREGA'
  | 'OWNER_CONTACTED'
  | 'ENTREGADA';

export type WorkOrderTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface MechanicSummary {
  id: string;
  fullName: string;
  role?: 'ADMIN' | 'MECHANIC';
}

export interface AssignedMechanicSummary {
  id: string;
  fullName: string;
  role: 'ADMIN' | 'MECHANIC';
}

export interface ActiveWorkOrder {
  id: string;
  status: WorkOrderStatus;
  checkedInAt: string;
}

export interface TaskTechnicalNotes {
  diagnosis: string | null;
  repairPerformed: string | null;
  partsUsed: string | null;
  additionalNotes: string | null;
}

export interface VisitNotes {
  visitDiagnosis: string | null;
  visitRepairSummary: string | null;
  visitPartsUsed: string | null;
  visitAdditionalNotes: string | null;
}

export interface WorkOrderTaskDetail extends TaskTechnicalNotes {
  id: string;
  description: string;
  status: WorkOrderTaskStatus;
  cost: number | null;
  costNotes: string | null;
  sortOrder: number;
  completedAt?: string | null;
}

export type WorkOrderTask = WorkOrderTaskDetail;

export interface CreateWorkOrderRequest {
  vehicleId: string;
  entryReason: string;
  mileage?: number | null;
  assignedMechanicId?: string;
  initialTasks: { description: string }[];
}

export interface UpdateMileageResponse {
  id: string;
  mileage: number | null;
  updatedAt: string;
}

export interface WorkOrderDetail extends VisitNotes {
  id: string;
  vehicleId: string;
  ownerClientId: string;
  status: WorkOrderStatus;
  entryReason: string;
  mileage: number | null;
  assignedMechanicId: string | null;
  assignedMechanic: AssignedMechanicSummary | null;
  checkedInAt: string;
  updatedAt: string;
  createdById: string;
  totalAmount: number;
  tasks: WorkOrderTaskDetail[];
  vehicle: { licensePlate: string; brand: string; model: string };
  owner: { fullName: string; nationalId: string };
}

export interface ActiveWorkOrderResponse {
  activeWorkOrder: ActiveWorkOrder | null;
}

export interface UpdateTaskRequest {
  status: WorkOrderTaskStatus;
  cost?: number;
  costNotes?: string;
}

export interface UpdateTaskResponse {
  task: WorkOrderTaskDetail;
  workOrder: {
    id: string;
    status: WorkOrderStatus;
    totalAmount: number;
    updatedAt: string;
  };
}

export interface UpdateTaskTechnicalNotesRequest {
  diagnosis?: string | null;
  repairPerformed?: string | null;
  partsUsed?: string | null;
  additionalNotes?: string | null;
}

export type UpdateVisitNotesRequest = VisitNotes;

export interface TaskTechnicalNotesResponse extends TaskTechnicalNotes {
  id: string;
  description: string;
  status: WorkOrderTaskStatus;
}

export interface VisitNotesResponse extends VisitNotes {
  id: string;
  status: WorkOrderStatus;
}

