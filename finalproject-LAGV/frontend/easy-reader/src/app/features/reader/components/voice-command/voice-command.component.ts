import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../services/pdf.service';
import { Subject } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

interface MicState {
  message: string;
  iconClass: string;
  iconColor: string;
  iconBackgroundColor?: string;
}

interface FeedbackState {
  messageLabel: string;
  message?: string;
  colorMessageLabel: string;
  colorMessage: string;
}

interface CommandGroups {
    next: Set<string>;
    previous: Set<string>;
    first: Set<string>;
    last: Set<string>;
    top: Set<string>;
    bottom: Set<string>;
    up: Set<string>;
    down: Set<string>;
    goTo: Set<string>;
    more: Set<string>;
}

interface LanguageCommands {
    [key: string]: CommandGroups;
}

const commandsByLanguage: LanguageCommands = {
    'es-MX': {
        next: new Set(['ir a la página siguiente', 'cambia de página', 'siguiente página', 'adelante', 'prosigue', 'continúa', 'avanzar', 'avanza', 'continuar', 'siguiente']),
        previous: new Set(['ir a la página anterior', 'anterior', 'regresar', 'regresa', 'volver', 'vuelve', 'atrás']),
        first: new Set(['primera página', 'primera']),
        last: new Set(['última página', 'última']),
        bottom: new Set(['bajar al final', 'pie de página', 've al final', 'ir al final', 'baja todo', 'fin de página']),
        top: new Set(['inicio de página', 've al principio', 'sube todo', 've al inicio']),
        up: new Set(['sube un poco mas', 'arriba un poco', 'sube un poco', 'sube más', 'arriba', 'sube']),
        down: new Set(['baja un poco mas', 'abajo un poco', 'baja un poco', 'baja más', 'abajo', 'baja']),
        goTo: new Set(['ve a la página', 'ir a la página', 'ir a página', 'ir a la', 'ir a', 'página']),
        more: new Set(['un poco más', 'más']),
    },    
    'en-US': {
        next: new Set(['next', 'forward']),
        previous: new Set(['previous', 'back']),
        first: new Set(['first', 'first page']),
        last: new Set(['last', 'last page']),
        top: new Set(['top']),
        bottom: new Set(['bottom']),
        up: new Set(['up']),
        down: new Set(['down']),
        goTo: new Set(['go to']),
        more: new Set(['more']),
    }
};

@Component({
  selector: 'app-voice-command',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  templateUrl: './voice-command.component.html',
  styleUrls: ['./voice-command.component.scss']
})
export class VoiceCommandComponent implements OnInit, OnDestroy {
  @ViewChild('instructionsModal') instructionsModal!: TemplateRef<any>;
  @ViewChild('commandsListModal') commandsListModal!: TemplateRef<any>;
  public recognition: any;
  private speechGrammarList: any;
  isListening: boolean = false;
  private commands: Set<string> = new Set();
  private destroy$ = new Subject<void>();
  private pdfService = inject(PdfService);
  private cdr = inject(ChangeDetectorRef);
  private hasError: boolean = false;
  private lastAction: 'up' | 'down' | null = null;
  showInstructions: boolean = false;
  public overlayRef: OverlayRef | null = null;
  public commandsListOverlayRef: OverlayRef | null = null;

  micState: MicState = {
    message: 'Please authorize microphone access to proceed',
    iconClass: 'fa-microphone',
    iconColor: 'white',
    iconBackgroundColor: '#6366F1'
  };

  micStates: Record<string, MicState> = {
    default: this.micState,
    warmingUp: {
      message: 'Preparing voice recognition...',
      iconClass: 'fa-microphone',
      iconColor: 'white',
      iconBackgroundColor: '#FCD34D'
    },
    onstart: {
      message: 'Listening',
      iconClass: 'fa-microphone',
      iconColor: 'white',
      iconBackgroundColor: '#10B981'
    },
    onend: {
      message: 'Click to speak again',
      iconClass: 'fa-microphone-slash',
      iconColor: 'white',
      iconBackgroundColor: '#6B7280'
    },
    onerror: {
      message: 'Microphone access is required. Please enable it in your browser settings to continue.',
      iconClass: 'fa-microphone-slash',
      iconColor: 'white',
      iconBackgroundColor: '#EF4444'
    },
    network: {
      message: 'Connection error. Please check your internet connection and try again.',
      iconClass: 'fa-microphone-slash',
      iconColor: 'white',
      iconBackgroundColor: '#EF4444'
    }
  };

  feedbackState: FeedbackState = {
    messageLabel: '',
    colorMessageLabel: '',
    colorMessage: ''
  };

  feedbackStates: Record<string, FeedbackState> = {
    default: this.feedbackState,
    success: {
      messageLabel: 'Executed successfully: ',
      colorMessageLabel: '#6B7280',
      colorMessage: '#10B981'
    },
    fail: {
      messageLabel: 'Invalid command: ',
      colorMessageLabel: '#6B7280',
      colorMessage: '#EF4444'
    }
  };

  private readonly commandActions = {
    next: () => this.pdfService.requestNextPage(),
    previous: () => this.pdfService.requestPreviousPage(),
    last: () => this.pdfService.requestLastPage(),
    first: () => this.pdfService.requestFirstPage(),
    bottom: () => this.pdfService.requestBottomPage(),
    top: () => this.pdfService.requestTopPage(),
    up: () => {
      this.lastAction = 'up';
      this.pdfService.requestUpPage();
    },
    down: () => {
      this.lastAction = 'down';
      this.pdfService.requestDownPage();
    },
    goTo: (transcript: string) => this.handleGoToPage(transcript),
    more: () => {
      if (this.lastAction === 'up') {
        this.pdfService.requestUpPage();
      } else if (this.lastAction === 'down') {
        this.pdfService.requestDownPage();
      }
    }
  };

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const SpeechGrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'es-MX';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;

      const { grammar, commands } = this.initializeCommandsAndGrammar();
      this.commands = commands;

      // Intentar usar gramática solo si está disponible
      if (SpeechGrammarList) {
        try {
          console.log('grammar:', grammar);
          this.speechGrammarList = new SpeechGrammarList();
          this.speechGrammarList.addFromString(grammar, 1);
          this.recognition.grammars = this.speechGrammarList;
        } catch (error) {
          console.warn('Grammar list not supported:', error);
        }
      }

      this.recognition.onstart = () => {
        this.isListening = true;
        this.hasError = false;
        console.log('event: onstart');
        this.updateMicState('onstart');
      };

      this.recognition.onend = () => {
        if (!this.hasError) {
          this.isListening = false;
          console.log('event: onend');
          this.updateMicState('onend');
         /* setTimeout(() => {
            this.updateMicState('default');
            this.cdr.detectChanges();
          }, 2000);*/
        }
      };
      this.recognition.onresult = (event: any) => {
        console.log('onresult');
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim().toLowerCase();
          if (transcript && event.results[i].isFinal) {
            const foundCommand = [...this.commands].find(command => transcript.includes(command));
            if (foundCommand) {
              this.updateFeedbackState('success', foundCommand, true, transcript);
            } else {
              this.updateFeedbackState('fail', transcript);
            }
          }
        }
        this.cdr.detectChanges();
      };

      this.recognition.onerror = (event: any) => {
        console.log('event: onerror:', event);
        if (event.error === 'not-allowed') {
          this.hasError = true;
          this.recognition.abort();
          this.updateMicState('onerror');
        } else if  (event.error === 'network') {
          this.hasError = true;
          this.recognition.abort();
          this.updateMicState('network');
        }

      };
    } else {
      console.log('event: no-speech');
      this.updateMicState('onerror');
    }
  }

  ngAfterViewInit(): void {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setTimeout(() => {
        this.openInstructions();
      }, 0);
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.updateMicState('warmingUp');
      setTimeout(() => {
        this.recognition.start();
      }, 0);
    }
  }

  abortListening(): void {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.abort();
    }
  }

  handleCommand(command: string, transcript: string): void {
    const languageCommands = commandsByLanguage[this.recognition.lang];
    const actionType = Object.entries(languageCommands).find(([_, commands]) => commands.has(command))?.[0] as keyof typeof this.commandActions;
    
    if (actionType && this.commandActions[actionType]) {
      if (!['up', 'down', 'more'].includes(actionType)) {
        this.lastAction = null;
      }
      if (actionType === 'goTo') {
        this.commandActions[actionType](transcript);
      } else {
        this.commandActions[actionType]();
      }
    } else {
      console.log(`Comando no reconocido: ${command}`);
    }
  }

  updateMicState(state: string): void {
    console.log('event: updateMicState', state);
    this.micState = this.micStates[state] || this.micStates["default"];
    this.cdr.detectChanges();
  }


  getFeedbackState(state: string, message?: string): FeedbackState {
    const feedbackState = this.feedbackStates[state];
    console.log('feedbackState:' + state)
    return {
      ...feedbackState,
      message: message
    };
  }

  private updateFeedbackState(state: string, message: string, handleCommand: boolean = false, transcript?: string): void {
    
    console.log('updateFeedbackState', state, message, handleCommand, transcript);

    setTimeout(() => {
      this.feedbackState = this.getFeedbackState(state, message);
      this.cdr.detectChanges();
    }, 250);
    setTimeout(() => {
      this.feedbackState = this.getFeedbackState('default');
      this.cdr.detectChanges();
    }, 1800);
    if (handleCommand) {
      this.handleCommand(message, transcript || message);
    }
  }

  ngOnDestroy(): void {
    this.abortListening();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCommandsAndGrammar(): { grammar: string, commands: Set<string> } {
    const currentLanguage = this.recognition.lang;
    const languageCommands = commandsByLanguage[currentLanguage];
    if (!languageCommands) {
        console.warn(`No commands defined for language: ${currentLanguage}`);
        return { grammar: '', commands: new Set() };
    }
    const allCommands = Object.values(languageCommands)
        .reduce<string[]>((acc, commandSet) => {
            return [...acc, ...Array.from<string>(commandSet)];
        }, []);
    const commands = new Set<string>(allCommands);
    const grammar = `#JSGF V1.0; grammar commands; public <command> = ${allCommands.join(' | ')} ;`;
    return { grammar, commands };
  }

  private handleGoToPage(transcript: string): void {
    const numberMatch = transcript.match(/\d+/);
    if (numberMatch) {
      const pageNumber = parseInt(numberMatch[0], 10);
      this.pdfService.requestGoToPage(pageNumber);
    } else {
      this.updateFeedbackState('fail', transcript);
      this.cdr.detectChanges();
    }
  }

  toggleInstructions(): void {
    return;;
    if (this.overlayRef) {
      this.closeInstructions();
    } else {
      this.openInstructions();
    }
  }

  openInstructions(): void {
    if (this.isListening) {
      this.abortListening();
    }

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
      this.instructionsModal,
      this.viewContainerRef
    );
    
    this.overlayRef.attach(portal);
  }

  closeInstructions(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  toggleCommandsList(): void {
    if (this.commandsListOverlayRef) {
      this.closeCommandsList();
    } else {
      this.openCommandsList();
    }
  }

  openCommandsList(): void {
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.commandsListOverlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block()
    });

    const commandsPortal = new TemplatePortal(
      this.commandsListModal,
      this.viewContainerRef
    );

    this.commandsListOverlayRef.attach(commandsPortal);
    this.commandsListOverlayRef.backdropClick().subscribe(() => this.closeCommandsList());
  }

  closeCommandsList(): void {
    if (this.commandsListOverlayRef) {
      this.commandsListOverlayRef.dispose();
      this.commandsListOverlayRef = null;
    }
  }

  getCommandsArray(action: keyof CommandGroups): string[] {
    const commands = commandsByLanguage[this.recognition.lang][action];
    return Array.from(commands).reverse();
  }

  public isCommandsListOverlayOpen(): boolean {
    return this.commandsListOverlayRef !== null;
  }

  changeReadingMode() {
    this.pdfService.setReadingMode('textToSpeech');
  }
} 