import { apiClient } from '@/shared/lib/apiClient';
import type {
  ActiveWorkOrderResponse,
  CreateWorkOrderRequest,
  InProgressWorkOrdersResponse,
  LinkWorkOrderOwnerResponse,
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

  getInProgress(params?: {
    limit?: number;
    offset?: number;
  }): Promise<InProgressWorkOrdersResponse> {
    const search = new URLSearchParams();
    if (params?.limit !== undefined) {
      search.set('limit', String(params.limit));
    }
    if (params?.offset !== undefined) {
      search.set('offset', String(params.offset));
    }
    const query = search.toString();
    return apiClient<InProgressWorkOrdersResponse>(
      `/work-orders/in-progress${query ? `?${query}` : ''}`,
    );
  },

  create(data: CreateWorkOrderRequest): Promise<WorkOrderDetail> {
    return apiClient<WorkOrderDetail>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  linkOwner(
    workOrderId: string,
    clientId: string,
  ): Promise<LinkWorkOrderOwnerResponse> {
    return apiClient<LinkWorkOrderOwnerResponse>(
      `/work-orders/${workOrderId}/link-owner`,
      {
        method: 'PATCH',
        body: JSON.stringify({ clientId }),
      },
    );
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
