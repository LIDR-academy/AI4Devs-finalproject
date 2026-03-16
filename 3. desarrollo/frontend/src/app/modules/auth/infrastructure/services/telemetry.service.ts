import { Injectable } from '@angular/core';

/**
 * Servicio para rastrear tiempo en pantalla
 * Útil para análisis y métricas de uso
 */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private startTime: number | null = null;
  private screenName: string | null = null;

  /**
   * Inicia el timer para una pantalla específica
   * @param screenName Nombre de la pantalla/componente
   */
  startScreenTimer(screenName: string): void {
    this.screenName = screenName;
    this.startTime = Date.now();
  }

  /**
   * Detiene el timer y retorna el tiempo transcurrido
   */
  stopScreenTimer(): number {
    if (!this.startTime) {
      return 0;
    }

    const timeOnScreen = Date.now() - this.startTime;
    this.startTime = null;
    this.screenName = null;

    return timeOnScreen;
  }

  /**
   * Obtiene el tiempo transcurrido en la pantalla actual sin detener el timer
   */
  getTimeOnScreen(): number {
    if (!this.startTime) {
      return 0;
    }

    return Date.now() - this.startTime;
  }

  /**
   * Obtiene el nombre de la pantalla actual
   */
  getCurrentScreenName(): string | null {
    return this.screenName;
  }

  /**
   * Verifica si hay un timer activo
   */
  isTracking(): boolean {
    return this.startTime !== null;
  }
}

