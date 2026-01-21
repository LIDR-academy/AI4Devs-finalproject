import { CreatePersoRequestDto } from './create-perso.request.dto';
import { CreateClienRequestDto } from './create-clien.request.dto';
import { CreateCldomRequestDto } from '../../../../cldom/infrastructure/dto/request/create-cldom.request.dto';
import { CreateClecoRequestDto } from '../../../../cleco/infrastructure/dto/request/create-cleco.request.dto';
import { CreateClrepRequestDto } from '../../../../clrep/infrastructure/dto/request/create-clrep.request.dto';
import { CreateClcygRequestDto } from '../../../../clcyg/infrastructure/dto/request/create-clcyg.request.dto';
import { CreateCllabRequestDto } from '../../../../cllab/infrastructure/dto/request/create-cllab.request.dto';
import { CreateClrefRequestDto } from '../../../../clref/infrastructure/dto/request/create-clref.request.dto';
import { CreateClfinRequestDto } from '../../../../clfin/infrastructure/dto/request/create-clfin.request.dto';
import { CreateClbncRequestDto } from '../../../../clbnc/infrastructure/dto/request/create-clbnc.request.dto';
import { CreateClbenRequestDto } from '../../../../clben/infrastructure/dto/request/create-clben.request.dto';
import { CreateClrfiRequestDto } from '../../../../clrfi/infrastructure/dto/request/create-clrfi.request.dto';
import { CreateClasmRequestDto } from '../../../../clasm/infrastructure/dto/request/create-clasm.request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para registrar un cliente completo (Persona + Cliente + Domicilio + Actividad Económica + Representante opcional + Cónyuge opcional + Información Laboral opcional + Referencias opcionales + Información Financiera opcional + Usuario Banca Digital opcional + Beneficiarios opcionales + Residencia Fiscal opcional + Asamblea opcional en transacción unificada)
 * Este DTO combina los datos de Persona, Cliente, Domicilio, Actividad Económica, Representante (opcional), Cónyuge (opcional), Información Laboral (opcional), Referencias (opcional, 1:N), Información Financiera (opcional, 1:N), Usuario Banca Digital (opcional, 1:1), Beneficiarios (opcional, 1:N), Residencia Fiscal (opcional, 1:1) y Asamblea (opcional, 1:1, solo socios) para crear todos en una sola transacción
 * NOTA: Representante es obligatorio si: Edad < 18 años O Tipo persona = Jurídica
 * NOTA: Cónyuge es obligatorio si: Estado civil IN (2=Casado, 3=Unión de hecho, 6=Unión libre)
 * NOTA: Información Laboral es obligatorio si: Tipo persona = Natural AND Edad >= 18
 * NOTA: Referencias es opcional (0 o más). Si tipo es Financiera (3), requiere número de cuenta y saldo
 * NOTA: Información Financiera es opcional (0 o más). Máximo 1 registro por tipo (I=Ingreso, G=Gasto, A=Activo, P=Pasivo)
 * NOTA: Usuario Banca Digital es opcional (1:1). Username debe ser único
 * NOTA: Beneficiarios es opcional (0 o más). Requiere Usuario Banca Digital. clben_cod_clbnc será asignado automáticamente
 * NOTA: Residencia Fiscal es opcional (1:1, CRS/FATCA). clrfi_cod_clien será asignado automáticamente
 * NOTA: Asamblea es opcional (1:1, solo socios). clasm_cod_clien será asignado automáticamente. Si es directivo, requiere fecha de nombramiento directivo
 */
export class RegistrarClienteCompletoRequestDto {
  @ApiProperty({
    type: CreatePersoRequestDto,
    description: 'Datos de la persona (Natural o Jurídica)'
  })
  @ValidateNested()
  @Type(() => CreatePersoRequestDto)
  persona: CreatePersoRequestDto;

  @ApiProperty({
    type: CreateClienRequestDto,
    description: 'Datos del cliente/socio. NOTA: clien_cod_perso será asignado automáticamente'
  })
  @ValidateNested()
  @Type(() => CreateClienRequestDto)
  cliente: Omit<CreateClienRequestDto, 'clien_cod_perso'>;

  @ApiProperty({
    type: CreateCldomRequestDto,
    description: 'Datos del domicilio (obligatorio). NOTA: cldom_cod_clien será asignado automáticamente'
  })
  @ValidateNested()
  @Type(() => CreateCldomRequestDto)
  domicilio: Omit<CreateCldomRequestDto, 'cldom_cod_clien'>;

  @ApiProperty({
    type: CreateClecoRequestDto,
    description: 'Datos de la actividad económica (obligatorio). NOTA: cleco_cod_clien será asignado automáticamente'
  })
  @ValidateNested()
  @Type(() => CreateClecoRequestDto)
  actividadEconomica: Omit<CreateClecoRequestDto, 'cleco_cod_clien'>;

  @ApiProperty({
    type: CreateClrepRequestDto,
    description: 'Datos del representante (opcional: obligatorio si Edad < 18 años O Tipo persona = Jurídica). NOTA: clrep_cod_clien será asignado automáticamente',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClrepRequestDto)
  representante?: Omit<CreateClrepRequestDto, 'clrep_cod_clien'> | null;

  @ApiProperty({
    type: CreateClcygRequestDto,
    description: 'Datos del cónyuge (opcional: obligatorio si Estado civil IN (2=Casado, 3=Unión de hecho, 6=Unión libre)). NOTA: clcyg_cod_clien será asignado automáticamente',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClcygRequestDto)
  conyuge?: Omit<CreateClcygRequestDto, 'clcyg_cod_clien'> | null;

  @ApiProperty({
    type: CreateCllabRequestDto,
    description: 'Datos de información laboral (opcional: obligatorio si Tipo persona = Natural AND Edad >= 18). NOTA: cllab_cod_clien será asignado automáticamente',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCllabRequestDto)
  informacionLaboral?: Omit<CreateCllabRequestDto, 'cllab_cod_clien'> | null;

  @ApiProperty({
    type: [CreateClrefRequestDto],
    description: 'Array de referencias (opcional: 0 o más referencias). NOTA: clref_cod_clien será asignado automáticamente. Si tipo es Financiera (3), requiere número de cuenta y saldo',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateClrefRequestDto)
  referencias?: Omit<CreateClrefRequestDto, 'clref_cod_clien'>[] | null;

  @ApiProperty({
    type: [CreateClfinRequestDto],
    description: 'Array de informaciones financieras (opcional: 0 o más, máximo 1 por tipo). NOTA: clfin_cod_clien será asignado automáticamente. Tipos: I=Ingreso, G=Gasto, A=Activo, P=Pasivo',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateClfinRequestDto)
  informacionFinanciera?: Omit<CreateClfinRequestDto, 'clfin_cod_clien'>[] | null;

  @ApiProperty({
    type: CreateClbncRequestDto,
    description: 'Datos del usuario de banca digital (opcional: 1:1). NOTA: clbnc_cod_clien será asignado automáticamente. Username debe ser único',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClbncRequestDto)
  usuarioBancaDigital?: Omit<CreateClbncRequestDto, 'clbnc_cod_clien'> | null;

  @ApiProperty({
    type: [CreateClbenRequestDto],
    description: 'Array de beneficiarios (opcional: 0 o más, requiere Usuario Banca Digital). NOTA: clben_cod_clbnc será asignado automáticamente',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateClbenRequestDto)
  beneficiarios?: Omit<CreateClbenRequestDto, 'clben_cod_clbnc'>[] | null;

  @ApiProperty({
    type: CreateClrfiRequestDto,
    description: 'Datos de residencia fiscal (opcional: 1:1, CRS/FATCA). NOTA: clrfi_cod_clien será asignado automáticamente',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClrfiRequestDto)
  residenciaFiscal?: Omit<CreateClrfiRequestDto, 'clrfi_cod_clien'> | null;

  @ApiProperty({
    type: CreateClasmRequestDto,
    description: 'Datos de asamblea (opcional: 1:1, solo socios). NOTA: clasm_cod_clien será asignado automáticamente. Si es directivo, requiere fecha de nombramiento directivo',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateClasmRequestDto)
  asamblea?: Omit<CreateClasmRequestDto, 'clasm_cod_clien'> | null;
}

