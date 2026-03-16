import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Servicio para rastrear inactividad del usuario
 * Detecta cuando el usuario no interactúa con la aplicación por un período determinado
 */
@Injectable({ providedIn: 'root' })
export class InactivityService {
  private readonly DEFAULT_TIMEOUT = 300000; // 5 minutos en milisegundos
  private timeoutId: any = null;
  private readonly timeoutSubject = new Subject<void>();
  private readonly events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  private eventHandlers: Map<string, EventListener> = new Map();
  private isTracking = false;

  constructor(private readonly ngZone: NgZone) {}

  /**
   * Inicia el rastreo de inactividad
   * @param timeout Tiempo en milisegundos antes de considerar inactivo (default: 5 minutos)
   */
  startTracking(timeout: number = this.DEFAULT_TIMEOUT): void {
    if (this.isTracking) {
      this.stopTracking();
    }

    this.isTracking = true;
    this.resetTimer(timeout);

    // Agregar listeners para eventos de actividad
    this.events.forEach((eventName) => {
      const handler = () => this.resetTimer(timeout);
      this.eventHandlers.set(eventName, handler);
      document.addEventListener(eventName, handler, { passive: true });
    });
  }

  /**
   * Detiene el rastreo de inactividad
   */
  stopTracking(): void {
    this.isTracking = false;
    this.clearTimer();

    // Remover listeners
    this.eventHandlers.forEach((handler, eventName) => {
      document.removeEventListener(eventName, handler);
    });
    this.eventHandlers.clear();
  }

  /**
   * Resetea el timer de inactividad
   */
  resetTimer(timeout: number = this.DEFAULT_TIMEOUT): void {
    this.clearTimer();

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.timeoutSubject.next();
        });
      }, timeout);
    });
  }

  /**
   * Limpia el timer actual
   */
  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Observable que emite cuando se detecta inactividad
   */
  get onTimeout$(): Observable<void> {
    return this.timeoutSubject.asObservable();
  }

  /**
   * Verifica si el servicio está rastreando actividad
   */
  isActive(): boolean {
    return this.isTracking;
  }
}

