import { ClecoEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Actividad Económica
 * Implementa la interfaz ClecoEntity directamente
 */
export class ClecoResponseDto implements ClecoEntity {
  @ApiProperty({ example: 1, description: 'ID único de la actividad económica' })
  cleco_cod_cleco?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  cleco_cod_clien: number;

  @ApiProperty({ example: 'A011111', description: 'Código actividad económica BCE' })
  cleco_cod_aebce: string;

  @ApiProperty({ example: 'A0111111', description: 'Código subactividad BCE' })
  cleco_cod_saebc: string;

  @ApiProperty({ example: 'A01111111', description: 'Código detalle financiero BCE' })
  cleco_cod_dtfin: string;

  @ApiProperty({ example: 'A', description: 'Código sector BCE' })
  cleco_cod_sebce: string;

  @ApiProperty({ example: 'A01', description: 'Código subsegmento BCE' })
  cleco_cod_ssgbc: string;

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

