import { IsEmail, IsString, MinLength, IsOptional, Matches, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  firstName!: string;

  @IsString()
  @MinLength(1, { message: 'El apellido es obligatorio' })
  lastName!: string;

  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  phone?: string;

  @IsIn(['patient', 'doctor'], { message: 'Rol inválido' })
  role!: 'patient' | 'doctor';

  @IsString()
  recaptchaToken!: string;
}
