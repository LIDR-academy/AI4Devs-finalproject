import { IsOptional } from "class-validator";
import { TpersEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class TpersDto implements TpersEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo de persona', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo de persona', required: false })
  tpers_cod_tpers?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo de persona' })
  @ApiProperty({ example: 'NATURAL', description: 'Nombre del tipo de persona' })
  tpers_nom_tpers: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  tpers_est_tpers?: boolean;
}

