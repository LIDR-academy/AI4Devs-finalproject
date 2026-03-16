import { ClcygEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Cónyuge
 * Implementa la interfaz ClcygEntity directamente
 */
export class ClcygResponseDto implements ClcygEntity {
  @ApiProperty({ example: 1, description: 'ID único del cónyuge' })
  clcyg_cod_clcyg?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clcyg_cod_clien: number;

  @ApiProperty({ example: 2, description: 'ID de la persona cónyuge (rrfperson)' })
  clcyg_cod_perso: number;

  @ApiProperty({ example: 'EMPRESA XYZ S.A.', description: 'Empresa donde trabaja el cónyuge', required: false, nullable: true })
  clcyg_nom_empre?: string | null;

  @ApiProperty({ example: 'GERENTE GENERAL', description: 'Cargo del cónyuge', required: false, nullable: true })
  clcyg_des_cargo?: string | null;

  @ApiProperty({ example: 2500.00, description: 'Ingresos mensuales del cónyuge', required: false, nullable: true, type: Number })
  clcyg_val_ingre?: number | null;

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

