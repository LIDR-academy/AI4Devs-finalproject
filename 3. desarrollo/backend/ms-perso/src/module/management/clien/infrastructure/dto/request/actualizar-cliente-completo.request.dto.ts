import { UpdatePersoRequestDto } from './update-perso.request.dto';
import { UpdateClienRequestDto } from './update-clien.request.dto';
import { UpdateCldomRequestDto } from '../../../../cldom/infrastructure/dto/request/update-cldom.request.dto';
import { UpdateClecoRequestDto } from '../../../../cleco/infrastructure/dto/request/update-cleco.request.dto';
import { UpdateClrepRequestDto } from '../../../../clrep/infrastructure/dto/request/update-clrep.request.dto';
import { UpdateClcygRequestDto } from '../../../../clcyg/infrastructure/dto/request/update-clcyg.request.dto';
import { UpdateCllabRequestDto } from '../../../../cllab/infrastructure/dto/request/update-cllab.request.dto';
import { UpdateClrefRequestDto } from '../../../../clref/infrastructure/dto/request/update-clref.request.dto';
import { UpdateClfinRequestDto } from '../../../../clfin/infrastructure/dto/request/update-clfin.request.dto';
import { UpdateClbncRequestDto } from '../../../../clbnc/infrastructure/dto/request/update-clbnc.request.dto';
import { UpdateClbenRequestDto } from '../../../../clben/infrastructure/dto/request/update-clben.request.dto';
import { UpdateClrfiRequestDto } from '../../../../clrfi/infrastructure/dto/request/update-clrfi.request.dto';
import { UpdateClasmRequestDto } from '../../../../clasm/infrastructure/dto/request/update-clasm.request.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar un cliente completo con todas sus relaciones en una transacción
 * Lógica de actualización:
 * - Persona y Cliente: Siempre se actualizan
 * - Domicilio y Actividad Económica: Siempre se actualizan (si no existen, se crean)
 * - Relaciones 1:1 opcionales (representante, cónyuge, información laboral, residencia fiscal, asamblea, usuario banca digital):
 *   - Si se proporciona con datos: Crea si no existe, actualiza si existe
 *   - Si se proporciona null: Elimina (soft delete) si existe
 *   - Si es undefined: No modifica
 * - Relaciones 1:N (referencias, información financiera, beneficiarios):
 *   - Si se proporciona array: Sync completo (crea nuevos, actualiza existentes, elimina los que no están)
 *   - Si se proporciona null: Elimina todas
 *   - Si es undefined: No modifica
 */
export class ActualizarClienteCompletoRequestDto {
  @ApiProperty({
    type: UpdatePersoRequestDto,
    description: 'Datos actualizados de la persona'
  })
  @ValidateNested()
  @Type(() => UpdatePersoRequestDto)
  persona: UpdatePersoRequestDto;

  @ApiProperty({
    type: UpdateClienRequestDto,
    description: 'Datos actualizados del cliente/socio'
  })
  @ValidateNested()
  @Type(() => UpdateClienRequestDto)
  cliente: UpdateClienRequestDto;

  @ApiProperty({
    type: UpdateCldomRequestDto,
    description: 'Datos actualizados del domicilio (obligatorio). Si no existe, se crea'
  })
  @ValidateNested()
  @Type(() => UpdateCldomRequestDto)
  domicilio: UpdateCldomRequestDto;

  @ApiProperty({
    type: UpdateClecoRequestDto,
    description: 'Datos actualizados de la actividad económica (obligatorio). Si no existe, se crea'
  })
  @ValidateNested()
  @Type(() => UpdateClecoRequestDto)
  actividadEconomica: UpdateClecoRequestDto;

  @ApiProperty({
    type: UpdateClrepRequestDto,
    description: 'Datos del representante. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClrepRequestDto)
  representante?: UpdateClrepRequestDto | null;

  @ApiProperty({
    type: UpdateClcygRequestDto,
    description: 'Datos del cónyuge. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClcygRequestDto)
  conyuge?: UpdateClcygRequestDto | null;

  @ApiProperty({
    type: UpdateCllabRequestDto,
    description: 'Datos de información laboral. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCllabRequestDto)
  informacionLaboral?: UpdateCllabRequestDto | null;

  @ApiProperty({
    type: [UpdateClrefRequestDto],
    description: 'Array de referencias. null = eliminar todas, undefined = no modificar, array = sync completo',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateClrefRequestDto)
  referencias?: UpdateClrefRequestDto[] | null;

  @ApiProperty({
    type: [UpdateClfinRequestDto],
    description: 'Array de información financiera. null = eliminar todas, undefined = no modificar, array = sync completo',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateClfinRequestDto)
  informacionFinanciera?: UpdateClfinRequestDto[] | null;

  @ApiProperty({
    type: UpdateClbncRequestDto,
    description: 'Datos del usuario de banca digital. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClbncRequestDto)
  usuarioBancaDigital?: UpdateClbncRequestDto | null;

  @ApiProperty({
    type: [UpdateClbenRequestDto],
    description: 'Array de beneficiarios. null = eliminar todas, undefined = no modificar, array = sync completo. Requiere Usuario Banca Digital',
    required: false,
    nullable: true,
    isArray: true
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateClbenRequestDto)
  beneficiarios?: UpdateClbenRequestDto[] | null;

  @ApiProperty({
    type: UpdateClrfiRequestDto,
    description: 'Datos de residencia fiscal. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClrfiRequestDto)
  residenciaFiscal?: UpdateClrfiRequestDto | null;

  @ApiProperty({
    type: UpdateClasmRequestDto,
    description: 'Datos de asamblea. null = eliminar si existe, undefined = no modificar, con datos = crear/actualizar. Solo socios',
    required: false,
    nullable: true
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClasmRequestDto)
  asamblea?: UpdateClasmRequestDto | null;
}

