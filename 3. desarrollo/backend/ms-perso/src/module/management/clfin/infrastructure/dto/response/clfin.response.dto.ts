import { ClfinEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Información Financiera
 * Implementa la interfaz ClfinEntity directamente
 */
export class ClfinResponseDto implements ClfinEntity {
  @ApiProperty({ example: 1, description: 'ID único de la información financiera' })
  clfin_cod_clfin?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clfin_cod_clien: number;

  @ApiProperty({ example: 1, description: 'Tipo de información financiera (FK a rrftifin): I=Ingreso, G=Gasto, A=Activo, P=Pasivo' })
  clfin_cod_tifin: number;

  @ApiProperty({ example: 2500.00, description: 'Monto mensual o valor', type: Number })
  clfin_val_monto: number;

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

