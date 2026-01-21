import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CiiuRepository } from '../../infrastructure/repository/repository';
import { ActividadCompletaEntity, ArbolCiiuEntity, toActividadValue, ActividadValue } from '../../domain/entity';

/**
 * Facade para el módulo de Catálogo CIIU
 * Gestiona el estado y orquesta las operaciones usando Signals
 */
@Injectable({ providedIn: 'root' })
export class CiiuFacade {
  private readonly repository = inject(CiiuRepository);

  // ==================== STATE ====================

  // Data signals
  private readonly _actividades = signal<ActividadCompletaEntity[]>([]);
  private readonly _arbol = signal<ArbolCiiuEntity[]>([]);
  private readonly _selectedActividad = signal<ActividadValue | null>(null);

  // UI state signals
  private readonly _loading = signal<boolean>(false);
  private readonly _loadingArbol = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ==================== PUBLIC SELECTORS ====================

  /** Lista de actividades (resultados de búsqueda) */
  readonly actividades = this._actividades.asReadonly();

  /** Árbol completo */
  readonly arbol = this._arbol.asReadonly();

  /** Actividad seleccionada */
  readonly selectedActividad = this._selectedActividad.asReadonly();

  /** Estado de carga */
  readonly loading = this._loading.asReadonly();

  /** Estado de carga del árbol */
  readonly loadingArbol = this._loadingArbol.asReadonly();

  /** Error actual */
  readonly error = this._error.asReadonly();

  // ==================== ACTIONS ====================

  /**
   * Busca actividades por descripción
   */
  async searchActividades(query: string, limit?: number): Promise<void> {
    if (!query || query.trim().length < 3) {
      this._actividades.set([]);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    try {
      const results = await firstValueFrom(
        this.repository.searchActividades(query.trim(), limit)
      );
      this._actividades.set(results);
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al buscar actividades';
      this._error.set(errorMessage);
      this._actividades.set([]);
      console.error('Error searching actividades:', error);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Carga una actividad completa por ID
   */
  async loadActividadCompleta(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const actividad = await firstValueFrom(
        this.repository.findActividadCompleta(id)
      );
      
      if (actividad) {
        const value = toActividadValue(actividad);
        this._selectedActividad.set(value);
      } else {
        this._selectedActividad.set(null);
        this._error.set('Actividad no encontrada');
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al cargar la actividad';
      this._error.set(errorMessage);
      this._selectedActividad.set(null);
      console.error('Error loading actividad:', error);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Carga una actividad completa por código CIIU
   */
  async loadActividadCompletaByAbr(abr: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const actividad = await firstValueFrom(
        this.repository.findActividadCompletaByAbr(abr)
      );
      
      if (actividad) {
        const value = toActividadValue(actividad);
        this._selectedActividad.set(value);
      } else {
        this._selectedActividad.set(null);
        this._error.set('Actividad no encontrada');
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al cargar la actividad';
      this._error.set(errorMessage);
      this._selectedActividad.set(null);
      console.error('Error loading actividad:', error);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Carga el árbol completo
   */
  async loadArbol(): Promise<void> {
    this._loadingArbol.set(true);
    this._error.set(null);

    try {
      const arbol = await firstValueFrom(
        this.repository.findArbolCompleto()
      );
      this._arbol.set(arbol);
    } catch (error: any) {
      const errorMessage = error?.error?.message || error?.message || 'Error al cargar el árbol';
      this._error.set(errorMessage);
      this._arbol.set([]);
      console.error('Error loading arbol:', error);
    } finally {
      this._loadingArbol.set(false);
    }
  }

  /**
   * Selecciona una actividad
   */
  selectActividad(actividad: ActividadCompletaEntity | null): void {
    if (actividad) {
      const value = toActividadValue(actividad);
      this._selectedActividad.set(value);
    } else {
      this._selectedActividad.set(null);
    }
  }

  /**
   * Limpia la selección
   */
  clearSelection(): void {
    this._selectedActividad.set(null);
    this._actividades.set([]);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }
}

