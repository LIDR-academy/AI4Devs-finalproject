import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CiiuRepository } from '../repository/repository';
import { ActividadCompletaEntity, ArbolCiiuEntity } from '../../domain/entity';

/**
 * Controller HTTP para el módulo CIIU
 * Expone métodos observables para uso en componentes
 */
@Injectable({ providedIn: 'root' })
export class CiiuController {
  private readonly repository = inject(CiiuRepository);

  /**
   * Busca actividades por descripción (autocomplete)
   */
  searchActividades(query: string, limit?: number): Observable<ActividadCompletaEntity[]> {
    return this.repository.searchActividades(query, limit);
  }

  /**
   * Obtiene una actividad con toda su jerarquía completa
   */
  findActividadCompleta(id: number): Observable<ActividadCompletaEntity | null> {
    return this.repository.findActividadCompleta(id);
  }

  /**
   * Obtiene una actividad completa por su código abreviado
   */
  findActividadCompletaByAbr(abr: string): Observable<ActividadCompletaEntity | null> {
    return this.repository.findActividadCompletaByAbr(abr);
  }

  /**
   * Obtiene el árbol completo para navegación
   */
  findArbol(): Observable<ArbolCiiuEntity[]> {
    return this.repository.findArbolCompleto();
  }

  /**
   * Obtiene hijos de un nodo específico
   */
  findHijosByNivel(nivel: number, parentId: number): Observable<ArbolCiiuEntity[]> {
    return this.repository.findHijosByNivel(nivel, parentId);
  }
}

