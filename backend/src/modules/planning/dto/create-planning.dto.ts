import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanningDto {
  @ApiProperty({
    description: 'ID de la cirugía',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID de la cirugía debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la cirugía es requerido' })
  surgeryId: string;

  @ApiProperty({
    description: 'Abordaje quirúrgico seleccionado',
    example: 'Abordaje anterior transperitoneal',
    required: false,
  })
  @IsString()
  @IsOptional()
  approachSelected?: string;

  @ApiProperty({
    description: 'Datos de análisis de imágenes',
    required: false,
  })
  @IsObject()
  @IsOptional()
  analysisData?: {
    measurements?: Record<string, any>;
    structures?: Array<{
      name: string;
      coordinates: number[][];
      type: string;
    }>;
    findings?: string[];
  };

  @ApiProperty({
    description: 'Datos de simulación',
    required: false,
  })
  @IsObject()
  @IsOptional()
  simulationData?: {
    approach?: {
      entryPoint: number[];
      direction: number[];
      angle: number;
    };
    trajectory?: number[][];
    riskZones?: Array<{
      name: string;
      coordinates: number[][];
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
    estimatedDuration?: number;
  };

  @ApiProperty({
    description: 'IDs de imágenes DICOM a asociar',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  dicomImageIds?: string[];

  @ApiProperty({
    description: 'Notas de planificación',
    example: 'Se recomienda abordaje laparoscópico por menor riesgo',
    required: false,
  })
  @IsString()
  @IsOptional()
  planningNotes?: string;
}
