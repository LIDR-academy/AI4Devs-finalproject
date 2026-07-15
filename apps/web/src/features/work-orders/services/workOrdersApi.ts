import { apiClient } from '@/shared/lib/apiClient';
import type {
  ActiveWorkOrderResponse,
  CreateWorkOrderRequest,
  MechanicSummary,
  TaskTechnicalNotesResponse,
  UpdateMileageResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  UpdateTaskTechnicalNotesRequest,
  UpdateVisitNotesRequest,
  VisitNotesResponse,
  WorkOrderDetail,
  WorkOrderTaskDetail,
} from '../types/work-order.types';

export const workOrdersApi = {
  getMechanics(): Promise<MechanicSummary[]> {
    return apiClient<MechanicSummary[]>('/work-orders/mechanics');
  },

  getActiveByVehicle(vehicleId: string): Promise<ActiveWorkOrderResponse> {
    return apiClient<ActiveWorkOrderResponse>(
      `/work-orders/active?vehicleId=${encodeURIComponent(vehicleId)}`,
    );
  },

  create(data: CreateWorkOrderRequest): Promise<WorkOrderDetail> {
    return apiClient<WorkOrderDetail>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById(id: string): Promise<WorkOrderDetail> {
    return apiClient<WorkOrderDetail>(`/work-orders/${id}`);
  },

  updateMileage(
    workOrderId: string,
    mileage: number | null,
  ): Promise<UpdateMileageResponse> {
    return apiClient(`/work-orders/${workOrderId}/mileage`, {
      method: 'PATCH',
      body: JSON.stringify({ mileage }),
    });
  },

  addTask(
    workOrderId: string,
    description: string,
  ): Promise<WorkOrderTaskDetail> {
    return apiClient<WorkOrderTaskDetail>(
      `/work-orders/${workOrderId}/tasks`,
      {
        method: 'POST',
        body: JSON.stringify({ description }),
      },
    );
  },

  updateTask(
    workOrderId: string,
    taskId: string,
    data: UpdateTaskRequest,
  ): Promise<UpdateTaskResponse> {
    return apiClient<UpdateTaskResponse>(
      `/work-orders/${workOrderId}/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  patchTaskTechnicalNotes(
    workOrderId: string,
    taskId: string,
    data: UpdateTaskTechnicalNotesRequest,
  ): Promise<TaskTechnicalNotesResponse> {
    return apiClient<TaskTechnicalNotesResponse>(
      `/work-orders/${workOrderId}/tasks/${taskId}/technical-notes`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },

  patchVisitNotes(
    workOrderId: string,
    data: UpdateVisitNotesRequest,
  ): Promise<VisitNotesResponse> {
    return apiClient<VisitNotesResponse>(
      `/work-orders/${workOrderId}/visit-notes`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
  },
};
