import { apiClient } from '@/shared/lib/apiClient';
import type {
  DeliverResponse,
  DeliveryReadyDetail,
  DeliveryReadyListResponse,
  MarkContactedResponse,
} from '../types/delivery.types';

export const deliveryApi = {
  listReady(params?: {
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<DeliveryReadyListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.sort) {
      searchParams.set('sort', params.sort);
    }
    if (params?.order) {
      searchParams.set('order', params.order);
    }

    const query = searchParams.toString();
    const path = query ? `/delivery/ready?${query}` : '/delivery/ready';

    return apiClient<DeliveryReadyListResponse>(path);
  },

  getReadyDetail(workOrderId: string): Promise<DeliveryReadyDetail> {
    return apiClient<DeliveryReadyDetail>(`/delivery/ready/${workOrderId}`);
  },

  markContacted(workOrderId: string): Promise<MarkContactedResponse> {
    return apiClient<MarkContactedResponse>(
      `/delivery/ready/${workOrderId}/mark-contacted`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      },
    );
  },

  markDelivered(
    workOrderId: string,
    body?: { mileage?: number },
  ): Promise<DeliverResponse> {
    return apiClient<DeliverResponse>(
      `/delivery/ready/${workOrderId}/deliver`,
      {
        method: 'PATCH',
        body: JSON.stringify(body ?? {}),
      },
    );
  },
};
