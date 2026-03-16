import { IsOptional } from "class-validator";
import { IfinaEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField, LengthField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class IfinaDto implements IfinaEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID de la institución financiera', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código de la institución financiera', required: false })
  ifina_cod_ifina?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre de la institución financiera' })
  @ApiProperty({ example: 'BANCO PICHINCHA', description: 'Nombre de la institución financiera' })
  ifina_nom_ifina: string;

  @IsOptional()
  @Type(() => String)
  @IsStringField({ message: 'El código SPI' })
  @LengthField({ message: 'El código SPI' }, 1, 20)
  @ApiProperty({ example: 'BPIC', description: 'Código SPI del BCE', required: false })
  ifina_cod_spi?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  ifina_est_ifina?: boolean;
}

