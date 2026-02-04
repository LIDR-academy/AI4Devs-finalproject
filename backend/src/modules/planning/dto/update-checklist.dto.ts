import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsObject,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistPhase } from '../entities/checklist.entity';

export class UpdateChecklistDto {
  @ApiProperty({
    description: 'Fase del checklist a actualizar',
    enum: ['preInduction', 'preIncision', 'postProcedure'],
    example: 'preInduction',
  })
  @IsString()
  @IsNotEmpty({ message: 'La fase es requerida' })
  phase: 'preInduction' | 'preIncision' | 'postProcedure';

  @ApiProperty({
    description: 'Datos completos de la fase',
    required: false,
  })
  @IsObject()
  @IsOptional()
  phaseData?: ChecklistPhase;

  @ApiProperty({
    description: 'ID del ítem a marcar/desmarcar',
    example: 'item-1',
    required: false,
  })
  @IsString()
  @IsOptional()
  itemId?: string;

  @ApiProperty({
    description: 'Estado del ítem (checked/unchecked)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  checked?: boolean;

  @ApiProperty({
    description: 'Notas adicionales para el ítem',
    example: 'Verificado por anestesiólogo',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
