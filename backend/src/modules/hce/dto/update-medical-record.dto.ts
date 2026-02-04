import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMedicalRecordDto {
  @ApiProperty({
    description: 'Antecedentes médicos personales',
    required: false,
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty({
    description: 'Antecedentes familiares',
    required: false,
  })
  @IsString()
  @IsOptional()
  familyHistory?: string;

  @ApiProperty({
    description: 'Condición o motivo de consulta actual',
    required: false,
  })
  @IsString()
  @IsOptional()
  currentCondition?: string;
}
