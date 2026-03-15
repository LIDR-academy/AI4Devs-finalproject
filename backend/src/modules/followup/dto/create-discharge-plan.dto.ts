import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDischargePlanDto {
  @ApiPropertyOptional({ description: 'Resumen de la cirugía' })
  @IsString()
  @IsOptional()
  surgerySummary?: string;

  @ApiPropertyOptional({ description: 'Instrucciones generales de alta' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Instrucciones personalizadas' })
  @IsArray()
  @IsOptional()
  customInstructions?: {
    title: string;
    content: string;
  }[];

  @ApiPropertyOptional({ description: 'Medicación al alta' })
  @IsArray()
  @IsOptional()
  medicationsAtDischarge?: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    indications?: string;
  }[];

  @ApiPropertyOptional({ description: 'Citas de seguimiento' })
  @IsArray()
  @IsOptional()
  followUpAppointments?: {
    date: string;
    type: string;
    notes?: string;
  }[];
}
