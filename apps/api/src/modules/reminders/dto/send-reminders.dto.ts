import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { MAX_REMINDER_BATCH_SIZE } from '../constants/reminder-inactive-days';

export class SendRemindersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_REMINDER_BATCH_SIZE)
  @IsUUID('4', { each: true })
  vehicleIds!: string[];
}
