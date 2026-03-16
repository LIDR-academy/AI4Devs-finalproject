import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ClienPort } from '../../domain/port';
import { PersoEntity, ClienEntity, ClienteCompletoEntity, PersoParams, ClienParams } from '../../domain/entity';
import { ClienEnum } from '../enum/enum';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import {
  PersoResponseDto,
  ClienResponseDto,
  ClienteCompletoResponseDto,
} from '../dto/response';
import {
  CreatePersoRequestDto,
  UpdatePersoRequestDto,
  CreateClienRequestDto,
  UpdateClienRequestDto,
  RegistrarClienteCompletoRequestDto,
} from '../dto/request';
import { PersoMapper, ClienMapper } from '../mappers';
import { environment } from 'environments/environment';

/**
 * Adaptador HTTP para el módulo de Gestión de Clientes
 * Comunica con MS-PERSO a través de MS-CORE gateway
 */
@Injectable({ providedIn: 'root' })
export class ClienRepository implements ClienPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backend_url}/v1`;

  // ==================== PERSONAS ====================

  getPersonas(params?: PersoParams): Observable<ApiResponses<PersoEntity>> {
    let httpParams = new HttpParams();
    
    if (params?.tipoPersona) {
      httpParams = httpParams.set('tipoPersona', params.tipoPersona.toString());
    }
    if (params?.tipoIdentificacion) {
      httpParams = httpParams.set('tipoIdentificacion', params.tipoIdentificacion.toString());
    }
    if (params?.identificacion) {
      httpParams = httpParams.set('identificacion', params.identificacion);
    }
    if (params?.nombre) {
      httpParams = httpParams.set('nombre', params.nombre);
    }
    if (params?.active !== undefined) {
      httpParams = httpParams.set('active', params.active.toString());
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    const url = `${this.baseUrl}${ClienEnum.apiPersonas}`;
    
    return this.http
      .get<ApiResponses<PersoResponseDto>>(url, { params: httpParams })
      .pipe(
        map((response: any) => {
          // El backend devuelve ApiResponses con estructura { data: [], total, page, limit }
          const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
          const entities = PersoMapper.toEntityArray(data);
          
          return {
            data: entities,
            total: response?.total ?? entities.length,
            page: response?.page ?? params?.page ?? 1,
            limit: response?.limit ?? params?.limit ?? 10,
          };
        })
      );
  }

  getPersonaById(id: number): Observable<ApiResponse<PersoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiPersonas}/${id}`;
    
    return this.http
      .get<ApiResponse<PersoResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: PersoMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  getPersonaByIdentificacion(identificacion: string): Observable<ApiResponse<PersoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiPersonas}/identificacion/${identificacion}`;
    
    return this.http
      .get<ApiResponse<PersoResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: PersoMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  createPersona(data: CreatePersoRequestDto): Observable<ApiResponse<PersoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiPersonas}`;
    
    return this.http
      .post<ApiResponse<PersoResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: PersoMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  updatePersona(id: number, data: UpdatePersoRequestDto): Observable<ApiResponse<PersoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiPersonas}/${id}`;
    
    return this.http
      .put<ApiResponse<PersoResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: PersoMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  deletePersona(id: number): Observable<ApiResponse<PersoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiPersonas}/${id}`;
    
    return this.http
      .delete<ApiResponse<PersoResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: PersoMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  // ==================== CLIENTES ====================

  getClientes(params?: ClienParams): Observable<ApiResponses<ClienEntity>> {
    let httpParams = new HttpParams();
    
    if (params?.oficinaId) {
      httpParams = httpParams.set('oficinaId', params.oficinaId.toString());
    }
    if (params?.esSocio !== undefined) {
      httpParams = httpParams.set('esSocio', params.esSocio.toString());
    }
    if (params?.active !== undefined) {
      httpParams = httpParams.set('active', params.active.toString());
    }
    if (params?.identificacion) {
      httpParams = httpParams.set('identificacion', params.identificacion);
    }
    if (params?.nombre) {
      httpParams = httpParams.set('nombre', params.nombre);
    }
    if (params?.fechaIngresoDesde) {
      httpParams = httpParams.set('fechaIngresoDesde', params.fechaIngresoDesde.toISOString());
    }
    if (params?.fechaIngresoHasta) {
      httpParams = httpParams.set('fechaIngresoHasta', params.fechaIngresoHasta.toISOString());
    }
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    const url = `${this.baseUrl}${ClienEnum.apiClientes}`;
    
    return this.http
      .get<ApiResponses<ClienResponseDto>>(url, { params: httpParams })
      .pipe(
        map((response: any) => {
          const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
          const entities = ClienMapper.toEntityArray(data);
          
          return {
            data: entities,
            total: response?.total ?? entities.length,
            page: response?.page ?? params?.page ?? 1,
            limit: response?.limit ?? params?.limit ?? 10,
          };
        })
      );
  }

  getClienteById(id: number): Observable<ApiResponse<ClienEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/${id}`;
    
    return this.http
      .get<ApiResponse<ClienResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: ClienMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  getClienteByPersonaId(personaId: number): Observable<ApiResponse<ClienEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/persona/${personaId}`;
    
    return this.http
      .get<ApiResponse<ClienResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: ClienMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  createCliente(data: CreateClienRequestDto): Observable<ApiResponse<ClienEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}`;
    
    return this.http
      .post<ApiResponse<ClienResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: ClienMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  updateCliente(id: number, data: UpdateClienRequestDto): Observable<ApiResponse<ClienEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/${id}`;
    
    return this.http
      .put<ApiResponse<ClienResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: ClienMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  deleteCliente(id: number): Observable<ApiResponse<ClienEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/${id}`;
    
    return this.http
      .delete<ApiResponse<ClienResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: ClienMapper.toEntity(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  // ==================== TRANSACCIONES UNIFICADAS ====================

  registrarClienteCompleto(data: RegistrarClienteCompletoRequestDto): Observable<ApiResponse<ClienteCompletoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiCompleto}`;
    
    return this.http
      .post<ApiResponse<ClienteCompletoResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: this.mapClienteCompleto(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  getClienteCompletoById(id: number): Observable<ApiResponse<ClienteCompletoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/${id}/completo`;
    
    return this.http
      .get<ApiResponse<ClienteCompletoResponseDto>>(url)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: this.mapClienteCompleto(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  actualizarClienteCompleto(id: number, data: RegistrarClienteCompletoRequestDto): Observable<ApiResponse<ClienteCompletoEntity>> {
    const url = `${this.baseUrl}${ClienEnum.apiClientes}/${id}/completo`;
    
    return this.http
      .put<ApiResponse<ClienteCompletoResponseDto>>(url, data)
      .pipe(
        map((response: any) => {
          const dto = response?.data ?? response;
          return {
            data: this.mapClienteCompleto(dto),
            message: response?.message,
            success: response?.success ?? true,
          };
        })
      );
  }

  /**
   * Mapea DTO de Cliente Completo a Entity
   */
  private mapClienteCompleto(dto: ClienteCompletoResponseDto): ClienteCompletoEntity {
    return {
      persona: PersoMapper.toEntity(dto.persona),
      cliente: ClienMapper.toEntity(dto.cliente),
      domicilio: dto.domicilio,
      actividadEconomica: dto.actividadEconomica,
      representante: dto.representante,
      conyuge: dto.conyuge,
      informacionLaboral: dto.informacionLaboral,
      referencias: dto.referencias ?? [],
      informacionFinanciera: dto.informacionFinanciera ?? [],
      usuarioBancaDigital: dto.usuarioBancaDigital,
      beneficiarios: dto.beneficiarios ?? [],
      residenciaFiscal: dto.residenciaFiscal,
      asamblea: dto.asamblea,
    };
  }
}

