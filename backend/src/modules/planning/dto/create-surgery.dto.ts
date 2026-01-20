import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SurgeryType } from '../entities/surgery.entity';

export class CreateSurgeryDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  patientId: string;

  @ApiProperty({
    description: 'Nombre del procedimiento quirúrgico',
    example: 'Colecistectomía laparoscópica',
  })
  @IsString()
  @IsNotEmpty({ message: 'El procedimiento es requerido' })
  procedure: string;

  @ApiProperty({
    description: 'Tipo de cirugía',
    enum: SurgeryType,
    example: SurgeryType.ELECTIVE,
  })
  @IsEnum(SurgeryType, { message: 'El tipo de cirugía debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de cirugía es requerido' })
  type: SurgeryType;

  @ApiProperty({
    description: 'Fecha y hora programada',
    example: '2024-02-15T10:00:00Z',
    required: false,
  })
  @IsDateString({}, { message: 'La fecha programada debe ser válida' })
  @IsOptional()
  scheduledDate?: string;

  @ApiProperty({
    description: 'ID del quirófano',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID('4', { message: 'El ID del quirófano debe ser un UUID válido' })
  @IsOptional()
  operatingRoomId?: string;

  @ApiProperty({
    description: 'Notas preoperatorias',
    example: 'Paciente con antecedentes de hipertensión controlada',
    required: false,
  })
  @IsString()
  @IsOptional()
  preopNotes?: string;

  @ApiProperty({
    description: 'Scores de riesgo',
    example: { asa: 2, possum: 15 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  riskScores?: {
    asa?: number;
    possum?: number;
    custom?: number;
  };
}
