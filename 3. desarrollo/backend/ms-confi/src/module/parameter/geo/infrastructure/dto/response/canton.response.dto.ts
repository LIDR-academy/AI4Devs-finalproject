import { CantonEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

export class CantonResponseDto implements CantonEntity {
  @ApiProperty({ example: 1, description: 'ID único del cantón' })
  canto_cod_canto?: number;

  @ApiProperty({ example: 1, description: 'ID de la provincia a la que pertenece' })
  provi_cod_provi: number;

  @ApiProperty({ example: '01', description: 'Código SEPS del cantón' })
  canto_cod_cant: string;

  @ApiProperty({ example: 'Cuenca', description: 'Nombre del cantón' })
  canto_nom_canto: string;

  @ApiProperty({ example: true, description: 'Indica si el cantón está activo' })
  canto_flg_acti: boolean;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de creación', required: false })
  canto_fec_creac?: Date;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Fecha de última modificación', required: false })
  canto_fec_modif?: Date;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  canto_fec_elimi?: Date | null;
}

