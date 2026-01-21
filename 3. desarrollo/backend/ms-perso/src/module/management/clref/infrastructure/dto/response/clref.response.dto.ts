import { ClrefEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Referencia
 * Implementa la interfaz ClrefEntity directamente
 */
export class ClrefResponseDto implements ClrefEntity {
  @ApiProperty({ example: 1, description: 'ID único de la referencia' })
  clref_cod_clref?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clref_cod_clien: number;

  @ApiProperty({ example: 1, description: 'Tipo de referencia (FK a rrftiref): 1=Personal, 2=Comercial, 3=Financiera' })
  clref_cod_tiref: number;

  @ApiProperty({ example: 2, description: 'ID de la persona (rrfperson) si la referencia es una persona registrada', required: false, nullable: true })
  clref_cod_perso?: number | null;

  @ApiProperty({ example: 'JUAN PÉREZ', description: 'Nombre si no es persona registrada', required: false, nullable: true })
  clref_nom_refer?: string | null;

  @ApiProperty({ example: 'AV. PRINCIPAL 123', description: 'Dirección', required: false, nullable: true })
  clref_dir_refer?: string | null;

  @ApiProperty({ example: '0999999999', description: 'Teléfono', required: false, nullable: true })
  clref_tlf_refer?: string | null;

  @ApiProperty({ example: '1234567890', description: 'Número de cuenta (si financiera)', required: false, nullable: true })
  clref_num_ctadp?: string | null;

  @ApiProperty({ example: 5000.00, description: 'Saldo promedio (si financiera)', required: false, nullable: true, type: Number })
  clref_val_saldo?: number | null;

  @ApiProperty({ example: '2020-01-15', description: 'Fecha apertura (si financiera)', required: false, nullable: true })
  clref_fec_apert?: Date | null;

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

