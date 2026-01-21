import { Type } from "class-transformer";
import { IsRequiredField, } from "src/shared/util";

export class SignInDto {
    @Type(() => String)
    @IsRequiredField({ message: 'El nombre de usuario' })
    username: string;

    @Type(() => String)
    @IsRequiredField({ message: 'La contraseña' })
    password: string;

}