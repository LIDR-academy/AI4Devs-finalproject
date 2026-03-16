import { IsOptional } from "class-validator";
import { RasamEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class RasamDto implements RasamEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del tipo de representante en asamblea', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del tipo de representante en asamblea', required: false })
  rasam_cod_rasam?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del tipo de representante en asamblea' })
  @ApiProperty({ example: 'DELEGADO PRINCIPAL', description: 'Nombre del tipo de representante en asamblea' })
  rasam_nom_rasam: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  rasam_est_rasam?: boolean;
}

