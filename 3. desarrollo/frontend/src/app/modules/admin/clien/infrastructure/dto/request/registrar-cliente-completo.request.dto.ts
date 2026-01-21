import { ClienteCompletoEntity } from '../../../domain/entity';

/**
 * DTO de request para registrar Cliente Completo
 */
export interface RegistrarClienteCompletoRequestDto {
  persona: any; // CreatePersoRequestDto
  cliente: any; // CreateClienRequestDto
  domicilio: any; // CreateCldomRequestDto
  actividadEconomica: any; // CreateClecoRequestDto
  representante?: any | null; // CreateClrepRequestDto
  conyuge?: any | null; // CreateClcygRequestDto
  informacionLaboral?: any | null; // CreateCllabRequestDto
  referencias?: any[]; // CreateClrefRequestDto[]
  informacionFinanciera?: any[]; // CreateClfinRequestDto[]
  usuarioBancaDigital?: any | null; // CreateClbncRequestDto
  beneficiarios?: any[]; // CreateClbenRequestDto[]
  residenciaFiscal?: any | null; // CreateClrfiRequestDto
  asamblea?: any | null; // CreateClasmRequestDto
}

