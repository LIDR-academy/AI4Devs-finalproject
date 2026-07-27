import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import type { ReadingStatus } from '../entities/reading-record.entity';
import {
  IsHalfStepRating,
  MAX_RATING,
  MIN_RATING,
} from '../validators/half-step-rating.validator';

export class PatchReadingRecordDto {
  @IsOptional()
  @IsEnum(['pendiente', 'leyendo', 'leido', 'dnf'])
  status?: ReadingStatus;

  @IsOptional()
  @IsDateString()
  started_on?: string;

  @IsOptional()
  @IsDateString()
  finished_on?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(MIN_RATING)
  @Max(MAX_RATING)
  @IsHalfStepRating()
  rating?: number;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUUID()
  format_id?: string | null;
}
