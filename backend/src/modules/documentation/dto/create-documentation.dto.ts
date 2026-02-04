import { IsString, IsOptional, IsEnum, IsObject, IsUUID } from 'class-validator';
import { DocumentationStatus } from '../entities/documentation.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentationDto {
  @ApiProperty({ description: 'ID de la cirugía asociada' })
  @IsUUID()
  surgeryId: string;

  @ApiPropertyOptional({ description: 'Notas preoperatorias' })
  @IsString()
  @IsOptional()
  preoperativeNotes?: string;

  @ApiPropertyOptional({ description: 'Notas intraoperatorias' })
  @IsString()
  @IsOptional()
  intraoperativeNotes?: string;

  @ApiPropertyOptional({ description: 'Notas postoperatorias' })
  @IsString()
  @IsOptional()
  postoperativeNotes?: string;

  @ApiPropertyOptional({ description: 'Detalles del procedimiento' })
  @IsObject()
  @IsOptional()
  procedureDetails?: {
    startTime?: string;
    endTime?: string;
    duration?: number;
    anesthesiaType?: string;
    complications?: string[];
    bloodLoss?: number;
    vitalSigns?: {
      time: string;
      heartRate?: number;
      bloodPressure?: string;
      temperature?: number;
      oxygenSaturation?: number;
    }[];
    medications?: {
      name: string;
      dosage: string;
      time: string;
    }[];
  };

  @ApiPropertyOptional({
    description: 'Estado de la documentación',
    enum: DocumentationStatus,
    default: DocumentationStatus.DRAFT,
  })
  @IsEnum(DocumentationStatus)
  @IsOptional()
  status?: DocumentationStatus;
}
