import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { GeoPort } from '../../domain/port';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../domain/entity';
import { GeoEnum } from '../enum/enum';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import {
  ProvinciaResponseDto,
  CantonResponseDto,
  ParroquiaResponseDto,
} from '../dto/response';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto,
} from '../dto/request';
import { ProvinciaMapper, CantonMapper, ParroquiaMapper } from '../mappers';

/**
 * Adaptador HTTP para el módulo de Catálogo Geográfico
 * Comunica con MS-CONFI a través de MS-CORE gateway
 */
@Injectable({ providedIn: 'root' })
export class GeoRepository implements GeoPort {
  private readonly http = inject(HttpClient);

  // ==================== PROVINCIAS ====================

  getProvincias(activeOnly: boolean = true): Observable<ApiResponses<ProvinciaEntity>> {
    const params = new HttpParams().set('active', activeOnly.toString());
    const url = GeoEnum.apiProvincias;
    console.log('GET Provincias - URL:', url, 'Params:', params.toString());
    
    return this.http
      .get<ApiResponses<ProvinciaResponseDto>>(url, { params })
      .pipe(
        map((response: any) => {
          console.log('Raw response from API:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', response ? Object.keys(response) : 'null');
          console.log('Has data property:', response && 'data' in response);
          console.log('Data value:', response?.data);
          console.log('Data is array:', Array.isArray(response?.data));
          
          // El backend puede devolver la respuesta directamente o envuelta
          // Intentar diferentes estructuras posibles
          let dataArray: ProvinciaResponseDto[] = [];
          
          if (response && response.data && Array.isArray(response.data)) {
            // Estructura esperada: { data: [...], meta: {...} }
            dataArray = response.data;
          } else if (response && response.data === null && response.meta) {
            // El backend devuelve data: null cuando no hay resultados (404)
            // Esto es válido, simplemente devolvemos un array vacío
            console.log('Backend returned null data (no results), returning empty array');
            dataArray = [];
          } else if (response && response.data === undefined && response.meta) {
            // Similar al caso anterior, pero data es undefined
            console.log('Backend returned undefined data (no results), returning empty array');
            dataArray = [];
          } else if (Array.isArray(response)) {
            // Si la respuesta es directamente un array
            dataArray = response;
          } else if (response && response.data && !Array.isArray(response.data)) {
            // Si data existe pero no es array, puede ser un objeto único
            dataArray = [response.data];
          } else {
            console.error('Invalid response structure:', JSON.stringify(response, null, 2));
            throw new Error('Respuesta inválida del servidor: estructura de datos no reconocida');
          }
          
          console.log('Data array to map:', dataArray);
          const mapped = {
            ...response,
            data: dataArray.map((dto) => {
              console.log('Mapping DTO:', dto);
              return ProvinciaMapper.toEntity(dto);
            }),
          };
          console.log('Mapped response:', mapped);
          return mapped;
        })
      );
  }

  createProvincia(data: ProvinciaEntity): Observable<ApiResponse<ProvinciaEntity>> {
    const dto: CreateProvinciaRequestDto = {
      provi_cod_prov: data.provi_cod_prov,
      provi_nom_provi: data.provi_nom_provi,
      provi_flg_acti: data.provi_flg_acti ?? true,
    };
    return this.http
      .post<ApiResponse<ProvinciaResponseDto>>(GeoEnum.apiProvincias, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: ProvinciaMapper.toEntity(response.data),
        }))
      );
  }

  updateProvincia(
    id: number,
    data: ProvinciaEntity
  ): Observable<ApiResponse<ProvinciaEntity>> {
    const dto: UpdateProvinciaRequestDto = {
      provi_cod_prov: data.provi_cod_prov,
      provi_nom_provi: data.provi_nom_provi,
      provi_flg_acti: data.provi_flg_acti,
    };
    return this.http
      .put<ApiResponse<ProvinciaResponseDto>>(`${GeoEnum.apiProvincias}/${id}`, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: ProvinciaMapper.toEntity(response.data),
        }))
      );
  }

  deleteProvincia(id: number): Observable<ApiResponse<ProvinciaEntity>> {
    return this.http
      .delete<ApiResponse<ProvinciaResponseDto>>(`${GeoEnum.apiProvincias}/${id}`)
      .pipe(
        map((response) => ({
          ...response,
          data: ProvinciaMapper.toEntity(response.data),
        }))
      );
  }

  // ==================== CANTONES ====================

  getCantonesByProvincia(
    provinciaCodigoSeps: string,
    activeOnly: boolean = true
  ): Observable<ApiResponses<CantonEntity>> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http
      .get<ApiResponses<CantonResponseDto>>(
        `${GeoEnum.apiProvincias}/${provinciaCodigoSeps}/cantones`,
        { params }
      )
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((dto) => CantonMapper.toEntity(dto)),
        }))
      );
  }

  createCanton(data: CantonEntity): Observable<ApiResponse<CantonEntity>> {
    const dto: CreateCantonRequestDto = {
      provi_cod_provi: data.provi_cod_provi,
      canto_cod_cant: data.canto_cod_cant,
      canto_nom_canto: data.canto_nom_canto,
      canto_flg_acti: data.canto_flg_acti ?? true,
    };
    return this.http
      .post<ApiResponse<CantonResponseDto>>(GeoEnum.apiCantones, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: CantonMapper.toEntity(response.data),
        }))
      );
  }

  updateCanton(id: number, data: CantonEntity): Observable<ApiResponse<CantonEntity>> {
    const dto: UpdateCantonRequestDto = {
      provi_cod_provi: data.provi_cod_provi,
      canto_cod_cant: data.canto_cod_cant,
      canto_nom_canto: data.canto_nom_canto,
      canto_flg_acti: data.canto_flg_acti,
    };
    return this.http
      .put<ApiResponse<CantonResponseDto>>(`${GeoEnum.apiCantones}/${id}`, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: CantonMapper.toEntity(response.data),
        }))
      );
  }

  deleteCanton(id: number): Observable<ApiResponse<CantonEntity>> {
    return this.http
      .delete<ApiResponse<CantonResponseDto>>(`${GeoEnum.apiCantones}/${id}`)
      .pipe(
        map((response) => ({
          ...response,
          data: CantonMapper.toEntity(response.data),
        }))
      );
  }

  // ==================== PARROQUIAS ====================

  getParroquiasByCanton(
    provinciaCodigoSeps: string,
    cantonCodigoSeps: string,
    activeOnly: boolean = true
  ): Observable<ApiResponses<ParroquiaEntity>> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http
      .get<ApiResponses<ParroquiaResponseDto>>(
        `${GeoEnum.apiProvincias}/${provinciaCodigoSeps}/cantones/${cantonCodigoSeps}/parroquias`,
        { params }
      )
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((dto) => ParroquiaMapper.toEntity(dto)),
        }))
      );
  }

  searchParroquias(
    query: string,
    limit: number = 20
  ): Observable<ApiResponses<ParroquiaEntity>> {
    const params = new HttpParams().set('q', query).set('limit', limit.toString());
    return this.http
      .get<ApiResponses<ParroquiaResponseDto>>(`${GeoEnum.apiParroquias}/search`, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map((dto) => ParroquiaMapper.toEntity(dto)),
        }))
      );
  }

  createParroquia(data: ParroquiaEntity): Observable<ApiResponse<ParroquiaEntity>> {
    const dto: CreateParroquiaRequestDto = {
      canto_cod_canto: data.canto_cod_canto,
      parro_cod_parr: data.parro_cod_parr,
      parro_nom_parro: data.parro_nom_parro,
      parro_tip_area: data.parro_tip_area,
      parro_flg_acti: data.parro_flg_acti ?? true,
    };
    return this.http
      .post<ApiResponse<ParroquiaResponseDto>>(GeoEnum.apiParroquias, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: ParroquiaMapper.toEntity(response.data),
        }))
      );
  }

  updateParroquia(
    id: number,
    data: ParroquiaEntity
  ): Observable<ApiResponse<ParroquiaEntity>> {
    const dto: UpdateParroquiaRequestDto = {
      canto_cod_canto: data.canto_cod_canto,
      parro_cod_parr: data.parro_cod_parr,
      parro_nom_parro: data.parro_nom_parro,
      parro_tip_area: data.parro_tip_area,
      parro_flg_acti: data.parro_flg_acti,
    };
    return this.http
      .put<ApiResponse<ParroquiaResponseDto>>(`${GeoEnum.apiParroquias}/${id}`, dto)
      .pipe(
        map((response) => ({
          ...response,
          data: ParroquiaMapper.toEntity(response.data),
        }))
      );
  }

  deleteParroquia(id: number): Observable<ApiResponse<ParroquiaEntity>> {
    return this.http
      .delete<ApiResponse<ParroquiaResponseDto>>(`${GeoEnum.apiParroquias}/${id}`)
      .pipe(
        map((response) => ({
          ...response,
          data: ParroquiaMapper.toEntity(response.data),
        }))
      );
  }
}

