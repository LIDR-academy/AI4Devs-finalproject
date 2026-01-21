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
 * DTO de respuesta para consultar cliente completo
 * Incluye todas las relaciones y cálculos financieros
 */
export class ClienteCompletoResponseDto {
  @ApiProperty({ type: PersoResponseDto, description: 'Datos de la persona' })
  persona: PersoResponseDto;

  @ApiProperty({ type: ClienResponseDto, description: 'Datos del cliente' })
  cliente: ClienResponseDto;

  @ApiProperty({ type: CldomResponseDto, description: 'Domicilio del cliente', required: false, nullable: true })
  domicilio: CldomResponseDto | null;

  @ApiProperty({ type: ClecoResponseDto, description: 'Actividad económica del cliente', required: false, nullable: true })
  actividadEconomica: ClecoResponseDto | null;

  @ApiProperty({ 
    type: Object, 
    description: 'Representante legal del cliente (incluye datos de la persona del representante)', 
    required: false, 
    nullable: true 
  })
  representante: (ClrepResponseDto & { personaRepresentante?: PersoResponseDto | null }) | null;

  @ApiProperty({ 
    type: Object, 
    description: 'Cónyuge del cliente (incluye datos de la persona del cónyuge)', 
    required: false, 
    nullable: true 
  })
  conyuge: (ClcygResponseDto & { personaConyuge?: PersoResponseDto | null }) | null;

  @ApiProperty({ type: CllabResponseDto, description: 'Información laboral del cliente', required: false, nullable: true })
  informacionLaboral: CllabResponseDto | null;

  @ApiProperty({ 
    type: Array, 
    description: 'Referencias del cliente (incluye datos de personas relacionadas si aplica)', 
    isArray: true 
  })
  referencias: (ClrefResponseDto & { personaReferencia?: PersoResponseDto | null })[];

  @ApiProperty({ type: [ClfinResponseDto], description: 'Información financiera del cliente', isArray: true })
  informacionFinanciera: ClfinResponseDto[];

  @ApiProperty({ type: ClbncResponseDto, description: 'Usuario de banca digital', required: false, nullable: true })
  usuarioBancaDigital: ClbncResponseDto | null;

  @ApiProperty({ type: [ClbenResponseDto], description: 'Beneficiarios de banca digital', isArray: true })
  beneficiarios: ClbenResponseDto[];

  @ApiProperty({ type: ClrfiResponseDto, description: 'Residencia fiscal del cliente', required: false, nullable: true })
  residenciaFiscal: ClrfiResponseDto | null;

  @ApiProperty({ type: ClasmResponseDto, description: 'Participación en asamblea', required: false, nullable: true })
  asamblea: ClasmResponseDto | null;

  @ApiProperty({
    type: Object,
    description: 'Cálculos financieros basados en la información financiera',
    example: {
      capacidadPago: 1500.00,
      patrimonio: 50000.00,
      totalIngresos: 3000.00,
      totalGastos: 1500.00,
      totalActivos: 100000.00,
      totalPasivos: 50000.00,
    },
  })
  calculosFinancieros: {
    capacidadPago: number;
    patrimonio: number;
    totalIngresos: number;
    totalGastos: number;
    totalActivos: number;
    totalPasivos: number;
  };
}

