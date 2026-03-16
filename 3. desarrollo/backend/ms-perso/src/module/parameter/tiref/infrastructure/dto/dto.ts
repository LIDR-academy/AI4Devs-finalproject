import { IsOptional } from "class-validator";
import { TirefEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class TirefDto implements TirefEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo de referencia', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo de referencia', required: false })
  tiref_cod_tiref?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo de referencia' })
  @ApiProperty({ example: 'PERSONAL', description: 'Nombre del tipo de referencia' })
  tiref_nom_tiref: string;

  @Type(() => Boolean)
  @IsBooleanField({ message: 'Si requiere datos financieros' })
  @ApiProperty({ example: false, description: 'true si requiere datos financieros (cuenta, saldo)' })
  tiref_req_finan: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  tiref_est_tiref?: boolean;
}

