import { IsOptional } from "class-validator";
import { NacioEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField, LengthField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class NacioDto implements NacioEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID de la nacionalidad', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código de la nacionalidad', required: false })
  nacio_cod_nacio?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre de la nacionalidad' })
  @ApiProperty({ example: 'ECUATORIANA', description: 'Nombre de la nacionalidad' })
  nacio_nom_nacio: string;

  @Type(() => String)
  @IsStringField({ message: 'El código del país' })
  @LengthField({ message: 'El código del país' }, 1, 3)
  @ApiProperty({ example: 'ECU', description: 'Código ISO 3166-1 del país' })
  nacio_cod_pais: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  nacio_est_nacio?: boolean;
}

