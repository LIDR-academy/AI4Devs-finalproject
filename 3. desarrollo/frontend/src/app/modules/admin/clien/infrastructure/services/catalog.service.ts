import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { ApiResponse, ApiResponses } from 'app/shared/utils/response';
import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import { CiiuFacade } from 'app/modules/admin/confi/parameter/ciiu/application/facades/ciiu.facade';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from 'app/modules/admin/confi/parameter/geo/domain/entity';
import { ActividadCompletaEntity } from 'app/modules/admin/confi/parameter/ciiu/domain/entity';
import { OficiService } from 'app/modules/admin/confi/management/ofici/infrastructure/service/service';
import { OficiEntity } from 'app/modules/admin/confi/management/ofici/domain/entity';
import { ParamsInterface } from 'app/shared/utils';

/**
 * Interfaces para catálogos simples
 */
export interface CatalogItem {
  id: number;
  codigo?: string;
  nombre: string;
  activo?: boolean;
}

// Usar OficiEntity directamente en lugar de OficinaItem

export interface TipoPersonaItem extends CatalogItem {
  tpers_cod_tpers: number;
  tpers_des_tpers: string;
}

export interface TipoIdentificacionItem extends CatalogItem {
  tiden_cod_tiden: number;
  tiden_des_tiden: string;
}

export interface SexoItem extends CatalogItem {
  sexos_cod_sexos: number;
  sexos_des_sexos: string;
}

export interface NacionalidadItem extends CatalogItem {
  nacio_cod_nacio: number;
  nacio_des_nacio: string;
}

export interface NivelInstruccionItem extends CatalogItem {
  instr_cod_instr: number;
  instr_des_instr: string;
}

export interface TipoRepresentanteItem extends CatalogItem {
  trep_cod_trep: number;
  trep_des_trep: string;
}

export interface TipoReferenciaItem extends CatalogItem {
  tiref_cod_tiref: number;
  tiref_des_tiref: string;
}

export interface TipoInformacionFinancieraItem extends CatalogItem {
  tifin_cod_tifin: number;
  tifin_nom_tifin: string;
  tifin_tip_tifin: 'I' | 'G' | 'A' | 'P';
}

export interface TipoCuentaItem extends CatalogItem {
  id: number;
  nombre: string;
}

export interface InstitucionFinancieraItem extends CatalogItem {
  ifina_cod_ifina: number;
  ifina_nom_ifina: string;
}

export interface TipoContratoItem extends CatalogItem {
  tcont_cod_tcont: number;
  tcont_des_tcont: string;
}

export interface TipoRepresentanteAsambleaItem extends CatalogItem {
  rasam_cod_rasam: number;
  rasam_des_rasam: string;
}

export interface PaisItem extends CatalogItem {
  pais_cod_pais: number;
  pais_nom_pais: string;
}

/**
 * Servicio compartido para cargar catálogos
 * Centraliza el acceso a todos los catálogos necesarios para los formularios de clientes
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly geoFacade = inject(GeoFacade);
  private readonly ciiuFacade = inject(CiiuFacade);
  private readonly oficiService = inject(OficiService);
  private readonly baseUrl = `${environment.backend_url}/v1`;

  // ==================== STATE ====================

  // Catálogos simples
  private readonly _oficinas = signal<OficiEntity[]>([]);
  private readonly _tiposPersona = signal<TipoPersonaItem[]>([]);
  private readonly _tiposIdentificacion = signal<TipoIdentificacionItem[]>([]);
  private readonly _sexos = signal<SexoItem[]>([]);
  private readonly _nacionalidades = signal<NacionalidadItem[]>([]);
  private readonly _nivelesInstruccion = signal<NivelInstruccionItem[]>([]);
  private readonly _tiposRepresentante = signal<TipoRepresentanteItem[]>([]);
  private readonly _tiposReferencia = signal<TipoReferenciaItem[]>([]);
  private readonly _tiposInformacionFinanciera = signal<TipoInformacionFinancieraItem[]>([]);
  private readonly _tiposCuenta = signal<TipoCuentaItem[]>([]);
  private readonly _institucionesFinancieras = signal<InstitucionFinancieraItem[]>([]);
  private readonly _tiposContrato = signal<TipoContratoItem[]>([]);
  private readonly _tiposRepresentanteAsamblea = signal<TipoRepresentanteAsambleaItem[]>([]);
  private readonly _paises = signal<PaisItem[]>([]);

  // Loading states
  private readonly _loadingOficinas = signal<boolean>(false);
  private readonly _loadingTiposPersona = signal<boolean>(false);
  private readonly _loadingTiposIdentificacion = signal<boolean>(false);
  private readonly _loadingSexos = signal<boolean>(false);
  private readonly _loadingNacionalidades = signal<boolean>(false);
  private readonly _loadingNivelesInstruccion = signal<boolean>(false);
  private readonly _loadingTiposRepresentante = signal<boolean>(false);
  private readonly _loadingTiposReferencia = signal<boolean>(false);
  private readonly _loadingTiposInformacionFinanciera = signal<boolean>(false);
  private readonly _loadingInstitucionesFinancieras = signal<boolean>(false);
  private readonly _loadingTiposContrato = signal<boolean>(false);
  private readonly _loadingTiposRepresentanteAsamblea = signal<boolean>(false);
  private readonly _loadingPaises = signal<boolean>(false);

  // ==================== PUBLIC SELECTORS ====================

  readonly oficinas = this._oficinas.asReadonly();
  
  // Helper para obtener nombre de oficina
  getOficinaNombre(id: number): string {
    const oficina = this._oficinas().find(o => o.ofici_cod_ofici === id);
    return oficina?.ofici_nom_ofici || '';
  }
  readonly tiposPersona = this._tiposPersona.asReadonly();
  readonly tiposIdentificacion = this._tiposIdentificacion.asReadonly();
  readonly sexos = this._sexos.asReadonly();
  readonly nacionalidades = this._nacionalidades.asReadonly();
  readonly nivelesInstruccion = this._nivelesInstruccion.asReadonly();

  readonly loadingOficinas = this._loadingOficinas.asReadonly();
  readonly loadingTiposPersona = this._loadingTiposPersona.asReadonly();
  readonly loadingTiposIdentificacion = this._loadingTiposIdentificacion.asReadonly();
  readonly loadingSexos = this._loadingSexos.asReadonly();
  readonly loadingNacionalidades = this._loadingNacionalidades.asReadonly();
  readonly loadingNivelesInstruccion = this._loadingNivelesInstruccion.asReadonly();

  // ==================== GEO (usar GeoFacade) ====================

  /**
   * Carga provincias usando GeoFacade
   */
  async loadProvincias(activeOnly: boolean = true): Promise<ProvinciaEntity[]> {
    await this.geoFacade.loadProvincias(activeOnly);
    return this.geoFacade.provinciasFiltradas();
  }

  /**
   * Carga cantones de una provincia usando GeoFacade
   */
  async loadCantonesByProvincia(provinciaCodigoSeps: string, activeOnly: boolean = true): Promise<CantonEntity[]> {
    await this.geoFacade.loadCantonesByProvincia(provinciaCodigoSeps, activeOnly);
    return this.geoFacade.cantonesFiltrados();
  }

  /**
   * Carga parroquias de un cantón usando GeoFacade
   */
  async loadParroquiasByCanton(
    provinciaCodigoSeps: string,
    cantonCodigoSeps: string,
    activeOnly: boolean = true
  ): Promise<ParroquiaEntity[]> {
    await this.geoFacade.loadParroquiasByCanton(provinciaCodigoSeps, cantonCodigoSeps, activeOnly);
    return this.geoFacade.parroquiasFiltradas();
  }

  // ==================== CIIU (usar CiiuFacade) ====================

  /**
   * Busca actividades económicas usando CiiuFacade
   */
  async searchActividades(query: string, limit?: number): Promise<ActividadCompletaEntity[]> {
    await this.ciiuFacade.searchActividades(query, limit);
    return this.ciiuFacade.actividades();
  }

  // ==================== OFICINAS ====================

  /**
   * Carga listado de oficinas usando OficiService
   * @param empresaId ID de la empresa (opcional, si no se proporciona carga todas)
   */
  async loadOficinas(activeOnly: boolean = true, empresaId?: number): Promise<void> {
    this._loadingOficinas.set(true);
    try {
      const params: any = {
        page: 1,
        limit: 100,
        active: activeOnly,
      };
      
      // OficiParams requiere id_empre, pero es opcional en el servicio
      if (empresaId) {
        params.id_empre = empresaId;
      }

      const response = await firstValueFrom(
        this.oficiService.findAll(params)
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._oficinas.set(data);
    } catch (error) {
      console.error('Error loading oficinas:', error);
      this._oficinas.set([]);
    } finally {
      this._loadingOficinas.set(false);
    }
  }

  // ==================== TIPOS DE PERSONA ====================

  /**
   * Carga tipos de persona
   */
  async loadTiposPersona(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposPersona.set(true);
    try {
      const url = `${this.baseUrl}/parameter/tpers`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoPersonaItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposPersona.set(data);
    } catch (error) {
      console.error('Error loading tipos persona:', error);
      // Fallback a valores hardcodeados si falla
      this._tiposPersona.set([
        { id: 1, tpers_cod_tpers: 1, tpers_des_tpers: 'Natural', nombre: 'Natural' },
        { id: 2, tpers_cod_tpers: 2, tpers_des_tpers: 'Jurídica', nombre: 'Jurídica' },
      ]);
    } finally {
      this._loadingTiposPersona.set(false);
    }
  }

  // ==================== TIPOS DE IDENTIFICACIÓN ====================

  /**
   * Carga tipos de identificación
   */
  async loadTiposIdentificacion(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposIdentificacion.set(true);
    try {
      const url = `${this.baseUrl}/parameter/tiden`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoIdentificacionItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposIdentificacion.set(data);
    } catch (error) {
      console.error('Error loading tipos identificacion:', error);
      // Fallback a valores hardcodeados si falla
      this._tiposIdentificacion.set([
        { id: 1, tiden_cod_tiden: 1, tiden_des_tiden: 'Cédula', nombre: 'Cédula' },
        { id: 2, tiden_cod_tiden: 2, tiden_des_tiden: 'RUC', nombre: 'RUC' },
      ]);
    } finally {
      this._loadingTiposIdentificacion.set(false);
    }
  }

  // ==================== SEXOS ====================

  /**
   * Carga sexos
   */
  async loadSexos(activeOnly: boolean = true): Promise<void> {
    this._loadingSexos.set(true);
    try {
      const url = `${this.baseUrl}/parameter/sexos`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<SexoItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._sexos.set(data);
    } catch (error) {
      console.error('Error loading sexos:', error);
      this._sexos.set([]);
    } finally {
      this._loadingSexos.set(false);
    }
  }

  // ==================== NACIONALIDADES ====================

  /**
   * Carga nacionalidades
   */
  async loadNacionalidades(activeOnly: boolean = true): Promise<void> {
    this._loadingNacionalidades.set(true);
    try {
      const url = `${this.baseUrl}/parameter/nacio`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<NacionalidadItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._nacionalidades.set(data);
    } catch (error) {
      console.error('Error loading nacionalidades:', error);
      this._nacionalidades.set([]);
    } finally {
      this._loadingNacionalidades.set(false);
    }
  }

  // ==================== NIVELES DE INSTRUCCIÓN ====================

  /**
   * Carga niveles de instrucción
   */
  async loadNivelesInstruccion(activeOnly: boolean = true): Promise<void> {
    this._loadingNivelesInstruccion.set(true);
    try {
      const url = `${this.baseUrl}/parameter/instr`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<NivelInstruccionItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._nivelesInstruccion.set(data);
    } catch (error) {
      console.error('Error loading niveles instruccion:', error);
      this._nivelesInstruccion.set([]);
    } finally {
      this._loadingNivelesInstruccion.set(false);
    }
  }

  // ==================== INITIALIZATION ====================

  // ==================== TIPOS DE REPRESENTANTE ====================

  /**
   * Carga tipos de representante
   */
  async loadTiposRepresentante(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposRepresentante.set(true);
    try {
      const url = `${this.baseUrl}/parameter/trep`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoRepresentanteItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposRepresentante.set(data);
    } catch (error) {
      console.error('Error loading tipos representante:', error);
      this._tiposRepresentante.set([]);
    } finally {
      this._loadingTiposRepresentante.set(false);
    }
  }

  // ==================== TIPOS DE REFERENCIA ====================

  /**
   * Carga tipos de referencia
   */
  async loadTiposReferencia(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposReferencia.set(true);
    try {
      const url = `${this.baseUrl}/parameter/tiref`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoReferenciaItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposReferencia.set(data);
    } catch (error) {
      console.error('Error loading tipos referencia:', error);
      this._tiposReferencia.set([]);
    } finally {
      this._loadingTiposReferencia.set(false);
    }
  }

  // ==================== TIPOS DE INFORMACIÓN FINANCIERA ====================

  /**
   * Carga tipos de información financiera
   */
  async loadTiposInformacionFinanciera(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposInformacionFinanciera.set(true);
    try {
      const url = `${this.baseUrl}/parameter/tifin`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoInformacionFinancieraItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposInformacionFinanciera.set(data);
    } catch (error) {
      console.error('Error loading tipos informacion financiera:', error);
      this._tiposInformacionFinanciera.set([]);
    } finally {
      this._loadingTiposInformacionFinanciera.set(false);
    }
  }

  // ==================== TIPOS DE CUENTA ====================

  /**
   * Carga tipos de cuenta (hardcoded: 1=Ahorros, 2=Corriente)
   */
  async loadTiposCuenta(): Promise<void> {
    this._tiposCuenta.set([
      { id: 1, nombre: 'Ahorros' },
      { id: 2, nombre: 'Corriente' },
    ]);
  }

  // ==================== INSTITUCIONES FINANCIERAS ====================

  /**
   * Carga instituciones financieras
   */
  async loadInstitucionesFinancieras(activeOnly: boolean = true): Promise<void> {
    this._loadingInstitucionesFinancieras.set(true);
    try {
      const url = `${this.baseUrl}/parameter/ifina`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<InstitucionFinancieraItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._institucionesFinancieras.set(data);
    } catch (error) {
      console.error('Error loading instituciones financieras:', error);
      this._institucionesFinancieras.set([]);
    } finally {
      this._loadingInstitucionesFinancieras.set(false);
    }
  }

  // ==================== TIPOS DE CONTRATO ====================

  /**
   * Carga tipos de contrato
   */
  async loadTiposContrato(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposContrato.set(true);
    try {
      const url = `${this.baseUrl}/parameter/tcont`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoContratoItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposContrato.set(data);
    } catch (error) {
      console.error('Error loading tipos contrato:', error);
      this._tiposContrato.set([]);
    } finally {
      this._loadingTiposContrato.set(false);
    }
  }

  // ==================== TIPOS DE REPRESENTANTE ASAMBLEA ====================

  /**
   * Carga tipos de representante asamblea
   */
  async loadTiposRepresentanteAsamblea(activeOnly: boolean = true): Promise<void> {
    this._loadingTiposRepresentanteAsamblea.set(true);
    try {
      const url = `${this.baseUrl}/parameter/rasam`;
      const params: any = {};
      if (activeOnly) {
        params.active = 'true';
      }

      const response = await firstValueFrom(
        this.http.get<ApiResponses<TipoRepresentanteAsambleaItem>>(url, { params })
      );

      const data = Array.isArray(response?.data) ? response.data : [];
      this._tiposRepresentanteAsamblea.set(data);
    } catch (error) {
      console.error('Error loading tipos representante asamblea:', error);
      this._tiposRepresentanteAsamblea.set([]);
    } finally {
      this._loadingTiposRepresentanteAsamblea.set(false);
    }
  }

  // ==================== PAÍSES ====================

  /**
   * Carga países (usando nacionalidades como base)
   */
  async loadPaises(activeOnly: boolean = true): Promise<void> {
    this._loadingPaises.set(true);
    try {
      // Usar nacionalidades como países por ahora
      await this.loadNacionalidades(activeOnly);
      const nacionalidades = this._nacionalidades();
      const paises: PaisItem[] = nacionalidades.map(n => ({
        id: n.nacio_cod_nacio,
        pais_cod_pais: n.nacio_cod_nacio,
        pais_nom_pais: n.nacio_des_nacio,
        nombre: n.nacio_des_nacio,
      }));
      this._paises.set(paises);
    } catch (error) {
      console.error('Error loading paises:', error);
      this._paises.set([]);
    } finally {
      this._loadingPaises.set(false);
    }
  }

  // ==================== INITIALIZATION ====================

  /**
   * Carga todos los catálogos básicos necesarios para formularios
   * @param empresaId ID de la empresa para filtrar oficinas (opcional)
   */
  async loadAllCatalogs(empresaId?: number): Promise<void> {
    await Promise.all([
      this.loadOficinas(true, empresaId),
      this.loadTiposPersona(),
      this.loadTiposIdentificacion(),
      this.loadSexos(),
      this.loadNacionalidades(),
      this.loadNivelesInstruccion(),
      this.loadProvincias(),
      this.loadTiposRepresentante(),
      this.loadTiposReferencia(),
      this.loadTiposInformacionFinanciera(),
      this.loadTiposCuenta(),
      this.loadInstitucionesFinancieras(),
      this.loadTiposContrato(),
      this.loadTiposRepresentanteAsamblea(),
      this.loadPaises(),
    ]);
  }
}

