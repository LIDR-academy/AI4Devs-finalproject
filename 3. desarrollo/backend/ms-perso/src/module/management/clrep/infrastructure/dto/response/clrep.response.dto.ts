import { ClrepEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Representante
 * Implementa la interfaz ClrepEntity directamente
 */
export class ClrepResponseDto implements ClrepEntity {
  @ApiProperty({ example: 1, description: 'ID único del representante' })
  clrep_cod_clrep?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clrep_cod_clien: number;

  @ApiProperty({ example: 2, description: 'ID de la persona representante (rrfperson)' })
  clrep_cod_perso: number;

  @ApiProperty({ example: 1, description: 'Tipo de representante (FK a rrftrep)' })
  clrep_cod_trep: number;

  @ApiProperty({ example: '2020-01-15', description: 'Fecha de nombramiento', required: false, nullable: true })
  clrep_fec_nombr?: Date | null;

  @ApiProperty({ example: '2025-01-15', description: 'Fecha de vencimiento', required: false, nullable: true })
  clrep_fec_venci?: Date | null;

  @ApiProperty({ example: 'Representante legal designado por escritura pública', description: 'Observaciones', required: false, nullable: true })
  clrep_obs_clrep?: string | null;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de creación', required: false })
  created_at?: Date;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de última modificación', required: false })
  updated_at?: Date;

  @ApiProperty({ example: 1, description: 'ID del usuario que creó el registro' })
  created_by: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que modificó el registro' })
  updated_by: number;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  deleted_at?: Date | null;
}

