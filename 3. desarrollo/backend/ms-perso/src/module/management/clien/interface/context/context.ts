import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { ClienEnum } from '../../infrastructure/enum/enum';
import { ClienService } from '../../infrastructure/service/service';
import { ClienEntity, ClienParams, PersoEntity, PersoParams } from '../../domain/entity';
import { CldomEntity } from '../../../cldom/domain/entity/cldom.entity';
import { ClecoEntity } from '../../../cleco/domain/entity/cleco.entity';
import { ClrepEntity } from '../../../clrep/domain/entity/clrep.entity';
import { ClcygEntity } from '../../../clcyg/domain/entity/clcyg.entity';
import { CllabEntity } from '../../../cllab/domain/entity/cllab.entity';
import { ClrefEntity } from '../../../clref/domain/entity/clref.entity';
import { ClfinEntity } from '../../../clfin/domain/entity/clfin.entity';
import { ClbncEntity } from '../../../clbnc/domain/entity/clbnc.entity';
import { ClbenEntity } from '../../../clben/domain/entity/clben.entity';
import { ClrfiEntity } from '../../../clrfi/domain/entity/clrfi.entity';
import { ClasmEntity } from '../../../clasm/domain/entity/clasm.entity';
import {
  CreateClienRequestDto,
  UpdateClienRequestDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(ClienEnum.table)
export class ClienContext {
  constructor(private readonly service: ClienService) { }

  // ========== PERSONA ==========

  @MessagePattern({ sm: ClienEnum.smFindAllPersonas })
  public async findAllPersonas(@Payload() params: ParamsDto & { tipoPersona?: number; identificacion?: string; nombre?: string }): Promise<ApiResponses<PersoEntity>> {
    const persoParams: PersoParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      tipoPersona: params.tipoPersona,
      identificacion: params.identificacion,
      nombre: params.nombre,
    };
    return await this.service.findAllPersonas(persoParams);
  }

  @MessagePattern({ sm: ClienEnum.smFindPersonaById })
  public async findPersonaById(@Payload('id') id: number): Promise<ApiResponse<PersoEntity>> {
    return await this.service.findPersonaById(+id);
  }

  @MessagePattern({ sm: ClienEnum.smFindPersonaByIdentificacion })
  public async findPersonaByIdentificacion(@Payload('identificacion') identificacion: string): Promise<ApiResponse<PersoEntity>> {
    return await this.service.findPersonaByIdentificacion(identificacion);
  }

  @MessagePattern({ sm: ClienEnum.smCreatePersona })
  public async createPersona(@Payload() data: PersoEntity): Promise<ApiResponse<PersoEntity>> {
    return await this.service.createPersona(data);
  }

  @MessagePattern({ sm: ClienEnum.smUpdatePersona })
  public async updatePersona(@Payload() payload: { id: number; data: PersoEntity }): Promise<ApiResponse<PersoEntity>> {
    const { id, data } = payload;
    return await this.service.updatePersona(id, data);
  }

  @MessagePattern({ sm: ClienEnum.smDeletePersona })
  public async deletePersona(@Payload('id') id: number): Promise<ApiResponse<PersoEntity>> {
    return await this.service.deletePersona(+id);
  }

  // ========== CLIENTE ==========

  @MessagePattern({ sm: ClienEnum.smFindAll })
  public async findAll(@Payload() params: ParamsDto & { active?: boolean; esSocio?: boolean; oficina?: number }): Promise<ApiResponses<ClienEntity>> {
    const clienParams: ClienParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      active: params.active,
      esSocio: params.esSocio,
      oficina: params.oficina,
    };
    return await this.service.findAll(clienParams);
  }

  @MessagePattern({ sm: ClienEnum.smFindById })
  public async findById(@Payload('id') id: number): Promise<ApiResponse<ClienEntity>> {
    return await this.service.findById(+id);
  }

  @MessagePattern({ sm: ClienEnum.smFindByPersonaId })
  public async findByPersonaId(@Payload('personaId') personaId: number): Promise<ApiResponse<ClienEntity>> {
    return await this.service.findByPersonaId(+personaId);
  }

  @MessagePattern({ sm: ClienEnum.smFindClienteCompletoById })
  public async findClienteCompletoById(@Payload('id') id: number): Promise<ApiResponse<{
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
    return await this.service.findClienteCompletoById(+id);
  }

  @MessagePattern({ sm: ClienEnum.smCreate })
  public async create(@Payload() data: CreateClienRequestDto): Promise<ApiResponse<ClienEntity>> {
    return await this.service.create(data);
  }

  @MessagePattern({ sm: ClienEnum.smUpdate })
  public async update(@Payload() payload: { id: number; data: UpdateClienRequestDto }): Promise<ApiResponse<ClienEntity>> {
    const { id, data } = payload;
    return await this.service.update(id, data);
  }

  @MessagePattern({ sm: ClienEnum.smDelete })
  public async delete(@Payload('id') id: number): Promise<ApiResponse<ClienEntity>> {
    return await this.service.delete(+id);
  }

  // ========== TRANSACCIONES UNIFICADAS ==========

  @MessagePattern({ sm: ClienEnum.smRegistrarClienteCompleto })
  public async registrarClienteCompleto(@Payload() payload: { persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[] | null; informacionFinanciera?: ClfinEntity[] | null; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[] | null; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    const { persona, cliente, domicilio, actividadEconomica, representante, conyuge, informacionLaboral, referencias, informacionFinanciera, usuarioBancaDigital, beneficiarios, residenciaFiscal, asamblea } = payload;
    return await this.service.registrarClienteCompleto(persona, cliente, domicilio, actividadEconomica, representante, conyuge, informacionLaboral, referencias, informacionFinanciera, usuarioBancaDigital, beneficiarios, residenciaFiscal, asamblea);
  }

  @MessagePattern({ sm: ClienEnum.smActualizarClienteCompleto })
  public async actualizarClienteCompleto(@Payload() payload: {
    clienteId: number;
    persona: PersoEntity;
    cliente: ClienEntity;
    domicilio: CldomEntity;
    actividadEconomica: ClecoEntity;
    representante?: ClrepEntity | null;
    conyuge?: ClcygEntity | null;
    informacionLaboral?: CllabEntity | null;
    referencias?: ClrefEntity[] | null;
    informacionFinanciera?: ClfinEntity[] | null;
    usuarioBancaDigital?: ClbncEntity | null;
    beneficiarios?: ClbenEntity[] | null;
    residenciaFiscal?: ClrfiEntity | null;
    asamblea?: ClasmEntity | null;
  }): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    const { clienteId, ...data } = payload;
    return await this.service.actualizarClienteCompleto(
      clienteId,
      data.persona,
      data.cliente,
      data.domicilio,
      data.actividadEconomica,
      data.representante,
      data.conyuge,
      data.informacionLaboral,
      data.referencias,
      data.informacionFinanciera,
      data.usuarioBancaDigital,
      data.beneficiarios,
      data.residenciaFiscal,
      data.asamblea
    );
  }
}

