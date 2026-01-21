import { applyDecorators } from '@nestjs/common';
import { registerDecorator, ValidationOptions, isString, isNumber, isArray, isPositive, min, isEmail, IsNotEmpty, isBoolean } from 'class-validator';


function buildMessage(message: string , typeMessage: string) {
    return `${message} debe ser ${typeMessage}`;
}

export function IsRequiredField(option: { message: string }) {
    //Ejemplo de uso: @IsRequiredField({'Nombre de usuario'})
    return applyDecorators(
        IsNotEmpty({ message: `${option.message} es obligatorio` })
    );
}

export function IsNumberField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsNumberField({ message: 'Edad' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isNumberField',
            target: object.constructor,
            propertyName,
            options: {
                message: buildMessage(option.message, 'un número'),
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isNumber(value);
                },
            },
        });
    };
}

export function IsStringField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsStringField({ message: 'Nombre de usuario' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isStringField',
            target: object.constructor,
            propertyName,
            options: {
                message: option.message,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isString(value);
                },
            },
        });
    };
}

export function IsPositiveField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsPositiveField({ message: 'Edad' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPositiveField',
            target: object.constructor,
            propertyName,
            options: {
                message: buildMessage(option.message, 'un número positivo'),
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isNumber(value) && isPositive(value);
                },
            },
        });
    };
}

export function IsArrayField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsArrayField({ message: 'Preferencias' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isArrayField',
            target: object.constructor,
            propertyName,
            options: {
                message: buildMessage(option.message, 'un arreglo'),
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isArray(value);
                },
            },
        });
    };
}

export function IsBooleanField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsBooleanField({ message: 'Estado activo' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isBooleanField',
            target: object.constructor,
            propertyName,
            options: {
                message: buildMessage(option.message, 'un valor booleano'),
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isBoolean(value);
                },
            },
        });
    };
}

export function IsEmailField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsEmailField({ message: 'Correo electrónico' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsEmailField',
            target: object.constructor,
            propertyName,
            options: {
                message: buildMessage(option.message, 'un correo electrónico válido'),
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isEmail(value);
                },
            },
        });
    };
}

export function MinField(option: { message: string, minValue: number }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @MinField({ message: 'Edad', minValue: 18 })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'MinField',
            target: object.constructor,
            propertyName,
            options: {
                message: `${option.message} no puede ser menor que ${option.minValue}`,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isNumber(value) && value >= option.minValue;
                },
            },
        });
    };
}

export function MaxField(option: { message: string, maxValue: number }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @MaxField('Edad', 100)
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'MaxField',
            target: object.constructor,
            propertyName,
            options: {
                message: `${option.message} no puede ser mayor que ${option.maxValue}`,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return isNumber(value) && value <= option.maxValue;
                },
            },
        });
    };
}

export function LengthField(option: { message: string }, min: number, max?: number, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @LengthField('Nombre de usuario', 3, 20)
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'LengthField',
            target: object.constructor,
            propertyName,
            options: {
                message: `${option.message} debe tener entre ${min}${max ? ' y ' + max : ''} caracteres`,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return typeof value === 'string' && value.length >= min && (!max || value.length <= max);
                },
            },
        });
    };
}
//@IsDate()
export function IsDateField(option: { message: string }, validationOptions?: ValidationOptions) {
    //Ejemplo de uso: @IsDateField({ message: 'Fecha de nacimiento' })
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsDateField',
            target: object.constructor,
            propertyName,
            options: {
                message: `${option.message} debe ser una fecha válida`,
                ...validationOptions,
            },
            validator: {
                validate(value: any) {
                    return value instanceof Date && !isNaN(value.getTime());
                },
            },
        });
    };
}