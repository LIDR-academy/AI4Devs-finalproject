import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpdateScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  @IsOptional()
  endTime?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  slotDurationMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  breakDurationMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
