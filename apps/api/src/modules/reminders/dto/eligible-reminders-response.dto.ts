import { EligibleReminderItemDto } from './eligible-reminder-item.dto';

export class EligibleRemindersResponseDto {
  items!: EligibleReminderItemDto[];
  total!: number;
  limit!: number;
  offset!: number;
  thresholdDays!: number;
}
