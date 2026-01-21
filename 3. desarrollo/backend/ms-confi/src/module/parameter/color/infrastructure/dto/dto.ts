import { ColorEntity } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField } from "src/shared/util";
import { ApiProperty } from '@nestjs/swagger';

export class ColorDto implements ColorEntity {

    @Type(() => String)
    @IsStringField({ message: 'Descripción' })
    @ApiProperty({ example: 'Descripción del Color', description: 'La descripción del Color' })
    color_des_color: string;

    @Type(() => String)
    @IsStringField({ message: 'Hexadecimal' })
    @ApiProperty({ example: '#FFFFFF', description: 'El valor hexadecimal del Color' })
    color_cod_hexdc: string;
}