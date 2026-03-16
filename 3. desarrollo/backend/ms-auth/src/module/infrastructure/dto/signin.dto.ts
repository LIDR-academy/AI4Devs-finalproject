import { SignInInterface } from "../../domain/entity";
import { Type } from "class-transformer";
import { IsStrongPassword } from "class-validator";
import { IsRequiredField, } from "src/shared/util";

export class SignInDto implements SignInInterface {
    @Type(() => String)
    @IsRequiredField({ message: 'El nombre de usuario' })
    username: string;

    @Type(() => String)
    @IsRequiredField({ message: 'La contraseña' })
    //@IsStrongPassword({}, { message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo.' })
    password: string;

}