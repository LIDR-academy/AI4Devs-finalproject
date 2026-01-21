import { ClienEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Cliente
 * Implementa la interfaz ClienEntity directamente
 */
export class ClienResponseDto implements ClienEntity {
  @ApiProperty({ example: 1, description: 'ID único del cliente (número de ventanilla)' })
  clien_cod_clien?: number;

  @ApiProperty({ example: 1, description: 'ID de la persona (rrfperson)' })
  clien_cod_perso: number;

  @ApiProperty({ example: 1, description: 'ID de la oficina de pertenencia' })
  clien_cod_ofici: number;

  @ApiProperty({ example: true, description: 'true=Socio, false=Cliente' })
  clien_ctr_socio: boolean;

  @ApiProperty({ example: '2020-01-15', description: 'Fecha de ingreso' })
  clien_fec_ingin: Date;

  @ApiProperty({ example: null, description: 'Fecha de salida/baja', required: false, nullable: true })
  clien_fec_salid?: Date | null;

  @ApiProperty({ example: 'Observaciones del cliente', description: 'Observaciones', required: false })
  clien_obs_clien?: string;

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

