import { Component, OnInit, OnDestroy, Input, inject, ChangeDetectorRef, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../services/pdf.service';
import { Subscription } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

type LanguageCode = 'es-ES' | 'es-MX' | 'en-US' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR';

@Component({
  selector: 'app-voice-reader',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule],
  templateUrl: './voice-reader.component.html',
  styleUrls: ['./voice-reader.component.scss']
})
export class VoiceReaderComponent implements OnInit, OnDestroy {
  
  private pdfService = inject(PdfService);
  private router = inject(Router);
  private subscription: Subscription = new Subscription();
  
  // Propiedades para la síntesis de voz
  speechSynthesis: SpeechSynthesis = window.speechSynthesis;
  speechUtterance: SpeechSynthesisUtterance | null = null;
  isReading: boolean = false;
  isPaused: boolean = false;

  // Propiedades de configuración
  text: string = '';
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;

  // Callbacks opcionales
  onReadingStarted?: () => void;
  onReadingEnded?: () => void;
  onReadingStopped?: () => void;
  onReadingPaused?: () => void;
  onReadingResumed?: () => void;
  onReadingError?: (event: SpeechSynthesisErrorEvent) => void;

  availableVoices: SpeechSynthesisVoice[] = [];
  currentVoice: SpeechSynthesisVoice | null = null;
  oldVoice: SpeechSynthesisVoice | null = null;

 
  voiceSpeed = 1.0;
  
  @ViewChild('voiceSettingsModal') voiceSettingsModal!: TemplateRef<any>;
  public overlayRef: OverlayRef | null = null;
  
  availableLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' }
  ];

  currentLanguage: LanguageCode = 'es-MX';
  oldLanguage: LanguageCode;
  
  preferredVoices: Record<LanguageCode, string[]> = {
    'es-ES': [
      // Premium voices
      'Google español', 
      'Microsoft Helena Desktop',
      'Microsoft Elvira Desktop',
      // Mobile optimized
      'Microsoft Helena Mobile',
      'Microsoft Elvira Mobile',
      // Standard voices
      'Helena',
      'Elvira',
      'Mónica',
      'Paulina',
      'Jorge',
      'Diego',
      // iOS voices
      'Mónica (Enhanced)',
      'Jorge (Enhanced)',
      // Android voices
      'Spanish Female',
      'Spanish Male'
    ],
    'es-MX': [
      // Premium voices
      'Google español mexicano',
      'Microsoft Sabina Desktop',
      'Microsoft Raul Desktop',
      // Mobile optimized
      'Microsoft Sabina Mobile',
      'Microsoft Raul Mobile',
      // Standard voices
      'Sabina',
      'Raul',
      'Paulina',
      'Juan',
      'Carlos',
      // iOS voices
      'Paulina (Enhanced)',
      'Juan (Enhanced)',
      // Android voices
      'Mexican Spanish Female',
      'Mexican Spanish Male'
    ],
    'en-US': [
      // Premium voices
      'Google US English',
      'Microsoft David Desktop',
      'Microsoft Mark Desktop',
      'Microsoft Zira Desktop',
      // Mobile optimized
      'Microsoft David Mobile',
      'Microsoft Mark Mobile',
      'Microsoft Zira Mobile',
      // Standard voices
      'Samantha',
      'Alex',
      'Karen',
      'Daniel',
      // iOS voices
      'Samantha (Enhanced)',
      'Alex (Enhanced)',
      // Android voices
      'US English Female',
      'US English Male'
    ],
    'fr-FR': [
      // Premium voices
      'Google français',
      'Microsoft Julie Desktop',
      'Microsoft Paul Desktop',
      'Microsoft Hortense Desktop',
      // Mobile optimized
      'Microsoft Julie Mobile',
      'Microsoft Paul Mobile',
      // Standard voices
      'Thomas',
      'Amelie',
      // iOS voices
      'Thomas (Enhanced)',
      'Amelie (Enhanced)',
      // Android voices
      'French Female',
      'French Male'
    ],
    'de-DE': [
      // Premium voices
      'Google Deutsch',
      'Microsoft Hedda Desktop',
      'Microsoft Stefan Desktop',
      'Microsoft Katja Desktop',
      // Mobile optimized
      'Microsoft Hedda Mobile',
      'Microsoft Stefan Mobile',
      // Standard voices
      'Anna',
      'Klaus',
      // iOS voices
      'Anna (Enhanced)',
      'Klaus (Enhanced)',
      // Android voices
      'German Female',
      'German Male'
    ],
    'it-IT': [
      // Premium voices
      'Google italiano',
      'Microsoft Elsa Desktop',
      'Microsoft Cosimo Desktop',
      // Mobile optimized
      'Microsoft Elsa Mobile',
      'Microsoft Cosimo Mobile',
      // Standard voices
      'Alice',
      'Luca',
      'Federica',
      // iOS voices
      'Alice (Enhanced)',
      'Luca (Enhanced)',
      // Android voices
      'Italian Female',
      'Italian Male'
    ],
    'pt-BR': [
      // Premium voices
      'Google português do Brasil',
      'Microsoft Maria Desktop',
      'Microsoft Daniel Desktop',
      'Microsoft Heloisa Desktop',
      // Mobile optimized
      'Microsoft Maria Mobile',
      'Microsoft Daniel Mobile',
      // Standard voices
      'Luciana',
      'Felipe',
      // iOS voices
      'Luciana (Enhanced)',
      'Felipe (Enhanced)',
      // Android voices
      'Brazilian Portuguese Female',
      'Brazilian Portuguese Male'
    ]
  };

  get filteredVoices(): SpeechSynthesisVoice[] {
    const allVoicesForLanguage = this.availableVoices.filter(voice => 
      voice.lang.toLowerCase().includes(this.currentLanguage.toLowerCase())
    );

    // Ordenar voces poniendo las preferidas primero
    return allVoicesForLanguage.sort((a, b) => {
      const isAPreferred = this.isPreferredVoice(a);
      const isBPreferred = this.isPreferredVoice(b);
      
      if (isAPreferred && !isBPreferred) return -1;
      if (!isAPreferred && isBPreferred) return 1;
      return 0;
    });
  }

  isPreferredVoice(voice: SpeechSynthesisVoice): boolean {
    const preferredNames = this.preferredVoices[this.currentLanguage as LanguageCode] || [];
    return preferredNames.some((name: string) => voice.name.includes(name));
  }

  getBestVoiceForLanguage(lang: LanguageCode): SpeechSynthesisVoice | null {
    const voices = this.filteredVoices;
    const preferredNames = this.preferredVoices[lang] || [];
    
    // Buscar la primera voz preferida disponible
    const bestVoice = voices.find(voice => 
      preferredNames.some((name: string) => voice.name.includes(name))
    );
    
    // Si no hay voz preferida, usar la primera disponible
    return bestVoice || (voices.length > 0 ? voices[0] : null);
  }

  compareVoices(voice1: SpeechSynthesisVoice, voice2: SpeechSynthesisVoice): boolean {
    return voice1 && voice2 ? voice1.name === voice2.name : voice1 === voice2;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {
    this.oldLanguage = this.currentLanguage;
  }

  ngOnInit() {

    // Verificar que la API esté disponible en el navegador
    if (!('speechSynthesis' in window)) {
      console.error('La API de síntesis de voz no está disponible en este navegador');
      // Puedes mostrar un mensaje al usuario aquí
    }
    
    // Suscribirse a los cambios de texto de la página actual
    this.subscription.add(
      this.pdfService.currentPageText$.subscribe(pageText => {
        this.text = pageText.text;
        console.log('text', this.text);

        if (this.speechSynthesis) {
          // Cancelar la síntesis de voz actual
          this.speechSynthesis.cancel();
        }

        if (pageText.detonationManual) {
          this.stopReading();
        } else {
          setTimeout(() => { 
            this.startReading();
          }, 1000);
        }
      })
    );

    // Suscribirse a los eventos de navegación para detener el audio
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationStart)
      ).subscribe(() => {
        // Detener la lectura cuando comienza la navegación
        this.stopReading();
      })
    );

    // Manejar el evento beforeunload para detener el audio cuando se recarga la página
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Inicializar las voces
    if (window.speechSynthesis) {
      if (speechSynthesis.getVoices().length > 0) {
        this.loadVoices();
      }
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private handleBeforeUnload = () => {
    // Detener la síntesis de voz cuando se recarga la página
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  };

  ngOnDestroy() {
    // Limpiar suscripciones al destruir el componente
    this.subscription.unsubscribe();
    
    // Eliminar el event listener de beforeunload
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    
    // Detener cualquier lectura en curso
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    
    this.isReading = false;
    this.isPaused = false;
    this.closeModal();
  }

  startReading() {
    // Cancelar cualquier lectura previa si existe

    this.isReading = true;
    this.isPaused = false;

    this.cdr.detectChanges();

    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    
    // Verificar si hay texto para leer
    if (!this.text || this.text.trim() === '') {
      this.text= 'La página no tiene texto para leer';
    }
    
    // Crear una nueva instancia de SpeechSynthesisUtterance
    this.speechUtterance = new SpeechSynthesisUtterance(this.text);
    
    // Configurar propiedades de la voz
    this.speechUtterance.lang = 'es-ES'; // Idioma español
    this.speechUtterance.rate = this.rate || 1; // Velocidad de lectura
    this.speechUtterance.pitch = this.pitch || 1; // Tono de voz
    this.speechUtterance.volume = this.volume || 1; // Volumen
    
    // Asegúrate de que this.speechUtterance no sea null antes de asignar la voz
    if (this.speechUtterance && this.currentVoice) {
        this.speechUtterance.voice = this.currentVoice;
    }
    
    // Asignar eventos para controlar el progreso de la lectura
    this.speechUtterance.onstart = () => {
      this.isReading = true;
      // Opcional: notificar que comenzó la lectura
      console.log('Comenzó la lectura');
      if (this.onReadingStarted) {
        this.onReadingStarted();
      }
    };
    
    this.speechUtterance.onend = () => {
      // Las funciones flecha mantienen el contexto 'this'
      this.isReading = false;
      this.isPaused = false;
      
      // Opcional: notificar que terminó la lectura
      console.log('Terminó la lectura: ', this.text);
      if (this.onReadingEnded) {
        this.onReadingEnded();
      }
      
      // Solicitar cambio a la siguiente página cuando termine la lectura
      this.pdfService.requestNextPage();
      
      // Forzar la detección de cambios
      this.cdr.detectChanges();
    };
    
    this.speechUtterance.onerror = (event) => {
      if (event.error === 'interrupted') {
        console.log('La síntesis de voz fue interrumpida, esto es normal al detenerla manualmente');
        // No es necesario hacer nada más, ya que stopReading() ya actualiza los estados
      } else {
        // Para otros errores, mantener el comportamiento original
        console.error('Error en la síntesis de voz:', event);
        this.isReading = false;
        this.isPaused = false;
        
        // Opcional: notificar que hubo un error en la lectura
        if (this.onReadingError) {
          this.onReadingError(event);
        }
      }
      
      // Asegurarse de que los cambios de estado se detecten
      if (this.cdr) {
        this.cdr.detectChanges();
      }
    };
    
    // Iniciar la lectura
    if (this.speechSynthesis && this.speechUtterance) {
      this.speechSynthesis.speak(this.speechUtterance);
    }
  }

 
  playPause() {

    if (this.isReading && !this.isPaused) {
      // Si está leyendo y no está pausado, pausar la lectura
      this.isPaused = true;
      
      // Pausar la síntesis de voz
      if (this.speechSynthesis) {
        this.speechSynthesis.pause();
        console.log('Lectura pausada');
        
        // Opcional: notificar que se pausó la lectura
        if (this.onReadingPaused) {
          this.onReadingPaused();
        }
      }
    } else if (this.isReading && this.isPaused) {
      // Si está pausado, reanudar la lectura
      this.isPaused = false;
      
      // Reanudar la síntesis de voz
      if (this.speechSynthesis) {
        this.speechSynthesis.resume();
        console.log('Lectura reanudada');
        
        // Opcional: notificar que se reanudó la lectura
        if (this.onReadingResumed) {
          this.onReadingResumed();
        }
      }
    } else {
      // Si no está leyendo, iniciar la lectura
      this.startReading();
    }
    
    // Asegurarse de que los cambios de estado se detecten
    if (this.cdr) {
      this.cdr.detectChanges();
    }
  }

  stopReading() {
    if (this.speechSynthesis) {
      // Cancelar la síntesis de voz actual
      this.speechSynthesis.cancel();
      
      // Actualizar estados
      this.isReading = false;
      this.isPaused = false;
      
      console.log('Lectura detenida manualmente');
      
      // Opcional: notificar que se detuvo la lectura
      if (this.onReadingStopped) {
        this.onReadingStopped();
      }
    }
  }


  private loadVoices() {
    if (window.speechSynthesis) {
      this.availableVoices = window.speechSynthesis.getVoices();
      
      // Obtener la mejor voz para el idioma actual
      this.currentVoice = this.getBestVoiceForLanguage(this.currentLanguage);
      
      // Si no se encuentra una voz, usar la primera disponible
      if (!this.currentVoice && this.availableVoices.length > 0) {
        this.currentVoice = this.availableVoices[0];
      }
      
      this.oldVoice = this.currentVoice;

      console.log('Idioma actual:', this.currentLanguage);
      console.log('Voz seleccionada:', this.currentVoice?.name);
      
      // Forzar la detección de cambios
      this.cdr.detectChanges();
    }
  }

  toggleModal() {
    if (this.overlayRef) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  openModal() {
    this.stopReading();
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();
    
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block()
    });
    
    const portal = new TemplatePortal(
      this.voiceSettingsModal,
      this.viewContainerRef
    );
    
    this.overlayRef.attach(portal);
  }

  closeModal() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.currentLanguage = this.oldLanguage;
    this.currentVoice = this.oldVoice;
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentVoice = this.getBestVoiceForLanguage(this.currentLanguage);
      
      // Si no se encuentra una voz, usar la primera disponible
      if (!this.currentVoice && this.availableVoices.length > 0) {
        this.currentVoice = this.availableVoices[0];
      }
  }
  
  applyVoiceSettings() {
  
    this.oldLanguage = this.currentLanguage;
    this.oldVoice = this.currentVoice;
  
    //this.currentLanguage =  this.currentLanguage;
    console.log('Aplicando configuración:', {
      language: this.currentLanguage,
      voice: this.currentVoice?.name,
      speed: this.voiceSpeed
    });

       // Asegúrate de que this.speechUtterance no sea null antes de asignar la voz
    if (this.speechUtterance && this.currentVoice) {
        this.speechUtterance.voice = this.currentVoice;
    }

    this.closeModal();
  }

} 