import { ClbenEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Beneficiario
 * Implementa la interfaz ClbenEntity directamente
 */
export class ClbenResponseDto implements ClbenEntity {
  @ApiProperty({ example: 1, description: 'ID único del beneficiario' })
  clben_cod_clben?: number;

  @ApiProperty({ example: 1, description: 'ID del usuario de banca digital (rrfclbnc)' })
  clben_cod_clbnc: number;

  @ApiProperty({ example: '1234567890', description: 'Número cuenta destino' })
  clben_num_cuent: string;

  @ApiProperty({ example: 1, description: 'Tipo cuenta: 1=Ahorros, 2=Corriente' })
  clben_cod_tcuen: number;

  @ApiProperty({ example: 1, description: 'ID de la institución financiera (rrfifina) si es externo', required: false, nullable: true })
  clben_cod_ifina?: number | null;

  @ApiProperty({ example: 'JUAN PÉREZ', description: 'Nombre del beneficiario' })
  clben_nom_benef: string;

  @ApiProperty({ example: '1234567890', description: 'Cédula/RUC del beneficiario' })
  clben_ide_benef: string;

  @ApiProperty({ example: 1, description: 'Tipo identificación (FK a rrftiden)', required: false, nullable: true })
  clben_cod_tiden?: number | null;

  @ApiProperty({ example: 'beneficiario@email.com', description: 'Email para notificación', required: false, nullable: true })
  clben_ema_benef?: string | null;

  @ApiProperty({ example: false, description: 'Es externo (SPI)' })
  clben_ctr_exter: boolean;

  @ApiProperty({ example: 'JUAN', description: 'Alias del beneficiario', required: false, nullable: true })
  clben_ali_benef?: string | null;

  @ApiProperty({ example: true, description: 'Activo' })
  clben_ctr_activ: boolean;

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

