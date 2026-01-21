import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
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
  CreatePersoRequestDto,
  RegistrarClienteCompletoRequestDto,
  ActualizarClienteCompletoRequestDto,
  UpdateClienRequestDto,
  ClienResponseDto,
  PersoResponseDto,
  RegistrarClienteCompletoResponseDto,
  ActualizarClienteCompletoResponseDto
} from '../../infrastructure/dto';
import { ClienteCompletoResponseDto } from '../../infrastructure/dto/response/cliente-completo.response.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse as ApiResponseSwagger, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('clientes')
@Controller('clientes')
export class ClienController {
  constructor(
    private readonly service: ClienService,
  ) { }

  // ========== PERSONA ==========

  @Get('personas')
  @ApiOperation({ summary: 'Listar todas las personas' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'tipoPersona', required: false, type: Number, description: '1=Natural, 2=Jurídica' })
  @ApiQuery({ name: 'identificacion', required: false, type: String })
  @ApiQuery({ name: 'nombre', required: false, type: String })
  @ApiResponseSwagger({ status: 200, description: 'Listado de personas' })
  public async findAllPersonas(@Query() params: ParamsDto & { tipoPersona?: number; identificacion?: string; nombre?: string }): Promise<ApiResponses<PersoEntity>> {
    try {
      const persoParams: PersoParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        tipoPersona: params.tipoPersona,
        identificacion: params.identificacion,
        nombre: params.nombre,
      };
      return await this.service.findAllPersonas(persoParams);
    } catch (error) {
      throw error;
    }
  }

  @Get('personas/:id')
  @ApiOperation({ summary: 'Obtener persona por ID' })
  @ApiResponseSwagger({ status: 200, description: 'Persona encontrada' })
  public async findPersonaById(@Param('id') id: number): Promise<ApiResponse<PersoEntity>> {
    try {
      return await this.service.findPersonaById(+id);
    } catch (error) {
      throw error;
    }
  }

  @Get('personas/identificacion/:identificacion')
  @ApiOperation({ summary: 'Buscar persona por identificación (cédula/RUC)' })
  @ApiResponseSwagger({ status: 200, description: 'Persona encontrada' })
  public async findPersonaByIdentificacion(@Param('identificacion') identificacion: string): Promise<ApiResponse<PersoEntity>> {
    try {
      return await this.service.findPersonaByIdentificacion(identificacion);
    } catch (error) {
      throw error;
    }
  }

  @Post('personas')
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiBody({ type: CreatePersoRequestDto, description: 'Datos de la persona' })
  @ApiResponseSwagger({ status: 201, description: 'Persona creada exitosamente', type: PersoResponseDto })
  public async createPersona(@Body() data: CreatePersoRequestDto): Promise<ApiResponse<PersoEntity>> {
    try {
      return await this.service.createPersona(data);
    } catch (error) {
      throw error;
    }
  }

  @Put('personas/:id')
  @ApiOperation({ summary: 'Actualizar una persona' })
  @ApiBody({ type: CreatePersoRequestDto, description: 'Datos actualizados de la persona' })
  @ApiResponseSwagger({ status: 200, description: 'Persona actualizada exitosamente', type: PersoResponseDto })
  public async updatePersona(@Param('id') id: number, @Body() data: CreatePersoRequestDto): Promise<ApiResponse<PersoEntity>> {
    try {
      return await this.service.updatePersona(+id, data);
    } catch (error) {
      throw error;
    }
  }

  @Delete('personas/:id')
  @ApiOperation({ summary: 'Eliminar una persona (soft delete)' })
  @ApiResponseSwagger({ status: 200, description: 'Persona eliminada exitosamente' })
  public async deletePersona(@Param('id') id: number): Promise<ApiResponse<PersoEntity>> {
    try {
      return await this.service.deletePersona(+id);
    } catch (error) {
      throw error;
    }
  }

  // ========== CLIENTE ==========

  @Get()
  @ApiOperation({ summary: `Listar todos los ${ClienEnum.title}s` })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Tamaño de página' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filtrar solo activos (sin fecha de salida)' })
  @ApiQuery({ name: 'esSocio', required: false, type: Boolean, description: 'Filtrar por tipo: true=Socio, false=Cliente' })
  @ApiQuery({ name: 'oficina', required: false, type: Number, description: 'Filtrar por oficina' })
  @ApiResponseSwagger({ status: 200, description: 'Listado de clientes', type: [ClienResponseDto] })
  public async findAll(@Query() params: ParamsDto & { active?: boolean; esSocio?: boolean; oficina?: number }): Promise<ApiResponses<ClienEntity>> {
    try {
      const clienParams: ClienParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        active: params.active,
        esSocio: params.esSocio,
        oficina: params.oficina,
      };
      const result = await this.service.findAll(clienParams);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('persona/:personaId')
  @ApiOperation({ summary: `Buscar cliente por ID de persona` })
  @ApiResponseSwagger({ status: 200, description: 'Cliente encontrado', type: ClienResponseDto })
  public async findByPersonaId(@Param('personaId') personaId: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const result = await this.service.findByPersonaId(+personaId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: `Obtener ${ClienEnum.title} por ID` })
  @ApiResponseSwagger({ status: 200, description: 'Cliente encontrado', type: ClienResponseDto })
  public async findById(@Param('id') id: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id/completo')
  @ApiOperation({ 
    summary: `Obtener ${ClienEnum.title} completo con todas sus relaciones y cálculos financieros`,
    description: 'Retorna el cliente con persona, domicilio, actividad económica, representante (con su persona), cónyuge (con su persona), información laboral, referencias (con personas relacionadas), información financiera, usuario banca digital, beneficiarios, residencia fiscal, asamblea y cálculos financieros (capacidad de pago y patrimonio)'
  })
  @ApiResponseSwagger({ status: 200, description: 'Cliente completo encontrado', type: ClienteCompletoResponseDto })
  public async findClienteCompletoById(@Param('id') id: number): Promise<ApiResponse<{
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
      return await this.service.findClienteCompletoById(+id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: `Crear un nuevo ${ClienEnum.title}` })
  @ApiBody({ type: CreateClienRequestDto, description: `Datos del ${ClienEnum.title}` })
  @ApiResponseSwagger({ status: 201, description: 'Cliente creado exitosamente', type: ClienResponseDto })
  public async create(@Body() data: CreateClienRequestDto): Promise<ApiResponse<ClienEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('completo')
  @ApiOperation({ 
    summary: 'Registrar cliente completo (Persona + Cliente + Domicilio + Actividad Económica + Representante opcional + Cónyuge opcional + Información Laboral opcional + Referencias opcionales + Información Financiera opcional + Usuario Banca Digital opcional + Beneficiarios opcionales + Residencia Fiscal opcional + Asamblea opcional en transacción unificada)',
    description: 'Crea una persona, un cliente, un domicilio, una actividad económica y opcionalmente un representante, un cónyuge, información laboral, referencias, información financiera, usuario de banca digital, beneficiarios, residencia fiscal y asamblea en una sola transacción. Si la persona ya existe, la reutiliza. Valida que la persona no sea cliente activo. El domicilio y la actividad económica son obligatorios. El representante es obligatorio si: Edad < 18 años O Tipo persona = Jurídica. El cónyuge es obligatorio si: Estado civil IN (2=Casado, 3=Unión de hecho, 6=Unión libre). La información laboral es obligatoria si: Tipo persona = Natural AND Edad >= 18. Las referencias son opcionales (0 o más). Si tipo es Financiera (3), requiere número de cuenta y saldo. La información financiera es opcional (0 o más, máximo 1 por tipo: I=Ingreso, G=Gasto, A=Activo, P=Pasivo). El usuario de banca digital es opcional (1:1). Username debe ser único. Los beneficiarios son opcionales (0 o más) pero requieren Usuario Banca Digital. La residencia fiscal es opcional (1:1, CRS/FATCA). La asamblea es opcional (1:1, solo socios). Si es directivo, requiere fecha de nombramiento directivo.'
  })
  @ApiBody({ 
    type: RegistrarClienteCompletoRequestDto, 
    description: 'Datos de persona, cliente, domicilio, actividad económica y representante (opcional). NOTA: clien_cod_perso, cldom_cod_clien, cleco_cod_clien y clrep_cod_clien serán asignados automáticamente'
  })
  @ApiResponseSwagger({ 
    status: 201, 
    description: 'Cliente completo registrado exitosamente', 
    type: RegistrarClienteCompletoResponseDto 
  })
  public async registrarClienteCompleto(
    @Body() data: RegistrarClienteCompletoRequestDto
  ): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity; actividadEconomica: ClecoEntity; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    try {
      // Convertir DTOs a Entities
      const personaEntity: PersoEntity = {
        ...data.persona,
      };
      
      const clienteEntity: ClienEntity = {
        ...data.cliente,
        clien_cod_perso: 0, // Será asignado en la transacción
      };
      
      const domicilioEntity: CldomEntity = {
        ...data.domicilio,
        cldom_cod_clien: 0, // Será asignado en la transacción
      };
      
      const actividadEconomicaEntity: ClecoEntity = {
        ...data.actividadEconomica,
        cleco_cod_clien: 0, // Será asignado en la transacción
      };
      
      const representanteEntity: ClrepEntity | null = data.representante ? {
        ...data.representante,
        clrep_cod_clien: 0, // Será asignado en la transacción
      } : null;
      
      const conyugeEntity: ClcygEntity | null = data.conyuge ? {
        ...data.conyuge,
        clcyg_cod_clien: 0, // Será asignado en la transacción
      } : null;
      
      const informacionLaboralEntity: CllabEntity | null = data.informacionLaboral ? {
        ...data.informacionLaboral,
        cllab_cod_clien: 0, // Será asignado en la transacción
      } : null;
      
      const referenciasEntity: ClrefEntity[] | null = data.referencias && data.referencias.length > 0
        ? data.referencias.map(ref => ({
            ...ref,
            clref_cod_clien: 0, // Será asignado en la transacción
          }))
        : null;
      
      const informacionFinancieraEntity: ClfinEntity[] | null = data.informacionFinanciera && data.informacionFinanciera.length > 0
        ? data.informacionFinanciera.map(info => ({
            ...info,
            clfin_cod_clien: 0, // Será asignado en la transacción
          }))
        : null;
      
      const usuarioBancaDigitalEntity: ClbncEntity | null = data.usuarioBancaDigital ? {
        ...data.usuarioBancaDigital,
        clbnc_cod_clien: 0, // Será asignado en la transacción
        clbnc_ctr_activ: data.usuarioBancaDigital.clbnc_ctr_activ ?? true,
        clbnc_ctr_termi: data.usuarioBancaDigital.clbnc_ctr_termi ?? true,
        clbnc_lim_diario: data.usuarioBancaDigital.clbnc_lim_diario ?? 1000.00,
        clbnc_lim_mensu: data.usuarioBancaDigital.clbnc_lim_mensu ?? 15000.00,
      } : null;
      
      const beneficiariosEntity: ClbenEntity[] | null = data.beneficiarios && data.beneficiarios.length > 0
        ? data.beneficiarios.map(ben => ({
            ...ben,
            clben_cod_clbnc: 0, // Será asignado en la transacción
            clben_ctr_exter: ben.clben_ctr_exter ?? false,
            clben_ctr_activ: ben.clben_ctr_activ ?? true,
          }))
        : null;
      
      const residenciaFiscalEntity: ClrfiEntity | null = data.residenciaFiscal ? {
        ...data.residenciaFiscal,
        clrfi_cod_clien: 0, // Será asignado en la transacción
      } : null;
      
      const asambleaEntity: ClasmEntity | null = data.asamblea ? {
        ...data.asamblea,
        clasm_cod_clien: 0, // Será asignado en la transacción
        clasm_ctr_direc: data.asamblea.clasm_ctr_direc ?? false,
        clasm_fec_rasam: data.asamblea.clasm_fec_rasam ? new Date(data.asamblea.clasm_fec_rasam) : null,
        clasm_fec_direc: data.asamblea.clasm_fec_direc ? new Date(data.asamblea.clasm_fec_direc) : null,
      } : null;
      
      return await this.service.registrarClienteCompleto(personaEntity, clienteEntity, domicilioEntity, actividadEconomicaEntity, representanteEntity, conyugeEntity, informacionLaboralEntity, referenciasEntity, informacionFinancieraEntity, usuarioBancaDigitalEntity, beneficiariosEntity, residenciaFiscalEntity, asambleaEntity);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id/completo')
  @ApiOperation({ 
    summary: 'Actualizar cliente completo con todas sus relaciones en transacción unificada',
    description: 'Actualiza persona, cliente, domicilio, actividad económica y opcionalmente representante, cónyuge, información laboral, referencias, información financiera, usuario de banca digital, beneficiarios, residencia fiscal y asamblea en una sola transacción. Lógica: Persona y Cliente siempre se actualizan. Domicilio y Actividad Económica se actualizan (si no existen, se crean). Relaciones 1:1 opcionales: con datos = crear/actualizar, null = eliminar, undefined = no modificar. Relaciones 1:N: array = sync completo, null = eliminar todas, undefined = no modificar.'
  })
  @ApiBody({ 
    type: ActualizarClienteCompletoRequestDto, 
    description: 'Datos actualizados de persona, cliente, domicilio, actividad económica y relaciones opcionales'
  })
  @ApiResponseSwagger({ 
    status: 200, 
    description: 'Cliente completo actualizado exitosamente', 
    type: ActualizarClienteCompletoResponseDto 
  })
  public async actualizarClienteCompleto(
    @Param('id') id: number,
    @Body() data: ActualizarClienteCompletoRequestDto
  ): Promise<ApiResponse<{ persona: PersoEntity; cliente: ClienEntity; domicilio: CldomEntity | null; actividadEconomica: ClecoEntity | null; representante?: ClrepEntity | null; conyuge?: ClcygEntity | null; informacionLaboral?: CllabEntity | null; referencias?: ClrefEntity[]; informacionFinanciera?: ClfinEntity[]; usuarioBancaDigital?: ClbncEntity | null; beneficiarios?: ClbenEntity[]; residenciaFiscal?: ClrfiEntity | null; asamblea?: ClasmEntity | null }>> {
    try {
      // Convertir DTOs a Entities
      const personaEntity: PersoEntity = {
        ...data.persona,
      };
      
      const clienteEntity: ClienEntity = {
        ...data.cliente,
      };
      
      const domicilioEntity: CldomEntity = {
        ...data.domicilio,
        cldom_cod_clien: +id,
      };
      
      const actividadEconomicaEntity: ClecoEntity = {
        ...data.actividadEconomica,
        cleco_cod_clien: +id,
      };
      
      const representanteEntity = data.representante !== undefined 
        ? (data.representante === null ? null : { ...data.representante, clrep_cod_clien: +id } as ClrepEntity)
        : undefined;
      
      const conyugeEntity = data.conyuge !== undefined 
        ? (data.conyuge === null ? null : { ...data.conyuge, clcyg_cod_clien: +id } as ClcygEntity)
        : undefined;
      
      const informacionLaboralEntity = data.informacionLaboral !== undefined 
        ? (data.informacionLaboral === null ? null : { ...data.informacionLaboral, cllab_cod_clien: +id } as CllabEntity)
        : undefined;
      
      const referenciasEntity = data.referencias !== undefined 
        ? (data.referencias === null ? null : data.referencias.map(ref => ({ ...ref, clref_cod_clien: +id })) as ClrefEntity[])
        : undefined;
      
      const informacionFinancieraEntity = data.informacionFinanciera !== undefined 
        ? (data.informacionFinanciera === null ? null : data.informacionFinanciera.map(info => ({ ...info, clfin_cod_clien: +id })) as ClfinEntity[])
        : undefined;
      
      const usuarioBancaDigitalEntity = data.usuarioBancaDigital !== undefined 
        ? (data.usuarioBancaDigital === null ? null : { 
            ...data.usuarioBancaDigital, 
            clbnc_cod_clien: +id,
            clbnc_ctr_activ: data.usuarioBancaDigital.clbnc_ctr_activ ?? true,
            clbnc_ctr_termi: data.usuarioBancaDigital.clbnc_ctr_termi ?? true,
            clbnc_lim_diario: data.usuarioBancaDigital.clbnc_lim_diario ?? 1000.00,
            clbnc_lim_mensu: data.usuarioBancaDigital.clbnc_lim_mensu ?? 15000.00,
          } as ClbncEntity)
        : undefined;
      
      const beneficiariosEntity = data.beneficiarios !== undefined 
        ? (data.beneficiarios === null ? null : data.beneficiarios.map(ben => ({ 
            ...ben,
            clben_ctr_exter: ben.clben_ctr_exter ?? false,
            clben_ctr_activ: ben.clben_ctr_activ ?? true,
          })) as ClbenEntity[])
        : undefined;
      
      const residenciaFiscalEntity = data.residenciaFiscal !== undefined 
        ? (data.residenciaFiscal === null ? null : { ...data.residenciaFiscal, clrfi_cod_clien: +id } as ClrfiEntity)
        : undefined;
      
      const asambleaEntity = data.asamblea !== undefined 
        ? (data.asamblea === null ? null : { 
            ...data.asamblea, 
            clasm_cod_clien: +id,
            clasm_ctr_direc: data.asamblea.clasm_ctr_direc ?? false,
            clasm_fec_rasam: data.asamblea.clasm_fec_rasam ? new Date(data.asamblea.clasm_fec_rasam) : null,
            clasm_fec_direc: data.asamblea.clasm_fec_direc ? new Date(data.asamblea.clasm_fec_direc) : null,
          } as ClasmEntity)
        : undefined;

      const result = await this.service.actualizarClienteCompleto(
        +id,
        personaEntity,
        clienteEntity,
        domicilioEntity,
        actividadEconomicaEntity,
        representanteEntity,
        conyugeEntity,
        informacionLaboralEntity,
        referenciasEntity,
        informacionFinancieraEntity,
        usuarioBancaDigitalEntity,
        beneficiariosEntity,
        residenciaFiscalEntity,
        asambleaEntity
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: `Actualizar un ${ClienEnum.title}` })
  @ApiBody({ type: UpdateClienRequestDto, description: `Datos actualizados del ${ClienEnum.title}` })
  @ApiResponseSwagger({ status: 200, description: 'Cliente actualizado exitosamente', type: ClienResponseDto })
  public async update(@Param('id') id: number, @Body() data: UpdateClienRequestDto): Promise<ApiResponse<ClienEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: `Eliminar un ${ClienEnum.title} (soft delete)` })
  @ApiResponseSwagger({ status: 200, description: 'Cliente eliminado exitosamente', type: ClienResponseDto })
  public async delete(@Param('id') id: number): Promise<ApiResponse<ClienEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

