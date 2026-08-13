export type DeliveryPanelStatus = 'LISTA_PARA_ENTREGA' | 'OWNER_CONTACTED';

export type ContactFilter = 'all' | 'pending' | 'contacted';

export interface OwnerContactedBy {
  id: string;
  fullName: string;
}

export interface DeliveryReadyItem {
  workOrderId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string | null;
  ownerPhone: string | null;
  ownerPhoneDisplay: string | null;
  ownerEmail: string | null;
  broughtByName: string | null;
  broughtByPhone: string | null;
  totalAmount: number;
  checkedInAt: string;
  elapsedLabel: string;
  status: DeliveryPanelStatus | string;
  ownerContactedAt: string | null;
  ownerContactedBy: OwnerContactedBy | null;
}

export interface DeliveryReadyListResponse {
  items: DeliveryReadyItem[];
  total: number;
}

export interface DeliverTarget {
  workOrderId: string;
  vehicleId: string;
  licensePlate: string;
  mileage: number | null;
}

export interface DeliveryReadyDetail extends DeliveryReadyItem {
  status: DeliveryPanelStatus | string;
  entryReason: string;
  mileage: number | null;
  vehicleId: string;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
  };
  owner: {
    fullName: string;
    phone: string | null;
    email: string | null;
  } | null;
  tasks: Array<{
    id: string;
    description: string;
    status: string;
    cost: number;
    costNotes: string | null;
  }>;
}

export interface DeliverResponse {
  workOrderId: string;
  status: string;
  deliveredAt: string;
  mileage: number | null;
}

export interface MarkContactedResponse {
  workOrderId: string;
  status: string;
  ownerContactedAt: string;
  ownerContactedBy: OwnerContactedBy;
}
