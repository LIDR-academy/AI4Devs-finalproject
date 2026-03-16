import { IconsEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsPositiveField, IsStringField, MinField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';

export class IconsDto implements IconsEntity {

    @Type(() => Number)
    @IsPositiveField({ message: 'El color' })
    @MinField({ message: 'El color del icono', minValue: 0 })
    @ApiProperty({ example: 1, description: 'El color del icono' })
    icons_cod_color: number;

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    @ApiProperty({ example: 'Descripción del Iconsl', description: 'La descripción del Iconsl' })
    icons_des_icons: string;

    @Type(() => String)
    @IsStringField({ message: 'HTML' })
    @ApiProperty({ example: 'icon', description: 'Guardar' })
    icons_cod_html: string;


}