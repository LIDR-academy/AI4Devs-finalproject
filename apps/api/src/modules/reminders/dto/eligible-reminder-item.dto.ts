export class EligibleReminderItemDto {
  vehicleId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  ownerName!: string;
  ownerEmail!: string | null;
  ownerClientId!: string;
  lastVisitAt!: Date;
  daysSinceVisit!: number;
  lastReminderSentAt!: Date | null;
  canEmail!: boolean;
}
