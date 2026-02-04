import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LabResultItemDto {
  @ApiProperty({ description: 'Nombre del análisis', example: 'Glucosa' })
  @IsString()
  @IsNotEmpty()
  testName: string;

  @ApiPropertyOptional({ description: 'Código LOINC o interno', example: '2345-7' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: 'Valor del resultado (numérico o texto)', example: 95 })
  @IsNotEmpty()
  value: number | string;

  @ApiPropertyOptional({ description: 'Unidad', example: 'mg/dL' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Interpretación (normal, high, low)', example: 'normal' })
  @IsOptional()
  @IsString()
  interpretation?: string;

  @ApiPropertyOptional({ description: 'Fecha del resultado (ISO 8601)', example: '2026-01-27T10:00:00Z' })
  @IsOptional()
  @IsString()
  effectiveDateTime?: string;
}

export class LabWebhookPayloadDto {
  @ApiProperty({ description: 'ID del paciente en SIGQ (UUID)' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ description: 'Identificador del laboratorio externo' })
  @IsOptional()
  @IsString()
  sourceLabId?: string;

  @ApiProperty({ description: 'Lista de resultados de laboratorio', type: [LabResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabResultItemDto)
  observations: LabResultItemDto[];
}
