import { ClasmEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Asamblea
 * Implementa la interfaz ClasmEntity directamente
 */
export class ClasmResponseDto implements ClasmEntity {
  @ApiProperty({ example: 1, description: 'ID único de la asamblea' })
  clasm_cod_clasm?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clasm_cod_clien: number;

  @ApiProperty({ example: 1, description: 'ID del tipo representante asamblea (rrfrasam)', required: false, nullable: true })
  clasm_cod_rasam?: number | null;

  @ApiProperty({ example: '2025-01-15', description: 'Fecha de nombramiento asamblea', required: false, nullable: true })
  clasm_fec_rasam?: Date | null;

  @ApiProperty({ example: false, description: 'Es directivo' })
  clasm_ctr_direc: boolean;

  @ApiProperty({ example: '2025-01-15', description: 'Fecha de nombramiento directivo', required: false, nullable: true })
  clasm_fec_direc?: Date | null;

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

