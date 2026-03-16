import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMedicationDto {
  @ApiProperty({ description: 'Nombre del medicamento', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Dosis', required: false })
  @IsString()
  @IsOptional()
  dosage?: string;

  @ApiProperty({ description: 'Frecuencia', required: false })
  @IsString()
  @IsOptional()
  frequency?: string;

  @ApiProperty({ description: 'Fecha de inicio', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'Fecha de fin', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
