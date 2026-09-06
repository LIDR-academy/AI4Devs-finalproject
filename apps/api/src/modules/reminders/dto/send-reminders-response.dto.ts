export type ReminderBatchEmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'skipped_not_eligible'
  | 'failed';

export class SendReminderResultItemDto {
  vehicleId!: string;
  licensePlate!: string;
  emailStatus!: ReminderBatchEmailStatus;
  warning!: string | null;
}

export class SendRemindersSummaryDto {
  requested!: number;
  sent!: number;
  skipped!: number;
  failed!: number;
}

export class SendRemindersResponseDto {
  results!: SendReminderResultItemDto[];
  summary!: SendRemindersSummaryDto;
}
