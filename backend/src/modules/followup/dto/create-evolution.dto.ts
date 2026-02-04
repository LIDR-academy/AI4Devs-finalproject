import { IsString, IsOptional, IsBoolean, IsDateString, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEvolutionDto {
  @ApiProperty({ description: 'ID de la cirugía' })
  @IsString()
  surgeryId: string;

  @ApiProperty({ description: 'Fecha de evolución (YYYY-MM-DD)' })
  @IsDateString()
  evolutionDate: string;

  @ApiPropertyOptional({ description: 'Notas clínicas' })
  @IsString()
  @IsOptional()
  clinicalNotes?: string;

  @ApiPropertyOptional({ description: 'Signos vitales' })
  @IsObject()
  @IsOptional()
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
  };

  @ApiPropertyOptional({ description: '¿Presenta complicaciones?', default: false })
  @IsBoolean()
  @IsOptional()
  hasComplications?: boolean;

  @ApiPropertyOptional({ description: 'Notas sobre complicaciones' })
  @IsString()
  @IsOptional()
  complicationsNotes?: string;

  @ApiPropertyOptional({ description: 'Medicación actual' })
  @IsArray()
  @IsOptional()
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
  }[];
}
