export class DeliveryReadyItemDto {
  workOrderId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  ownerName!: string;
  ownerPhone!: string | null;
  ownerPhoneDisplay!: string | null;
  ownerEmail!: string | null;
  totalAmount!: number;
  checkedInAt!: Date;
  elapsedLabel!: string;
}
