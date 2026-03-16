import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GeoRepository } from '../../infrastructure/repository/repository';
import {
  ProvinciaEntity,
  CantonEntity,
  ParroquiaEntity,
} from '../../domain/entity';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto,
} from '../../infrastructure/dto/request';

/**
 * Facade para el módulo de Catálogo Geográfico
 * Gestiona el estado y orquesta las operaciones usando Signals
 */
@Injectable({ providedIn: 'root' })
export class GeoFacade {
  private readonly repository = inject(GeoRepository);

  // ==================== STATE ====================

  // Data signals
  private readonly _provincias = signal<ProvinciaEntity[]>([]);
  private readonly _cantones = signal<CantonEntity[]>([]);
  private readonly _parroquias = signal<ParroquiaEntity[]>([]);
  private readonly _searchResults = signal<ParroquiaEntity[]>([]);

  // Selection signals
  private readonly _selectedProvincia = signal<ProvinciaEntity | null>(null);
  private readonly _selectedCanton = signal<CantonEntity | null>(null);

  // UI state signals
  private readonly _loading = signal<boolean>(false);
  private readonly _loadingCantones = signal<boolean>(false);
  private readonly _loadingParroquias = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _showInactive = signal<boolean>(false);

  // ==================== PUBLIC SELECTORS ====================

  /** Lista de provincias */
  readonly provincias = this._provincias.asReadonly();

  /** Lista de cantones del provincia seleccionada */
  readonly cantones = this._cantones.asReadonly();

  /** Lista de parroquias del cantón seleccionado */
  readonly parroquias = this._parroquias.asReadonly();

  /** Resultados de búsqueda de parroquias */
  readonly searchResults = this._searchResults.asReadonly();

  /** Provincia seleccionada */
  readonly selectedProvincia = this._selectedProvincia.asReadonly();

  /** Cantón seleccionado */
  readonly selectedCanton = this._selectedCanton.asReadonly();

  /** Estado de carga general */
  readonly loading = this._loading.asReadonly();

  /** Estado de carga de cantones */
  readonly loadingCantones = this._loadingCantones.asReadonly();

  /** Estado de carga de parroquias */
  readonly loadingParroquias = this._loadingParroquias.asReadonly();

  /** Error actual */
  readonly error = this._error.asReadonly();

  /** Mostrar inactivos */
  readonly showInactive = this._showInactive.asReadonly();

  // ==================== COMPUTED ====================

  /** Provincias filtradas (activas o todas) */
  readonly provinciasFiltradas = computed(() => {
    const showInactive = this._showInactive();
    return this._provincias().filter(
      (p) => showInactive || p.provi_flg_acti
    );
  });

  /** Cantones filtrados */
  readonly cantonesFiltrados = computed(() => {
    const showInactive = this._showInactive();
    return this._cantones().filter((c) => showInactive || c.canto_flg_acti);
  });

  /** Parroquias filtradas */
  readonly parroquiasFiltradas = computed(() => {
    const showInactive = this._showInactive();
    return this._parroquias().filter((p) => showInactive || p.parro_flg_acti);
  });

  // ==================== ACTIONS ====================

  /**
   * Carga las provincias
   */
  async loadProvincias(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      console.log('Loading provincias, activeOnly:', !this._showInactive());
      const response = await firstValueFrom(
        this.repository.getProvincias(!this._showInactive())
      );
      console.log('Provincias response:', response);
      console.log('Provincias data:', response.data);
      
      if (response && response.data && Array.isArray(response.data)) {
        this._provincias.set(response.data);
        console.log('Provincias loaded:', response.data.length);
      } else {
        console.warn('Invalid response format:', response);
        this._error.set('Formato de respuesta inválido');
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al cargar las provincias';
      this._error.set(errorMessage);
      console.error('Error loading provincias:', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        error: error?.error,
        url: error?.url
      });
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Selecciona una provincia y carga sus cantones
   */
  async selectProvincia(provincia: ProvinciaEntity | null): Promise<void> {
    this._selectedProvincia.set(provincia);
    this._selectedCanton.set(null);
    this._cantones.set([]);
    this._parroquias.set([]);

    if (provincia) {
      await this.loadCantones(provincia.provi_cod_prov);
    }
  }

  /**
   * Carga los cantones de una provincia
   */
  async loadCantones(provinciaCodigoSeps: string): Promise<void> {
    this._loadingCantones.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.repository.getCantonesByProvincia(
          provinciaCodigoSeps,
          !this._showInactive()
        )
      );
      this._cantones.set(response.data);
    } catch (error) {
      this._error.set('Error al cargar los cantones');
      console.error('Error loading cantones:', error);
    } finally {
      this._loadingCantones.set(false);
    }
  }

  /**
   * Selecciona un cantón y carga sus parroquias
   */
  async selectCanton(canton: CantonEntity | null): Promise<void> {
    this._selectedCanton.set(canton);
    this._parroquias.set([]);

    if (canton && this._selectedProvincia()) {
      await this.loadParroquias(
        this._selectedProvincia()!.provi_cod_prov,
        canton.canto_cod_cant
      );
    }
  }

  /**
   * Carga las parroquias de un cantón
   */
  async loadParroquias(
    provinciaCodigoSeps: string,
    cantonCodigoSeps: string
  ): Promise<void> {
    this._loadingParroquias.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.repository.getParroquiasByCanton(
          provinciaCodigoSeps,
          cantonCodigoSeps,
          !this._showInactive()
        )
      );
      this._parroquias.set(response.data);
    } catch (error) {
      this._error.set('Error al cargar las parroquias');
      console.error('Error loading parroquias:', error);
    } finally {
      this._loadingParroquias.set(false);
    }
  }

  /**
   * Busca parroquias por texto
   */
  async searchParroquias(query: string): Promise<void> {
    if (!query || query.length < 2) {
      this._searchResults.set([]);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.repository.searchParroquias(query)
      );
      this._searchResults.set(response.data);
    } catch (error) {
      console.error('Error searching parroquias:', error);
    }
  }

  /**
   * Alterna mostrar/ocultar inactivos
   */
  toggleShowInactive(): void {
    this._showInactive.update((v) => !v);
  }

  // ==================== CRUD PROVINCIAS ====================

  /**
   * Crea una nueva provincia
   */
  async createProvincia(
    data: CreateProvinciaRequestDto
  ): Promise<ProvinciaEntity> {
    try {
      const entity: ProvinciaEntity = {
        provi_cod_prov: data.provi_cod_prov,
        provi_nom_provi: data.provi_nom_provi,
        provi_flg_acti: data.provi_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.createProvincia(entity)
      );
      this._provincias.update((list) => [...list, response.data]);
      return response.data;
    } catch (error) {
      this._error.set('Error al crear la provincia');
      throw error;
    }
  }

  /**
   * Actualiza una provincia
   */
  async updateProvincia(
    id: number,
    data: UpdateProvinciaRequestDto
  ): Promise<ProvinciaEntity> {
    try {
      const entity: ProvinciaEntity = {
        provi_cod_provi: id,
        provi_cod_prov: data.provi_cod_prov!,
        provi_nom_provi: data.provi_nom_provi!,
        provi_flg_acti: data.provi_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.updateProvincia(id, entity)
      );
      this._provincias.update((list) =>
        list.map((p) => (p.provi_cod_provi === id ? response.data : p))
      );
      return response.data;
    } catch (error) {
      this._error.set('Error al actualizar la provincia');
      throw error;
    }
  }

  /**
   * Elimina una provincia (soft delete)
   */
  async deleteProvincia(id: number): Promise<void> {
    try {
      await firstValueFrom(this.repository.deleteProvincia(id));
      this._provincias.update((list) =>
        list.filter((p) => p.provi_cod_provi !== id)
      );

      // Clear selection if deleted
      if (this._selectedProvincia()?.provi_cod_provi === id) {
        this._selectedProvincia.set(null);
        this._cantones.set([]);
        this._parroquias.set([]);
      }
    } catch (error) {
      this._error.set('Error al eliminar la provincia');
      throw error;
    }
  }

  // ==================== CRUD CANTONES ====================

  /**
   * Crea un nuevo cantón
   */
  async createCanton(data: CreateCantonRequestDto): Promise<CantonEntity> {
    try {
      const entity: CantonEntity = {
        provi_cod_provi: data.provi_cod_provi,
        canto_cod_cant: data.canto_cod_cant,
        canto_nom_canto: data.canto_nom_canto,
        canto_flg_acti: data.canto_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.createCanton(entity)
      );
      this._cantones.update((list) => [...list, response.data]);
      return response.data;
    } catch (error) {
      this._error.set('Error al crear el cantón');
      throw error;
    }
  }

  /**
   * Actualiza un cantón
   */
  async updateCanton(
    id: number,
    data: UpdateCantonRequestDto
  ): Promise<CantonEntity> {
    try {
      const entity: CantonEntity = {
        canto_cod_canto: id,
        provi_cod_provi: data.provi_cod_provi!,
        canto_cod_cant: data.canto_cod_cant!,
        canto_nom_canto: data.canto_nom_canto!,
        canto_flg_acti: data.canto_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.updateCanton(id, entity)
      );
      this._cantones.update((list) =>
        list.map((c) => (c.canto_cod_canto === id ? response.data : c))
      );
      return response.data;
    } catch (error) {
      this._error.set('Error al actualizar el cantón');
      throw error;
    }
  }

  /**
   * Elimina un cantón (soft delete)
   */
  async deleteCanton(id: number): Promise<void> {
    try {
      await firstValueFrom(this.repository.deleteCanton(id));
      this._cantones.update((list) =>
        list.filter((c) => c.canto_cod_canto !== id)
      );

      if (this._selectedCanton()?.canto_cod_canto === id) {
        this._selectedCanton.set(null);
        this._parroquias.set([]);
      }
    } catch (error) {
      this._error.set('Error al eliminar el cantón');
      throw error;
    }
  }

  // ==================== CRUD PARROQUIAS ====================

  /**
   * Crea una nueva parroquia
   */
  async createParroquia(
    data: CreateParroquiaRequestDto
  ): Promise<ParroquiaEntity> {
    try {
      const entity: ParroquiaEntity = {
        canto_cod_canto: data.canto_cod_canto,
        parro_cod_parr: data.parro_cod_parr,
        parro_nom_parro: data.parro_nom_parro,
        parro_tip_area: data.parro_tip_area,
        parro_flg_acti: data.parro_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.createParroquia(entity)
      );
      this._parroquias.update((list) => [...list, response.data]);
      return response.data;
    } catch (error) {
      this._error.set('Error al crear la parroquia');
      throw error;
    }
  }

  /**
   * Actualiza una parroquia
   */
  async updateParroquia(
    id: number,
    data: UpdateParroquiaRequestDto
  ): Promise<ParroquiaEntity> {
    try {
      const entity: ParroquiaEntity = {
        parro_cod_parro: id,
        canto_cod_canto: data.canto_cod_canto!,
        parro_cod_parr: data.parro_cod_parr!,
        parro_nom_parro: data.parro_nom_parro!,
        parro_tip_area: data.parro_tip_area,
        parro_flg_acti: data.parro_flg_acti ?? true,
      };
      const response = await firstValueFrom(
        this.repository.updateParroquia(id, entity)
      );
      this._parroquias.update((list) =>
        list.map((p) => (p.parro_cod_parro === id ? response.data : p))
      );
      return response.data;
    } catch (error) {
      this._error.set('Error al actualizar la parroquia');
      throw error;
    }
  }

  /**
   * Elimina una parroquia (soft delete)
   */
  async deleteParroquia(id: number): Promise<void> {
    try {
      await firstValueFrom(this.repository.deleteParroquia(id));
      this._parroquias.update((list) =>
        list.filter((p) => p.parro_cod_parro !== id)
      );
    } catch (error) {
      this._error.set('Error al eliminar la parroquia');
      throw error;
    }
  }

  // ==================== RESET ====================

  /**
   * Limpia el estado del módulo
   */
  reset(): void {
    this._provincias.set([]);
    this._cantones.set([]);
    this._parroquias.set([]);
    this._searchResults.set([]);
    this._selectedProvincia.set(null);
    this._selectedCanton.set(null);
    this._loading.set(false);
    this._loadingCantones.set(false);
    this._loadingParroquias.set(false);
    this._error.set(null);
  }
}

