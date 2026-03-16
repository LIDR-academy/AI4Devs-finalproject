import { IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";

export class OpcioDto {

    @IsOptional()
    @Type(() => String)
    opcio_cod_opcio?: string;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    opcio_des_opcio: string;

    @Type(() => String)
    @IsStringField({ message: 'URL' })
    opcio_www_opcio: string;

    @Type(() => String)
    @IsStringField({ message: 'Código del padre' })
    opcio_cod_padre: string;

    @Type(() => String)
    @IsStringField({ message: 'Estado' })
    opcio_est_opcio: string;

    @Type(() => Number)
    @IsPositiveField({ message: 'El ID del ícono' })
    @MinField({ message: 'El ID del ícono', minValue: 0 })
    opcio_cod_icons: number;
}