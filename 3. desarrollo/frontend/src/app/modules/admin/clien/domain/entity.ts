/**
 * Entidad de dominio Persona
 * Representa una persona física o jurídica
 */
export interface PersoEntity {
  /** ID interno (SERIAL) */
  perso_cod_perso?: number;
  /** Tipo de persona: 1=Natural, 2=Jurídica */
  perso_cod_tpers: number;
  /** Tipo de identificación: 1=Cédula, 2=RUC, etc. */
  perso_cod_tiden: number;
  /** Número de identificación (cédula/RUC) */
  perso_ide_perso: string;
  /** Nombre completo o razón social */
  perso_nom_perso: string;
  /** Fecha de nacimiento o constitución */
  perso_fec_inici?: Date | null;
  /** Sexo: 1=Masculino, 2=Femenino */
  perso_cod_sexos?: number | null;
  /** Nacionalidad */
  perso_cod_nacio?: number | null;
  /** Nivel de instrucción */
  perso_cod_instr?: number | null;
  /** Email */
  perso_ema_perso?: string | null;
  /** Teléfono principal */
  perso_tel_perso?: string | null;
  /** Teléfono secundario */
  perso_cel_perso?: string | null;
  /** Fecha de creación */
  created_at?: Date;
  /** Fecha de última modificación */
  updated_at?: Date;
  /** Fecha de eliminación (soft delete) */
  deleted_at?: Date | null;
}

/**
 * Entidad de dominio Cliente
 * Representa un cliente o socio de la cooperativa
 */
export interface ClienEntity {
  /** ID interno (SERIAL) */
  clien_cod_clien?: number;
  /** ID de la persona asociada (1:1) */
  clien_cod_perso: number;
  /** ID de la oficina */
  clien_cod_ofici: number;
  /** Es socio (true) o cliente (false) */
  clien_ctr_socio: boolean;
  /** Fecha de ingreso como socio */
  clien_fec_ingin: Date;
  /** Fecha de salida como socio */
  clien_fec_salid?: Date | null;
  /** Observaciones */
  clien_des_obser?: string | null;
  /** Fecha de creación */
  created_at?: Date;
  /** Fecha de última modificación */
  updated_at?: Date;
  /** Fecha de eliminación (soft delete) */
  deleted_at?: Date | null;
  
  // Denormalized for display
  /** Datos de la persona asociada */
  persona?: PersoEntity;
}

/**
 * Entidad completa de Cliente con todos sus datos relacionados
 */
export interface ClienteCompletoEntity {
  /** Datos de la persona */
  persona: PersoEntity;
  /** Datos del cliente */
  cliente: ClienEntity;
  /** Domicilio (opcional) */
  domicilio?: any | null;
  /** Actividad económica (opcional) */
  actividadEconomica?: any | null;
  /** Representante (opcional) */
  representante?: any | null;
  /** Cónyuge (opcional) */
  conyuge?: any | null;
  /** Información laboral (opcional) */
  informacionLaboral?: any | null;
  /** Referencias (opcional, array) */
  referencias?: any[];
  /** Información financiera (opcional, array) */
  informacionFinanciera?: any[];
  /** Usuario banca digital (opcional) */
  usuarioBancaDigital?: any | null;
  /** Beneficiarios (opcional, array) */
  beneficiarios?: any[];
  /** Residencia fiscal (opcional) */
  residenciaFiscal?: any | null;
  /** Asamblea (opcional) */
  asamblea?: any | null;
}

/**
 * Parámetros para consultas de Personas
 */
export interface PersoParams {
  /** Filtrar por tipo de persona */
  tipoPersona?: number;
  /** Filtrar por tipo de identificación */
  tipoIdentificacion?: number;
  /** Buscar por identificación */
  identificacion?: string;
  /** Buscar por nombre */
  nombre?: string;
  /** Solo activos */
  active?: boolean;
  /** Página */
  page?: number;
  /** Límite por página */
  limit?: number;
}

/**
 * Parámetros para consultas de Clientes
 */
export interface ClienParams {
  /** Filtrar por oficina */
  oficinaId?: number;
  /** Filtrar por si es socio */
  esSocio?: boolean;
  /** Filtrar por activo */
  active?: boolean;
  /** Buscar por identificación de persona */
  identificacion?: string;
  /** Buscar por nombre de persona */
  nombre?: string;
  /** Fecha de ingreso desde */
  fechaIngresoDesde?: Date;
  /** Fecha de ingreso hasta */
  fechaIngresoHasta?: Date;
  /** Página */
  page?: number;
  /** Límite por página */
  limit?: number;
}

