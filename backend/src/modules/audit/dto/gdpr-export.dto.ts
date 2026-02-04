import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class GdprExportDto {
  @IsUUID()
  userId: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
