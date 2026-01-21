import { IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";

export class PerfiDto {

    @IsOptional()
    @Type(() => Number)
    @IsPositiveField({ message: 'El ID' })
    @MinField({ message: 'El ID del estado', minValue: 0 })
    perfi_cod_perfi?: number;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    perfi_des_perfi: string;
}