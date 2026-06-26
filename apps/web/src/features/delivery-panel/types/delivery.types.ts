export interface DeliveryReadyItem {
  workOrderId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string;
  ownerPhone: string | null;
  ownerPhoneDisplay: string | null;
  ownerEmail: string | null;
  totalAmount: number;
  checkedInAt: string;
  elapsedLabel: string;
}

export interface DeliveryReadyListResponse {
  items: DeliveryReadyItem[];
  total: number;
}

export interface DeliveryReadyDetail extends DeliveryReadyItem {
  status: string;
  entryReason: string;
  mileage: number;
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
  };
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
}
