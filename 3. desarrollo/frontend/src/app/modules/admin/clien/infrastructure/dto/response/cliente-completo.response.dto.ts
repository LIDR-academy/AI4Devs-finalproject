import { PersoResponseDto } from './perso.response.dto';
import { ClienResponseDto } from './clien.response.dto';

/**
 * DTO de respuesta para Cliente Completo (desde backend)
 */
export interface ClienteCompletoResponseDto {
  persona: PersoResponseDto;
  cliente: ClienResponseDto;
  domicilio?: any | null;
  actividadEconomica?: any | null;
  representante?: any | null;
  conyuge?: any | null;
  informacionLaboral?: any | null;
  referencias?: any[];
  informacionFinanciera?: any[];
  usuarioBancaDigital?: any | null;
  beneficiarios?: any[];
  residenciaFiscal?: any | null;
  asamblea?: any | null;
}

