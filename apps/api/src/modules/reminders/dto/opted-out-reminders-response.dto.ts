export class OptedOutReminderItemDto {
  vehicleId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  ownerName!: string | null;
  excludedAt!: Date | null;
  excludedBy!: { id: string; fullName: string } | null;
}

export class OptedOutRemindersResponseDto {
  items!: OptedOutReminderItemDto[];
  total!: number;
}

export class ReminderOptResponseDto {
  vehicleId!: string;
  excludeFromReminders!: boolean;
}
