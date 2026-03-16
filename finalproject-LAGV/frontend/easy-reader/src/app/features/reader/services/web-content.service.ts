import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ReadingMode, WebViewerState, WebConfig } from '../../../shared/types/reading.types';


const DEFAULT_WEB_CONFIG: WebConfig = {
  scrollSpeed: 1,
  readingMode: 'manual',
  isReading: false
};

const INITIAL_STATE: WebViewerState = {
  isLoaded: false,
  config: DEFAULT_WEB_CONFIG
};

@Injectable({
  providedIn: 'root'
})
export class WebContentService {
  private urlSubject = new BehaviorSubject<string>('');
  private viewerState = new BehaviorSubject<WebViewerState>(INITIAL_STATE);
  
  // Nuevos Subjects para comandos de desplazamiento
  private upPageSubject = new Subject<void>();
  private downPageSubject = new Subject<void>();
  private topPageSubject = new Subject<void>();
  private bottomPageSubject = new Subject<void>();

  // Observables públicos
  url$ = this.urlSubject.asObservable();
  viewerState$ = this.viewerState.asObservable();
  
  // Nuevos observables para comandos de desplazamiento
  upPage$ = this.upPageSubject.asObservable();
  downPage$ = this.downPageSubject.asObservable();
  topPage$ = this.topPageSubject.asObservable();
  bottomPage$ = this.bottomPageSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Valida y prepara una URL para ser mostrada
   */
  async validateUrl(url: string): Promise<string> {
    try {
     /* if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }*/
      
      // await this.checkUrlAccess(url);
      this.urlSubject.next(url);
      return url;
    } catch (error) {
      console.error('Error validating URL:', error);
      throw new Error('No se pudo validar la URL proporcionada');
    }
  }

  /**
   * Actualiza la configuración del visor
   */
  updateConfig(config: Partial<WebConfig>): void {
    const currentState = this.viewerState.value;
    this.viewerState.next({
      ...currentState,
      config: { ...currentState.config, ...config }
    });
  }

  /**
   * Establece el modo de lectura
   */
  setReadingMode(mode: ReadingMode): void {
    this.updateConfig({
      readingMode: mode,
      isReading: mode === 'manual'
    });
  }

  /**
   * Establece la velocidad de desplazamiento
   */
  setScrollSpeed(speed: number): void {
    this.updateConfig({ scrollSpeed: speed });
  }

  /**
   * Inicializa el visor
   */
  initializeViewer(): void {
    const currentState = this.viewerState.value;
    this.viewerState.next({
      ...currentState,
      isLoaded: true
    });
  }

  /**
   * Reinicia el estado del visor
   */
  resetViewer(): void {
    this.viewerState.next(INITIAL_STATE);
    this.urlSubject.next('');
  }

  /**
   * Obtiene la URL actual
   */
  getCurrentUrl(): string {
    return this.urlSubject.value;
  }

  /**
   * Verifica si la URL es accesible
   */
  private async checkUrlAccess(url: string): Promise<void> {
    try {
      await this.http.head(url).toPromise();
    } catch (error) {
      throw new Error('URL no accesible');
    }
  }
  
  // Nuevos métodos para comandos de desplazamiento
  /**
   * Solicita desplazamiento hacia arriba
   */
  requestUpPage(): void {
    this.upPageSubject.next();
  }

  /**
   * Solicita desplazamiento hacia abajo
   */
  requestDownPage(): void {
    this.downPageSubject.next();
  }

  /**
   * Solicita desplazamiento al inicio de la página
   */
  requestTopPage(): void {
    this.topPageSubject.next();
  }

  /**
   * Solicita desplazamiento al final de la página
   */
  requestBottomPage(): void {
    this.bottomPageSubject.next();
  }

  /**
   * Limpia el estado del visor
   */
  clearViewerState(): void {
    this.viewerState.next(INITIAL_STATE);
    this.urlSubject.next('');
  }
}