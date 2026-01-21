import { ApiProperty } from '@nestjs/swagger';
import { PersoResponseDto } from './perso.response.dto';
import { ClienResponseDto } from './clien.response.dto';
import { CldomResponseDto } from '../../../../cldom/infrastructure/dto/response/cldom.response.dto';
import { ClecoResponseDto } from '../../../../cleco/infrastructure/dto/response/cleco.response.dto';
import { ClrepResponseDto } from '../../../../clrep/infrastructure/dto/response/clrep.response.dto';
import { ClcygResponseDto } from '../../../../clcyg/infrastructure/dto/response/clcyg.response.dto';
import { CllabResponseDto } from '../../../../cllab/infrastructure/dto/response/cllab.response.dto';
import { ClrefResponseDto } from '../../../../clref/infrastructure/dto/response/clref.response.dto';
import { ClfinResponseDto } from '../../../../clfin/infrastructure/dto/response/clfin.response.dto';
import { ClbncResponseDto } from '../../../../clbnc/infrastructure/dto/response/clbnc.response.dto';
import { ClbenResponseDto } from '../../../../clben/infrastructure/dto/response/clben.response.dto';
import { ClrfiResponseDto } from '../../../../clrfi/infrastructure/dto/response/clrfi.response.dto';
import { ClasmResponseDto } from '../../../../clasm/infrastructure/dto/response/clasm.response.dto';

/**
 * DTO de respuesta para actualizar cliente completo
 * Incluye todas las relaciones actualizadas
 */
export class ActualizarClienteCompletoResponseDto {
  @ApiProperty({ type: PersoResponseDto, description: 'Datos actualizados de la persona' })
  persona: PersoResponseDto;

  @ApiProperty({ type: ClienResponseDto, description: 'Datos actualizados del cliente' })
  cliente: ClienResponseDto;

  @ApiProperty({ type: CldomResponseDto, description: 'Datos actualizados del domicilio' })
  domicilio: CldomResponseDto;

  @ApiProperty({ type: ClecoResponseDto, description: 'Datos actualizados de la actividad económica' })
  actividadEconomica: ClecoResponseDto;

  @ApiProperty({ type: ClrepResponseDto, description: 'Datos del representante', required: false, nullable: true })
  representante?: ClrepResponseDto | null;

  @ApiProperty({ type: ClcygResponseDto, description: 'Datos del cónyuge', required: false, nullable: true })
  conyuge?: ClcygResponseDto | null;

  @ApiProperty({ type: CllabResponseDto, description: 'Datos de información laboral', required: false, nullable: true })
  informacionLaboral?: CllabResponseDto | null;

  @ApiProperty({ type: [ClrefResponseDto], description: 'Lista de referencias actualizadas', isArray: true })
  referencias?: ClrefResponseDto[];

  @ApiProperty({ type: [ClfinResponseDto], description: 'Lista de información financiera actualizada', isArray: true })
  informacionFinanciera?: ClfinResponseDto[];

  @ApiProperty({ type: ClbncResponseDto, description: 'Datos del usuario de banca digital', required: false, nullable: true })
  usuarioBancaDigital?: ClbncResponseDto | null;

  @ApiProperty({ type: [ClbenResponseDto], description: 'Lista de beneficiarios actualizados', isArray: true })
  beneficiarios?: ClbenResponseDto[];

  @ApiProperty({ type: ClrfiResponseDto, description: 'Datos de residencia fiscal', required: false, nullable: true })
  residenciaFiscal?: ClrfiResponseDto | null;

  @ApiProperty({ type: ClasmResponseDto, description: 'Datos de asamblea', required: false, nullable: true })
  asamblea?: ClasmResponseDto | null;
}

