import { Injectable, Inject } from '@nestjs/common';
import { ClienEntity, ClienParams } from '../domain/entity/clien.entity';
import { PersoEntity, PersoParams } from '../domain/entity/perso.entity';
import { ClienPort, CLIEN_REPOSITORY } from '../domain/port';
import { ClienValue } from '../domain/value/clien.value';
import { PersoValue } from '../domain/value/perso.value';
import { CldomEntity } from '../../cldom/domain/entity/cldom.entity';
import { CldomValue } from '../../cldom/domain/value/cldom.value';
import { ClecoEntity } from '../../cleco/domain/entity/cleco.entity';
import { ClecoValue } from '../../cleco/domain/value/cleco.value';
import { ClrepEntity } from '../../clrep/domain/entity/clrep.entity';
import { ClrepValue } from '../../clrep/domain/value/clrep.value';
import { ClcygEntity } from '../../clcyg/domain/entity/clcyg.entity';
import { ClcygValue } from '../../clcyg/domain/value/clcyg.value';
import { CllabEntity } from '../../cllab/domain/entity/cllab.entity';
import { CllabValue } from '../../cllab/domain/value/cllab.value';
import { ClrefEntity } from '../../clref/domain/entity/clref.entity';
import { ClrefValue } from '../../clref/domain/value/clref.value';
import { ClfinEntity } from '../../clfin/domain/entity/clfin.entity';
import { ClfinValue } from '../../clfin/domain/value/clfin.value';
import { ClbncEntity } from '../../clbnc/domain/entity/clbnc.entity';
import { ClbncValue } from '../../clbnc/domain/value/clbnc.value';
import { ClbenEntity } from '../../clben/domain/entity/clben.entity';
import { ClbenValue } from '../../clben/domain/value/clben.value';
import { ClrfiEntity } from '../../clrfi/domain/entity/clrfi.entity';
import { ClrfiValue } from '../../clrfi/domain/value/clrfi.value';
import { ClasmEntity } from '../../clasm/domain/entity/clasm.entity';
import { ClasmValue } from '../../clasm/domain/value/clasm.value';

/**
 * UseCase unificado para el módulo de Cliente
 * Implementa toda la lógica de negocio del módulo (Persona + Cliente)
 */
@Injectable()
export class ClienUseCase implements ClienPort {
  constructor(
    @Inject(CLIEN_REPOSITORY)
    private readonly repository: ClienPort
  ) {}

  // ========== PERSONA ==========

  async findAllPersonas(params?: PersoParams): Promise<{ data: PersoEntity[]; total: number }> {
    try {
      return await this.repository.findAllPersonas(params);
    } catch (error) {
      throw error;
    }
  }

  async findPersonaById(id: number): Promise<PersoEntity | null> {
    try {
      return await this.repository.findPersonaById(id);
    } catch (error) {
      throw error;
    }
  }

  async findPersonaByIdentificacion(identificacion: string): Promise<PersoEntity | null> {
    try {
      return await this.repository.findPersonaByIdentificacion(identificacion);
    } catch (error) {
      throw error;
    }
  }

  async createPersona(data: PersoEntity): Promise<PersoEntity | null> {
    try {
      const value = new PersoValue(data).toJson();
      return await this.repository.createPersona(value);
    } catch (error) {
      throw error;
    }
  }

  async updatePersona(id: number, data: PersoEntity): Promise<PersoEntity | null> {
    try {
      const existing = await this.repository.findPersonaById(id);
      if (!existing) {
        throw new Error(`Persona con id ${id} no encontrada`);
      }

      const value = new PersoValue(data, id).toJson();
      return await this.repository.updatePersona(id, value);
    } catch (error) {
      throw error;
    }
  }

  async deletePersona(id: number): Promise<PersoEntity | null> {
    try {
      const existing = await this.repository.findPersonaById(id);
      if (!existing) {
        throw new Error(`Persona con id ${id} no encontrada`);
      }

      return await this.repository.deletePersona(id);
    } catch (error) {
      throw error;
    }
  }

  // ========== CLIENTE ==========

  async findAll(params?: ClienParams): Promise<{ data: ClienEntity[]; total: number }> {
    try {
      return await this.repository.findAll(params);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ClienEntity | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async findByPersonaId(personaId: number): Promise<ClienEntity | null> {
    try {
      return await this.repository.findByPersonaId(personaId);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClienEntity): Promise<ClienEntity | null> {
    try {
      const value = new ClienValue(data).toJson();
      return await this.repository.create(value);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: ClienEntity): Promise<ClienEntity | null> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error(`Cliente con id ${id} no encontrado`);
      }

      const value = new ClienValue(data, id).toJson();
      return await this.repository.update(id, value);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<ClienEntity | null> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new Error(`Cliente con id ${id} no encontrado`);
      }

      return await this.repository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async findClienteCompletoById(id: number): Promise<{
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
  } | null> {
    try {
      if (!id || id <= 0) {
        return null;
      }
      return await this.repository.findClienteCompletoById(id);
    } catch (error) {
      throw error;
    }
  }

  // ========== TRANSACCIONES UNIFICADAS ==========

  async registrarClienteCompleto(
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
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }> {
    try {
      // Normalizar datos mediante Value Objects
      const personaValue = new PersoValue(personaData).toJson();
      const clienteValue = new ClienValue(clienteData).toJson();
      const domicilioValue = new CldomValue(domicilioData).toJson();
      const actividadEconomicaValue = new ClecoValue(actividadEconomicaData).toJson();
      const representanteValue = representanteData ? new ClrepValue(representanteData).toJson() : null;
      const conyugeValue = conyugeData ? new ClcygValue(conyugeData).toJson() : null;
      const informacionLaboralValue = informacionLaboralData ? new CllabValue(informacionLaboralData).toJson() : null;
      const referenciasValue = referenciasData && referenciasData.length > 0
        ? referenciasData.map(ref => new ClrefValue(ref).toJson())
        : null;
      const informacionFinancieraValue = informacionFinancieraData && informacionFinancieraData.length > 0
        ? informacionFinancieraData.map(info => new ClfinValue(info).toJson())
        : null;
      const usuarioBancaDigitalValue = usuarioBancaDigitalData ? new ClbncValue(usuarioBancaDigitalData).toJson() : null;
      const beneficiariosValue = beneficiariosData && beneficiariosData.length > 0
        ? beneficiariosData.map(ben => new ClbenValue(ben).toJson())
        : null;
      const residenciaFiscalValue = residenciaFiscalData ? new ClrfiValue(residenciaFiscalData).toJson() : null;
      const asambleaValue = asambleaData ? new ClasmValue(asambleaData).toJson() : null;

      // Ejecutar transacción unificada
      return await this.repository.registrarClienteCompleto(personaValue, clienteValue, domicilioValue, actividadEconomicaValue, representanteValue, conyugeValue, informacionLaboralValue, referenciasValue, informacionFinancieraValue, usuarioBancaDigitalValue, beneficiariosValue, residenciaFiscalValue, asambleaValue);
    } catch (error) {
      throw error;
    }
  }

  async actualizarClienteCompleto(
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
  ): Promise<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }> {
    try {
      // Validar que el cliente existe
      const clienteExistente = await this.repository.findById(clienteId);
      if (!clienteExistente) {
        throw new Error(`Cliente con id ${clienteId} no encontrado`);
      }

      // Validar que la persona existe
      const personaExistente = await this.repository.findPersonaById(clienteExistente.clien_cod_perso);
      if (!personaExistente) {
        throw new Error(`Persona con id ${clienteExistente.clien_cod_perso} no encontrada`);
      }

      // Validaciones de negocio (similares a registrarClienteCompleto)
      // ... (se pueden agregar validaciones adicionales si es necesario)

      return await this.repository.actualizarClienteCompleto(
        clienteId,
        personaData,
        clienteData,
        domicilioData,
        actividadEconomicaData,
        representanteData,
        conyugeData,
        informacionLaboralData,
        referenciasData,
        informacionFinancieraData,
        usuarioBancaDigitalData,
        beneficiariosData,
        residenciaFiscalData,
        asambleaData
      );
    } catch (error) {
      throw error;
    }
  }
}
