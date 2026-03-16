import { ClbncEntity } from "../../../domain/entity";
import { Type } from "class-transformer";
import { IsStringField, IsRequiredField, LengthField, IsNumberField, IsBooleanField } from "src/shared/util";
import { IsDateString } from "class-validator";
import { IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { ClbncEnum } from "../../enum/enum";

export class CreateClbncRequestDto implements Omit<ClbncEntity, 'clbnc_cod_clbnc' | 'created_at' | 'updated_at' | 'deleted_at'> {
  @Type(() => Number)
  @IsRequiredField({ message: 'El cliente' })
  @IsNumberField({ message: 'El cliente' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del cliente (rrfclien)'
  })
  clbnc_cod_clien: number;

  @Type(() => String)
  @IsRequiredField({ message: 'El username' })
  @IsStringField({ message: 'El username' })
  @LengthField({ message: 'El username' }, 1, 150)
  @ApiProperty({ 
    example: 'usuario@email.com', 
    description: 'Username (email o cédula)',
    maxLength: 150
  })
  clbnc_usr_banca: string;

  @Type(() => String)
  @IsRequiredField({ message: 'La contraseña' })
  @IsStringField({ message: 'La contraseña' })
  @LengthField({ message: 'La contraseña' }, 1, 250)
  @ApiProperty({ 
    example: '$2b$10$...', 
    description: 'Password hash (bcrypt)',
    maxLength: 250
  })
  clbnc_pwd_banca: string;

  @IsRequiredField({ message: 'La fecha de registro' })
  @IsDateString({}, { message: 'La fecha de registro debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-01-15', 
    description: 'Fecha de registro',
    type: String,
    format: 'date'
  })
  clbnc_fec_regis: Date;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de último ingreso debe ser una fecha válida' })
  @ApiProperty({ 
    example: '2025-01-15T10:30:00Z', 
    description: 'Último ingreso',
    required: false,
    nullable: true,
    type: String,
    format: 'date-time'
  })
  clbnc_fec_ultin?: Date | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El token de sesión' })
  @LengthField({ message: 'El token de sesión' }, 1, 250)
  @ApiProperty({ 
    example: 'token123...', 
    description: 'Token de sesión activa',
    required: false,
    nullable: true,
    maxLength: 250
  })
  clbnc_tok_sesio?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El token de notificación' })
  @LengthField({ message: 'El token de notificación' }, 1, 250)
  @ApiProperty({ 
    example: 'fcm_token123...', 
    description: 'Token push notifications',
    required: false,
    nullable: true,
    maxLength: 250
  })
  clbnc_tok_notif?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El IMEI del dispositivo' })
  @LengthField({ message: 'El IMEI del dispositivo' }, 1, 100)
  @ApiProperty({ 
    example: '123456789012345', 
    description: 'IMEI del dispositivo',
    required: false,
    nullable: true,
    maxLength: 100
  })
  clbnc_imei_disp?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El nombre del dispositivo' })
  @LengthField({ message: 'El nombre del dispositivo' }, 1, 150)
  @ApiProperty({ 
    example: 'MI PHONE', 
    description: 'Nombre del dispositivo',
    required: false,
    nullable: true,
    maxLength: 150
  })
  clbnc_nom_dispo?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'Los detalles del dispositivo' })
  @LengthField({ message: 'Los detalles del dispositivo' }, 1, 250)
  @ApiProperty({ 
    example: 'Mozilla/5.0...', 
    description: 'User agent / modelo',
    required: false,
    nullable: true,
    maxLength: 250
  })
  clbnc_det_dispo?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La IP del último acceso' })
  @LengthField({ message: 'La IP del último acceso' }, 1, 50)
  @ApiProperty({ 
    example: '192.168.1.1', 
    description: 'IP último acceso',
    required: false,
    nullable: true,
    maxLength: 50
  })
  clbnc_ipa_ultin?: string | null;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La latitud' })
  @ApiProperty({ 
    example: -0.180653, 
    description: 'Latitud GPS',
    required: false,
    nullable: true,
    type: Number
  })
  clbnc_lat_ultin?: number | null;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'La longitud' })
  @ApiProperty({ 
    example: -78.467834, 
    description: 'Longitud GPS',
    required: false,
    nullable: true,
    type: Number
  })
  clbnc_lon_ultin?: number | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'La geocodificación' })
  @LengthField({ message: 'La geocodificación' }, 1, 250)
  @ApiProperty({ 
    example: 'QUITO, ECUADOR', 
    description: 'Geocoder (dirección)',
    required: false,
    nullable: true,
    maxLength: 250
  })
  clbnc_geo_ultin?: string | null;

  @Type(() => String)
  @IsOptional()
  @IsStringField({ message: 'El mensaje de bienvenida' })
  @LengthField({ message: 'El mensaje de bienvenida' }, 1, 250)
  @ApiProperty({ 
    example: 'Bienvenido a nuestra banca digital', 
    description: 'Mensaje de bienvenida',
    required: false,
    nullable: true,
    maxLength: 250
  })
  clbnc_msj_bienv?: string | null;

  @Type(() => Boolean)
  @IsOptional()
  @IsBooleanField({ message: 'El estado activo' })
  @ApiProperty({ 
    example: true, 
    description: 'Estado activo',
    required: false,
    default: true
  })
  clbnc_ctr_activ?: boolean;

  @Type(() => Boolean)
  @IsOptional()
  @IsBooleanField({ message: 'Aceptó términos' })
  @ApiProperty({ 
    example: false, 
    description: 'Aceptó términos',
    required: false,
    default: false
  })
  clbnc_ctr_termi?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El límite diario' })
  @ApiProperty({ 
    example: 1000.00, 
    description: 'Límite diario transferencias',
    required: false,
    default: 1000,
    type: Number
  })
  clbnc_lim_diario?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumberField({ message: 'El límite mensual' })
  @ApiProperty({ 
    example: 15000.00, 
    description: 'Límite mensual transferencias',
    required: false,
    default: 15000,
    type: Number
  })
  clbnc_lim_mensu?: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El usuario que crea' })
  @IsNumberField({ message: 'El usuario que crea' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del usuario que crea el registro'
  })
  created_by: number;

  @Type(() => Number)
  @IsRequiredField({ message: 'El usuario que actualiza' })
  @IsNumberField({ message: 'El usuario que actualiza' })
  @ApiProperty({ 
    example: 1, 
    description: 'ID del usuario que actualiza el registro'
  })
  updated_by: number;
}

