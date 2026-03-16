import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PharmacyRequestDto {
  @ApiProperty({ description: 'ID del paciente (UUID)' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Nombre del medicamento', example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  medicationName: string;

  @ApiPropertyOptional({ description: 'Cantidad', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unidad', example: 'comprimidos' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'Instrucciones de uso' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ description: 'Prioridad', enum: ['routine', 'urgent'] })
  @IsOptional()
  @IsIn(['routine', 'urgent'])
  priority?: 'routine' | 'urgent';
}
