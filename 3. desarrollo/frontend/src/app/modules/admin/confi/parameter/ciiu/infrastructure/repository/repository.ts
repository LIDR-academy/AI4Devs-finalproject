import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CiiuPort } from '../../domain/port';
import { ActividadCompletaEntity, ArbolCiiuEntity } from '../../domain/entity';
import { CiiuEnum } from '../enum/enum';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import {
  ActividadCompletaResponseDto,
  ArbolCiiuResponseDto,
} from '../dto/response';
import { ActividadCompletaMapper, ArbolCiiuMapper } from '../mappers';

/**
 * Adaptador HTTP para el módulo de Catálogo CIIU
 * Comunica con MS-CONFI a través de MS-CORE gateway
 */
@Injectable({ providedIn: 'root' })
export class CiiuRepository implements CiiuPort {
  private readonly http = inject(HttpClient);

  // ==================== BÚSQUEDA Y SELECTOR ====================

  searchActividades(query: string, limit: number = 20): Observable<ActividadCompletaEntity[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('limit', limit.toString());
    
    return this.http
      .get<ApiResponses<ActividadCompletaResponseDto>>(CiiuEnum.apiActividadesSearch, { params })
      .pipe(
        map((response: any) => {
          // Manejar diferentes estructuras de respuesta
          let dataArray: ActividadCompletaResponseDto[] = [];
          
          if (response && response.data && Array.isArray(response.data)) {
            dataArray = response.data;
          } else if (Array.isArray(response)) {
            dataArray = response;
          } else if (response && response.data === null) {
            dataArray = [];
          } else {
            console.error('Invalid response structure:', response);
            return [];
          }
          
          return ActividadCompletaMapper.toEntityArray(dataArray);
        })
      );
  }

  findActividadCompleta(id: number): Observable<ActividadCompletaEntity | null> {
    return this.http
      .get<ApiResponse<ActividadCompletaResponseDto>>(`${CiiuEnum.apiActividades}/${id}/completa`)
      .pipe(
        map((response: any) => {
          if (!response || !response.data) {
            return null;
          }
          return ActividadCompletaMapper.toEntity(response.data);
        })
      );
  }

  findActividadCompletaByAbr(abr: string): Observable<ActividadCompletaEntity | null> {
    return this.http
      .get<ApiResponse<ActividadCompletaResponseDto>>(`${CiiuEnum.apiActividades}/codigo/${abr}`)
      .pipe(
        map((response: any) => {
          if (!response || !response.data) {
            return null;
          }
          return ActividadCompletaMapper.toEntity(response.data);
        })
      );
  }

  // ==================== ÁRBOL JERÁRQUICO ====================

  findArbolCompleto(): Observable<ArbolCiiuEntity[]> {
    return this.http
      .get<ApiResponses<ArbolCiiuResponseDto>>(CiiuEnum.apiArbol)
      .pipe(
        map((response: any) => {
          let dataArray: ArbolCiiuResponseDto[] = [];
          
          if (response && response.data && Array.isArray(response.data)) {
            dataArray = response.data;
          } else if (Array.isArray(response)) {
            dataArray = response;
          } else if (response && response.data === null) {
            dataArray = [];
          } else {
            console.error('Invalid response structure:', response);
            return [];
          }
          
          return ArbolCiiuMapper.toEntityArray(dataArray);
        })
      );
  }

  findHijosByNivel(nivel: number, parentId: number): Observable<ArbolCiiuEntity[]> {
    return this.http
      .get<ApiResponses<ArbolCiiuResponseDto>>(`${CiiuEnum.apiArbol}/${nivel}/${parentId}/hijos`)
      .pipe(
        map((response: any) => {
          let dataArray: ArbolCiiuResponseDto[] = [];
          
          if (response && response.data && Array.isArray(response.data)) {
            dataArray = response.data;
          } else if (Array.isArray(response)) {
            dataArray = response;
          } else if (response && response.data === null) {
            dataArray = [];
          } else {
            console.error('Invalid response structure:', response);
            return [];
          }
          
          return ArbolCiiuMapper.toEntityArray(dataArray);
        })
      );
  }
}

