import { CldomEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Domicilio
 * Implementa la interfaz CldomEntity directamente
 */
export class CldomResponseDto implements CldomEntity {
  @ApiProperty({ example: 1, description: 'ID único del domicilio' })
  cldom_cod_cldom?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  cldom_cod_clien: number;

  @ApiProperty({ example: '17', description: 'Código provincia INEC' })
  cldom_cod_provi: string;

  @ApiProperty({ example: '1701', description: 'Código cantón INEC' })
  cldom_cod_canto: string;

  @ApiProperty({ example: '170101', description: 'Código parroquia INEC' })
  cldom_cod_parro: string;

  @ApiProperty({ example: 'AV. AMAZONAS N12-123 Y RUMIPAMBA', description: 'Dirección completa' })
  cldom_dir_domic: string;

  @ApiProperty({ example: '022345678', description: 'Teléfono domicilio', required: false, nullable: true })
  cldom_tlf_domic?: string | null;

  @ApiProperty({ example: 'FRENTE AL PARQUE CENTRAL', description: 'Referencia de ubicación', required: false, nullable: true })
  cldom_sit_refdo?: string | null;

  @ApiProperty({ example: -0.1806532, description: 'Latitud GPS', required: false, nullable: true })
  cldom_lat_coord?: number | null;

  @ApiProperty({ example: -78.4678382, description: 'Longitud GPS', required: false, nullable: true })
  cldom_lon_coord?: number | null;

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

