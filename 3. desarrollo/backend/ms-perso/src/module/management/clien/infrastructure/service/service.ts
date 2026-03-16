import { Injectable } from "@nestjs/common";
import { ClienEnum } from "../enum/enum";
import { ClienUseCase } from "../../application/usecase";
import { ClienParams, ClienEntity, PersoParams, PersoEntity } from "../../domain/entity";
import { ApiResponse, ApiResponses, ConstantMessage, InformationMessage, ResponseUtil } from "src/shared/util";
import { ClienDBRepository } from "../repository/repository";
import { CldomEntity } from "../../../cldom/domain/entity/cldom.entity";
import { ClecoEntity } from "../../../cleco/domain/entity/cleco.entity";
import { ClrepEntity } from "../../../clrep/domain/entity/clrep.entity";
import { ClcygEntity } from "../../../clcyg/domain/entity/clcyg.entity";
import { CllabEntity } from "../../../cllab/domain/entity/cllab.entity";
import { ClrefEntity } from "../../../clref/domain/entity/clref.entity";
import { ClfinEntity } from "../../../clfin/domain/entity/clfin.entity";
import { ClbncEntity } from "../../../clbnc/domain/entity/clbnc.entity";
import { ClbenEntity } from "../../../clben/domain/entity/clben.entity";
import { ClrfiEntity } from "../../../clrfi/domain/entity/clrfi.entity";
import { ClasmEntity } from "../../../clasm/domain/entity/clasm.entity";

@Injectable()
export class ClienService {
  public usecase: ClienUseCase;

  constructor(private readonly repository: ClienDBRepository) {
    this.usecase = new ClienUseCase(this.repository);
  }

  // ========== PERSONA ==========

  async findAllPersonas(params?: PersoParams): Promise<ApiResponses<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: 'Persona', 
        method: 'findAllPersonas' 
      });
      const listed = await this.usecase.findAllPersonas(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<PersoEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findPersonaById(id: number): Promise<ApiResponse<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: 'Persona', 
        method: 'findPersonaById' 
      });
      const found = await this.usecase.findPersonaById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<PersoEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findPersonaByIdentificacion(identificacion: string): Promise<ApiResponse<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: 'Persona', 
        method: 'findPersonaByIdentificacion' 
      });
      const found = await this.usecase.findPersonaByIdentificacion(identificacion);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Persona no encontrada' }, 404);
      }
      return ResponseUtil.response<PersoEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async createPersona(data: PersoEntity): Promise<ApiResponse<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: 'Persona', 
        method: 'createPersona' 
      });
      const created = await this.usecase.createPersona(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<PersoEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async updatePersona(id: number, data: PersoEntity): Promise<ApiResponse<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: 'Persona', 
        method: 'updatePersona' 
      });
      const updated = await this.usecase.updatePersona(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<PersoEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async deletePersona(id: number): Promise<ApiResponse<PersoEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: 'Persona', 
        method: 'deletePersona' 
      });
      const deleted = await this.usecase.deletePersona(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<PersoEntity>(deleted, detail);
    } catch (error: any) {
      throw error;
    }
  }

  // ========== CLIENTE ==========

  async findAll(params?: ClienParams): Promise<ApiResponses<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'list', 
        resource: ClienEnum.title, 
        method: 'findAll' 
      });
      const listed = await this.usecase.findAll(params);
      if (listed.data.length === 0) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoudAll() }, 404);
      }
      return ResponseUtil.responses<ClienEntity>(
        listed.data, 
        listed.total, 
        params || { page: 1, pageSize: 20 }, 
        detail
      );
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClienEnum.title, 
        method: 'findById' 
      });
      const found = await this.usecase.findById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClienEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findClienteCompletoById(id: number): Promise<ApiResponse<{
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
  }>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: 'Cliente Completo', 
        method: 'findClienteCompletoById' 
      });
      const found = await this.usecase.findClienteCompletoById(id);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async findByPersonaId(personaId: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'get', 
        resource: ClienEnum.title, 
        method: 'findByPersonaId' 
      });
      const found = await this.usecase.findByPersonaId(personaId);
      if (found === null) {
        return ResponseUtil.detail({ ...detail, message: 'Cliente no encontrado para esta persona' }, 404);
      }
      return ResponseUtil.response<ClienEntity>(found, detail);
    } catch (error) {
      throw error;
    }
  }

  async create(data: ClienEntity): Promise<ApiResponse<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: ClienEnum.title, 
        method: 'create' 
      });
      const created = await this.usecase.create(data);
      if (created === null) {
        return ResponseUtil.error(detail, 500);
      }
      return ResponseUtil.response<ClienEntity>(created, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: number, data: ClienEntity): Promise<ApiResponse<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: ClienEnum.title, 
        method: 'update' 
      });
      const updated = await this.usecase.update(id, data);
      if (updated === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClienEntity>(updated, detail);
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'delete', 
        resource: ClienEnum.title, 
        method: 'delete' 
      });
      const deleted = await this.usecase.delete(id);
      if (deleted === null) {
        return ResponseUtil.detail({ ...detail, message: ConstantMessage.notFoud(id) }, 404);
      }
      return ResponseUtil.response<ClienEntity>(deleted, detail);
    } catch (error: any) {
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
  ): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'create', 
        resource: 'Cliente Completo', 
        method: 'registrarClienteCompleto' 
      });
      const result = await this.usecase.registrarClienteCompleto(personaData, clienteData, domicilioData, actividadEconomicaData, representanteData, conyugeData, informacionLaboralData, referenciasData, informacionFinancieraData, usuarioBancaDigitalData, beneficiariosData, residenciaFiscalData, asambleaData);
      return ResponseUtil.response<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>(result, detail);
    } catch (error: any) {
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
  ): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    try {
      const detail = InformationMessage.detail({ 
        action: 'update', 
        resource: 'Cliente Completo', 
        method: 'actualizarClienteCompleto' 
      });
      const result = await this.usecase.actualizarClienteCompleto(clienteId, personaData, clienteData, domicilioData, actividadEconomicaData, representanteData, conyugeData, informacionLaboralData, referenciasData, informacionFinancieraData, usuarioBancaDigitalData, beneficiariosData, residenciaFiscalData, asambleaData);
      return ResponseUtil.response<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>(result, detail);
    } catch (error: any) {
      throw error;
    }
  }
}

