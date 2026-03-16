import { IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";

export class TidenDto {

    @IsOptional()
    @Type(() => Number)
    @IsPositiveField({ message: 'El ID' })
    @MinField({ message: 'El ID del estado', minValue: 0 })
    tiden_cod_tiden?: number;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    tiden_des_tiden: string;

    @Type(() => String)
    @IsStringField({ message: 'Abreviatura' })
    tiden_abr_tiden: string;
}