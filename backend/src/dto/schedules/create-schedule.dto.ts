import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  endTime!: string;

  @IsInt()
  @Min(1)
  slotDurationMinutes!: number;

  @IsInt()
  @Min(0)
  breakDurationMinutes!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
