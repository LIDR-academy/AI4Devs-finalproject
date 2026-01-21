import { Controller } from '@nestjs/common';
import { ApiResponse, ApiResponses } from 'src/shared/util';
import { CiiuEnum } from '../../infrastructure/enum/enum';
import { CiiuService } from '../../infrastructure/service/service';
import {
  SeccionEntity, DivisionEntity, GrupoEntity,
  ClaseEntity, SubclaseEntity, ActividadEntity,
  ActividadCompletaEntity, ArbolCiiuEntity
} from '../../domain/entity';
import {
  CreateSeccionRequestDto, UpdateSeccionRequestDto,
  CreateDivisionRequestDto, UpdateDivisionRequestDto,
  CreateGrupoRequestDto, UpdateGrupoRequestDto,
  CreateClaseRequestDto, UpdateClaseRequestDto,
  CreateSubclaseRequestDto, UpdateSubclaseRequestDto,
  CreateActividadRequestDto, UpdateActividadRequestDto,
  SearchActividadDto
} from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller(CiiuEnum.table.cisec)
export class CiiuContext {
  constructor(private readonly ciiuService: CiiuService) {}

  // ==================== SECCIONES (Nivel 1) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllSecciones })
  public async findAllSecciones(@Payload() payload: { active?: boolean }): Promise<ApiResponses<SeccionEntity>> {
    return await this.ciiuService.findAllSecciones();
  }

  @MessagePattern({ sm: CiiuEnum.smFindSeccionById })
  public async findSeccionById(@Payload('id') id: number): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.findSeccionById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smFindSeccionByAbr })
  public async findSeccionByAbr(@Payload() data: { abr: string }): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.findSeccionByAbr(data.abr);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateSeccion })
  public async createSeccion(@Payload() data: CreateSeccionRequestDto): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.createSeccion(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateSeccion })
  public async updateSeccion(@Payload() payload: { id: number; data: UpdateSeccionRequestDto }): Promise<ApiResponse<SeccionEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateSeccion(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteSeccion })
  public async deleteSeccion(@Payload('id') id: number): Promise<ApiResponse<SeccionEntity>> {
    return await this.ciiuService.deleteSeccion(+id);
  }

  // ==================== DIVISIONES (Nivel 2) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllDivisiones })
  public async findAllDivisiones(@Payload() payload: { active?: boolean }): Promise<ApiResponses<DivisionEntity>> {
    return await this.ciiuService.findAllDivisiones();
  }

  @MessagePattern({ sm: CiiuEnum.smFindDivisionesBySeccion })
  public async findDivisionesBySeccion(@Payload() payload: { cisecId: number; active?: boolean }): Promise<ApiResponses<DivisionEntity>> {
    return await this.ciiuService.findDivisionesBySeccion(payload.cisecId);
  }

  @MessagePattern({ sm: CiiuEnum.smFindDivisionById })
  public async findDivisionById(@Payload('id') id: number): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.findDivisionById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateDivision })
  public async createDivision(@Payload() data: CreateDivisionRequestDto): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.createDivision(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateDivision })
  public async updateDivision(@Payload() payload: { id: number; data: UpdateDivisionRequestDto }): Promise<ApiResponse<DivisionEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateDivision(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteDivision })
  public async deleteDivision(@Payload('id') id: number): Promise<ApiResponse<DivisionEntity>> {
    return await this.ciiuService.deleteDivision(+id);
  }

  // ==================== GRUPOS (Nivel 3) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllGrupos })
  public async findAllGrupos(@Payload() payload: { active?: boolean }): Promise<ApiResponses<GrupoEntity>> {
    return await this.ciiuService.findAllGrupos();
  }

  @MessagePattern({ sm: CiiuEnum.smFindGruposByDivision })
  public async findGruposByDivision(@Payload() payload: { cidivId: number; active?: boolean }): Promise<ApiResponses<GrupoEntity>> {
    return await this.ciiuService.findGruposByDivision(payload.cidivId);
  }

  @MessagePattern({ sm: CiiuEnum.smFindGrupoById })
  public async findGrupoById(@Payload('id') id: number): Promise<ApiResponse<GrupoEntity>> {
    return await this.ciiuService.findGrupoById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateGrupo })
  public async createGrupo(@Payload() data: CreateGrupoRequestDto): Promise<ApiResponse<GrupoEntity>> {
    return await this.ciiuService.createGrupo(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateGrupo })
  public async updateGrupo(@Payload() payload: { id: number; data: UpdateGrupoRequestDto }): Promise<ApiResponse<GrupoEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateGrupo(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteGrupo })
  public async deleteGrupo(@Payload('id') id: number): Promise<ApiResponse<GrupoEntity>> {
    return await this.ciiuService.deleteGrupo(+id);
  }

  // ==================== CLASES (Nivel 4) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllClases })
  public async findAllClases(@Payload() payload: { active?: boolean }): Promise<ApiResponses<ClaseEntity>> {
    return await this.ciiuService.findAllClases();
  }

  @MessagePattern({ sm: CiiuEnum.smFindClasesByGrupo })
  public async findClasesByGrupo(@Payload() payload: { cigruId: number; active?: boolean }): Promise<ApiResponses<ClaseEntity>> {
    return await this.ciiuService.findClasesByGrupo(payload.cigruId);
  }

  @MessagePattern({ sm: CiiuEnum.smFindClaseById })
  public async findClaseById(@Payload('id') id: number): Promise<ApiResponse<ClaseEntity>> {
    return await this.ciiuService.findClaseById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateClase })
  public async createClase(@Payload() data: CreateClaseRequestDto): Promise<ApiResponse<ClaseEntity>> {
    return await this.ciiuService.createClase(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateClase })
  public async updateClase(@Payload() payload: { id: number; data: UpdateClaseRequestDto }): Promise<ApiResponse<ClaseEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateClase(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteClase })
  public async deleteClase(@Payload('id') id: number): Promise<ApiResponse<ClaseEntity>> {
    return await this.ciiuService.deleteClase(+id);
  }

  // ==================== SUBCLASES (Nivel 5) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllSubclases })
  public async findAllSubclases(@Payload() payload: { active?: boolean }): Promise<ApiResponses<SubclaseEntity>> {
    return await this.ciiuService.findAllSubclases();
  }

  @MessagePattern({ sm: CiiuEnum.smFindSubclasesByClase })
  public async findSubclasesByClase(@Payload() payload: { ciclaId: number; active?: boolean }): Promise<ApiResponses<SubclaseEntity>> {
    return await this.ciiuService.findSubclasesByClase(payload.ciclaId);
  }

  @MessagePattern({ sm: CiiuEnum.smFindSubclaseById })
  public async findSubclaseById(@Payload('id') id: number): Promise<ApiResponse<SubclaseEntity>> {
    return await this.ciiuService.findSubclaseById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateSubclase })
  public async createSubclase(@Payload() data: CreateSubclaseRequestDto): Promise<ApiResponse<SubclaseEntity>> {
    return await this.ciiuService.createSubclase(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateSubclase })
  public async updateSubclase(@Payload() payload: { id: number; data: UpdateSubclaseRequestDto }): Promise<ApiResponse<SubclaseEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateSubclase(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteSubclase })
  public async deleteSubclase(@Payload('id') id: number): Promise<ApiResponse<SubclaseEntity>> {
    return await this.ciiuService.deleteSubclase(+id);
  }

  // ==================== ACTIVIDADES (Nivel 6) ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindAllActividades })
  public async findAllActividades(@Payload() payload: { active?: boolean }): Promise<ApiResponses<ActividadEntity>> {
    return await this.ciiuService.findAllActividades();
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadesBySubclase })
  public async findActividadesBySubclase(@Payload() payload: { cisubId: number; active?: boolean }): Promise<ApiResponses<ActividadEntity>> {
    return await this.ciiuService.findActividadesBySubclase(payload.cisubId);
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadById })
  public async findActividadById(@Payload('id') id: number): Promise<ApiResponse<ActividadEntity>> {
    return await this.ciiuService.findActividadById(+id);
  }

  @MessagePattern({ sm: CiiuEnum.smCreateActividad })
  public async createActividad(@Payload() data: CreateActividadRequestDto): Promise<ApiResponse<ActividadEntity>> {
    return await this.ciiuService.createActividad(data);
  }

  @MessagePattern({ sm: CiiuEnum.smUpdateActividad })
  public async updateActividad(@Payload() payload: { id: number; data: UpdateActividadRequestDto }): Promise<ApiResponse<ActividadEntity>> {
    const { id, data } = payload;
    return await this.ciiuService.updateActividad(id, data);
  }

  @MessagePattern({ sm: CiiuEnum.smDeleteActividad })
  public async deleteActividad(@Payload('id') id: number): Promise<ApiResponse<ActividadEntity>> {
    return await this.ciiuService.deleteActividad(+id);
  }

  // ==================== BÚSQUEDA Y SELECTOR ====================
  
  @MessagePattern({ sm: CiiuEnum.smSearchActividades })
  public async searchActividades(@Payload() data: SearchActividadDto): Promise<ApiResponses<ActividadCompletaEntity>> {
    return await this.ciiuService.searchActividades(data.query, data.limit);
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadCompleta })
  public async findActividadCompleta(@Payload() data: { id: number }): Promise<ApiResponse<ActividadCompletaEntity>> {
    return await this.ciiuService.findActividadCompleta(data.id);
  }

  @MessagePattern({ sm: CiiuEnum.smFindActividadCompletaByAbr })
  public async findActividadCompletaByAbr(@Payload() data: { abr: string }): Promise<ApiResponse<ActividadCompletaEntity>> {
    return await this.ciiuService.findActividadCompletaByAbr(data.abr);
  }

  // ==================== ÁRBOL ====================
  
  @MessagePattern({ sm: CiiuEnum.smFindArbolCompleto })
  public async findArbolCompleto(): Promise<ApiResponses<ArbolCiiuEntity>> {
    return await this.ciiuService.findArbolCompleto();
  }

  @MessagePattern({ sm: CiiuEnum.smFindHijosByNivel })
  public async findHijosByNivel(@Payload() data: { nivel: number; parentId: number }): Promise<ApiResponses<ArbolCiiuEntity>> {
    return await this.ciiuService.findHijosByNivel(data.nivel, data.parentId);
  }
}

