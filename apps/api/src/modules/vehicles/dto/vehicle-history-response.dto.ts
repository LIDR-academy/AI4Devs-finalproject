export class VehicleVisitDto {
  workOrderId!: string;
  checkedInAt!: Date;
  status!: string;
  entryReason!: string;
  totalAmount!: number | null;
  ownerAtVisit!: { fullName: string; nationalId: string };
}

export class VehicleHistoryResponseDto {
  vehicleId!: string;
  visits!: VehicleVisitDto[];
}
