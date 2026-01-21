import { IsOptional } from "class-validator";
import { EciviEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField, IsBooleanField } from "src/shared/util";
import { ApiProperty } from "@nestjs/swagger";

export class EciviDto implements EciviEntity {
  @IsOptional()
  @Type(() => Number)
  @IsPositiveField({ message: 'El ID' })
  @MinField({ message: 'El ID del estado civil', minValue: 1 })
  @ApiProperty({ example: 1, description: 'Código del estado civil', required: false })
  ecivi_cod_ecivi?: number;

  @Type(() => String)
  @IsStringField({ message: 'El nombre del estado civil' })
  @ApiProperty({ example: 'CASADO/A', description: 'Nombre del estado civil' })
  ecivi_nom_ecivi: string;

  @Type(() => Boolean)
  @IsBooleanField({ message: 'Si requiere cónyuge' })
  @ApiProperty({ example: true, description: 'true si requiere datos de cónyuge' })
  ecivi_req_conyu: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBooleanField({ message: 'El estado' })
  @ApiProperty({ example: true, description: 'Estado activo/inactivo', required: false, default: true })
  ecivi_est_ecivi?: boolean;
}

