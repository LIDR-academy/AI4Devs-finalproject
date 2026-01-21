import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Persona
 * Representa una persona (Natural o Jurídica) del sistema
 */
export interface PersoEntity {
  perso_cod_perso?: number;              // ID (SERIAL, primary key)
  perso_cod_tpers: number;               // Tipo persona: 1=Natural, 2=Jurídica
  perso_cod_tiden: number;               // Tipo identificación: 1=Cédula, 2=RUC, 3=Pasaporte
  perso_ide_perso: string;                // Cédula/RUC/Pasaporte (único)
  perso_nom_perso: string;                // APELLIDOS NOMBRES o RAZÓN SOCIAL
  perso_fec_inici: Date;                  // Fecha nacimiento o constitución
  perso_cod_sexos: number;                // 1=M, 2=F, 3=N/A
  perso_cod_nacio: number;                // Nacionalidad
  perso_cod_instr: number;                // Instrucción (0=N/A para jurídica)
  perso_cod_ecivi?: number | null;        // Estado civil (NULL para jurídica)
  perso_cod_etnia?: number | null;        // Etnia SEPS
  perso_tlf_celul?: string;               // Teléfono celular
  perso_tlf_conve?: string;               // Teléfono convencional
  perso_dir_email?: string;               // Correo electrónico
  perso_dac_regci?: string;               // DAC del Registro Civil
  perso_fec_ultrc?: Date | null;          // Fecha última consulta RC
  perso_cap_socia?: number;               // Capital social (solo jurídica)
  perso_fot_perso?: string;               // Ruta foto
  perso_fir_perso?: string;               // Ruta firma
  perso_fec_ultfo?: Date | null;          // Fecha actualización foto
  perso_fec_ultfi?: Date | null;          // Fecha actualización firma
  created_at?: Date;                      // Fecha creación
  updated_at?: Date;                      // Fecha modificación
  created_by: number;                     // Usuario que creó
  updated_by: number;                     // Usuario que modificó
  deleted_at?: Date | null;               // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Persona
 */
export interface PersoParams extends ParamsInterface {
  active?: boolean;                       // Filtrar solo activos
  tipoPersona?: number;                   // Filtrar por tipo persona (1=Natural, 2=Jurídica)
  identificacion?: string;                // Buscar por identificación
  nombre?: string;                         // Buscar por nombre (full-text)
}

