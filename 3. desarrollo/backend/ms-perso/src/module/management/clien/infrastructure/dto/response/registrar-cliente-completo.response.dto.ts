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
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para el registro de cliente completo
 * Incluye la persona, el cliente, el domicilio, la actividad económica, el representante, el cónyuge, la información laboral, las referencias, la información financiera, el usuario de banca digital, los beneficiarios, la residencia fiscal y la asamblea (si aplica) creados
 */
export class RegistrarClienteCompletoResponseDto {
  @ApiProperty({
    type: PersoResponseDto,
    description: 'Persona creada en la transacción'
  })
  persona: PersoResponseDto;

  @ApiProperty({
    type: ClienResponseDto,
    description: 'Cliente creado en la transacción'
  })
  cliente: ClienResponseDto;

  @ApiProperty({
    type: CldomResponseDto,
    description: 'Domicilio creado en la transacción'
  })
  domicilio: CldomResponseDto;

  @ApiProperty({
    type: ClecoResponseDto,
    description: 'Actividad económica creada en la transacción'
  })
  actividadEconomica: ClecoResponseDto;

  @ApiProperty({
    type: ClrepResponseDto,
    description: 'Representante creado en la transacción (si aplica)',
    required: false,
    nullable: true
  })
  representante?: ClrepResponseDto | null;

  @ApiProperty({
    type: ClcygResponseDto,
    description: 'Cónyuge creado en la transacción (si aplica)',
    required: false,
    nullable: true
  })
  conyuge?: ClcygResponseDto | null;

  @ApiProperty({
    type: CllabResponseDto,
    description: 'Información laboral creada en la transacción (si aplica)',
    required: false,
    nullable: true
  })
  informacionLaboral?: CllabResponseDto | null;

  @ApiProperty({
    type: [ClrefResponseDto],
    description: 'Referencias creadas en la transacción (si aplica)',
    required: false,
    isArray: true
  })
  referencias?: ClrefResponseDto[];

  @ApiProperty({
    type: [ClfinResponseDto],
    description: 'Informaciones financieras creadas en la transacción (si aplica)',
    required: false,
    isArray: true
  })
  informacionFinanciera?: ClfinResponseDto[];

  @ApiProperty({
    type: ClbncResponseDto,
    description: 'Usuario de banca digital creado en la transacción (si aplica)',
    required: false,
    nullable: true
  })
  usuarioBancaDigital?: ClbncResponseDto | null;

  @ApiProperty({
    type: [ClbenResponseDto],
    description: 'Beneficiarios creados en la transacción (si aplica)',
    required: false,
    isArray: true
  })
  beneficiarios?: ClbenResponseDto[];

  @ApiProperty({
    type: ClrfiResponseDto,
    description: 'Residencia fiscal creada en la transacción (si aplica)',
    required: false,
    nullable: true
  })
  residenciaFiscal?: ClrfiResponseDto | null;

  @ApiProperty({
    type: ClasmResponseDto,
    description: 'Asamblea creada en la transacción (si aplica, solo socios)',
    required: false,
    nullable: true
  })
  asamblea?: ClasmResponseDto | null;
}

