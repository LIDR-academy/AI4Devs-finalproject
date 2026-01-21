import { ClienEntity, ClienParams } from "./entity/clien.entity";
import { PersoEntity, PersoParams } from "./entity/perso.entity";
import { CldomEntity } from "../../cldom/domain/entity/cldom.entity";
import { ClecoEntity } from "../../cleco/domain/entity/cleco.entity";
import { ClrepEntity } from "../../clrep/domain/entity/clrep.entity";
import { ClcygEntity } from "../../clcyg/domain/entity/clcyg.entity";
import { CllabEntity } from "../../cllab/domain/entity/cllab.entity";
import { ClrefEntity } from "../../clref/domain/entity/clref.entity";
import { ClfinEntity } from "../../clfin/domain/entity/clfin.entity";
import { ClbncEntity } from "../../clbnc/domain/entity/clbnc.entity";
import { ClbenEntity } from "../../clben/domain/entity/clben.entity";
import { ClrfiEntity } from "../../clrfi/domain/entity/clrfi.entity";
import { ClasmEntity } from "../../clasm/domain/entity/clasm.entity";

/**
 * Puerto (interfaz) unificado para el repositorio de Cliente
 * Gestiona tanto Personas como Clientes
 */
export interface ClienPort {
  // ========== PERSONA ==========
  // Lecturas de Persona
  findPersonaById(id: number): Promise<PersoEntity | null>;
  findPersonaByIdentificacion(identificacion: string): Promise<PersoEntity | null>;
  findAllPersonas(params?: PersoParams): Promise<{ data: PersoEntity[]; total: number }>;
  
  // Escrituras de Persona
  createPersona(data: PersoEntity): Promise<PersoEntity | null>;
  updatePersona(id: number, data: PersoEntity): Promise<PersoEntity | null>;
  deletePersona(id: number): Promise<PersoEntity | null>;  // Soft delete
  
  // ========== CLIENTE ==========
  // Lecturas de Cliente
  findAll(params?: ClienParams): Promise<{ data: ClienEntity[]; total: number }>;
  findById(id: number): Promise<ClienEntity | null>;
  findByPersonaId(personaId: number): Promise<ClienEntity | null>;
  
  /**
   * Obtiene un cliente completo con todas sus relaciones y cálculos financieros
   * @param id ID del cliente
   * @returns Cliente con persona, domicilio, actividad económica, representante (con su persona), cónyuge (con su persona), información laboral, referencias (con personas relacionadas), información financiera, usuario banca digital, beneficiarios, residencia fiscal, asamblea y cálculos financieros
   */
  findClienteCompletoById(id: number): Promise<{
    persona: PersoEntity;
    cliente: ClienEntity;
    domicilio: CldomEntity | null;
    actividadEconomica: ClecoEntity | null;
    representante: (ClrepEntity & { personaRepresentante?: PersoEntity | null }) | null;
    conyuge: (ClcygEntity & { personaConyuge?: PersoEntity | null }) | null;
    informacionLaboral: CllabEntity | null;
    referencias: (ClrefEntity & { personaReferencia?: PersoEntity | null })[];
    informacionFinanciera: ClfinEntity[];
    usuarioBancaDigital: ClbncEntity | null;
    beneficiarios: ClbenEntity[];
    residenciaFiscal: ClrfiEntity | null;
    asamblea: ClasmEntity | null;
    calculosFinancieros: {
      capacidadPago: number;
      patrimonio: number;
      totalIngresos: number;
      totalGastos: number;
      totalActivos: number;
      totalPasivos: number;
    };
  } | null>;
  
  // Escrituras de Cliente
  create(data: ClienEntity): Promise<ClienEntity | null>;
  update(id: number, data: ClienEntity): Promise<ClienEntity | null>;
  delete(id: number): Promise<ClienEntity | null>;  // Soft delete
  
  // ========== TRANSACCIONES UNIFICADAS ==========
  /**
   * Registra un cliente completo (Persona + Cliente + Domicilio + Actividad Económica + Representante opcional + Cónyuge opcional + Información Laboral opcional + Referencias opcionales + Información Financiera opcional + Usuario Banca Digital opcional + Beneficiarios opcionales + Residencia Fiscal opcional + Asamblea opcional) en una transacción
   * @param personaData Datos de la persona
   * @param clienteData Datos del cliente
   * @param domicilioData Datos del domicilio (obligatorio)
   * @param actividadEconomicaData Datos de la actividad económica (obligatorio)
   * @param representanteData Datos del representante (opcional: solo si menor de edad o persona jurídica)
   * @param conyugeData Datos del cónyuge (opcional: solo si estado civil IN (2=Casado, 3=Unión de hecho, 6=Unión libre))
   * @param informacionLaboralData Datos de información laboral (opcional: solo si Tipo persona = Natural AND Edad >= 18)
   * @param referenciasData Array de referencias (opcional: 0 o más referencias)
   * @param informacionFinancieraData Array de informaciones financieras (opcional: 0 o más, máximo 1 por tipo)
   * @param usuarioBancaDigitalData Datos del usuario de banca digital (opcional: 1:1)
   * @param beneficiariosData Array de beneficiarios (opcional: 0 o más, requiere Usuario Banca Digital)
   * @param residenciaFiscalData Datos de residencia fiscal (opcional: 1:1, CRS/FATCA)
   * @param asambleaData Datos de asamblea (opcional: 1:1, solo socios)
   * @returns Cliente creado con datos de persona, domicilio, actividad económica, representante, cónyuge, información laboral, referencias, información financiera, usuario de banca digital, beneficiarios, residencia fiscal y asamblea (si aplica)
   */
  registrarClienteCompleto(
    personaData: PersoEntity,
    clienteData: ClienEntity,
    domicilioData: CldomEntity,
    actividadEconomicaData: ClecoEntity,
    representanteData?: ClrepEntity | null,
    conyugeData?: ClcygEntity | null,
    informacionLaboralData?: CllabEntity | null,
    referenciasData?: ClrefEntity[] | null,
    informacionFinancieraData?: ClfinEntity[] | null,
    usuarioBancaDigitalData?: ClbncEntity | null,
    beneficiariosData?: ClbenEntity[] | null,
    residenciaFiscalData?: ClrfiEntity | null,
    asambleaData?: ClasmEntity | null
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>;
  
  /**
   * Actualiza un cliente completo con todas sus relaciones en una transacción
   * Lógica: Si la relación existe, la actualiza; si no existe y se proporciona, la crea; si existe y no se proporciona, la elimina (soft delete)
   * @param clienteId ID del cliente a actualizar
   * @param personaData Datos actualizados de la persona
   * @param clienteData Datos actualizados del cliente
   * @param domicilioData Datos actualizados del domicilio (obligatorio)
   * @param actividadEconomicaData Datos actualizados de la actividad económica (obligatorio)
   * @param representanteData Datos del representante (opcional: null = eliminar si existe, undefined = no modificar)
   * @param conyugeData Datos del cónyuge (opcional: null = eliminar si existe, undefined = no modificar)
   * @param informacionLaboralData Datos de información laboral (opcional: null = eliminar si existe, undefined = no modificar)
   * @param referenciasData Array de referencias (opcional: null = eliminar todas, undefined = no modificar, array = sync completo)
   * @param informacionFinancieraData Array de informaciones financieras (opcional: null = eliminar todas, undefined = no modificar, array = sync completo)
   * @param usuarioBancaDigitalData Datos del usuario de banca digital (opcional: null = eliminar si existe, undefined = no modificar)
   * @param beneficiariosData Array de beneficiarios (opcional: null = eliminar todas, undefined = no modificar, array = sync completo)
   * @param residenciaFiscalData Datos de residencia fiscal (opcional: null = eliminar si existe, undefined = no modificar)
   * @param asambleaData Datos de asamblea (opcional: null = eliminar si existe, undefined = no modificar)
   * @returns Cliente actualizado con todas sus relaciones
   */
  actualizarClienteCompleto(
    clienteId: number,
    personaData: PersoEntity,
    clienteData: ClienEntity,
    domicilioData: CldomEntity,
    actividadEconomicaData: ClecoEntity,
    representanteData?: ClrepEntity | null,
    conyugeData?: ClcygEntity | null,
    informacionLaboralData?: CllabEntity | null,
    referenciasData?: ClrefEntity[] | null,
    informacionFinancieraData?: ClfinEntity[] | null,
    usuarioBancaDigitalData?: ClbncEntity | null,
    beneficiariosData?: ClbenEntity[] | null,
    residenciaFiscalData?: ClrfiEntity | null,
    asambleaData?: ClasmEntity | null
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>;
}

/**
 * Token para inyección de dependencias
 */
export const CLIEN_REPOSITORY = Symbol('CLIEN_REPOSITORY');

