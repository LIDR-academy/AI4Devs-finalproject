import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoiceReaderComponent } from './voice-reader.component';
import { Overlay } from '@angular/cdk/overlay';
import { PdfService } from '../../services/pdf.service';
import { ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


describe('VoiceReaderComponent', () => {
  let component: VoiceReaderComponent;
  let fixture: ComponentFixture<VoiceReaderComponent>;
  let pdfServiceMock: jasmine.SpyObj<PdfService>;
  let overlayMock: jasmine.SpyObj<Overlay>;
  let cdrMock: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    const currentPageTextSubject = new BehaviorSubject({ text: '', detonationManual: false });
    pdfServiceMock = jasmine.createSpyObj('PdfService', ['someMethod'], {
      currentPageText$: currentPageTextSubject.asObservable()
    });
    overlayMock = jasmine.createSpyObj('Overlay', ['create']);
    cdrMock = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [VoiceReaderComponent],
      providers: [
        { provide: PdfService, useValue: pdfServiceMock },
        { provide: Overlay, useValue: overlayMock },
        { provide: ChangeDetectorRef, useValue: cdrMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    // Simular la API de síntesis de voz
    const mockSpeechSynthesis = {
      speak: jasmine.createSpy('speak'),
      cancel: jasmine.createSpy('cancel'),
      pause: jasmine.createSpy('pause'),
      resume: jasmine.createSpy('resume'),
      getVoices: jasmine.createSpy('getVoices').and.returnValue([]),
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
      onvoiceschanged: null
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true
    });

    const MockSpeechSynthesisUtterance = function(this: any, text: string | undefined): SpeechSynthesisUtterance {
      this.text = text || '';
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
      this.voice = null;
      this.lang = '';
      this.onboundary = null;
      this.onend = null;
      this.onerror = null;
      this.onmark = null;
      this.onpause = null;
      this.onresume = null;
      this.onstart = null;
      this.addEventListener = jasmine.createSpy('addEventListener');
      this.removeEventListener = jasmine.createSpy('removeEventListener');
      this.dispatchEvent = jasmine.createSpy('dispatchEvent');
      return this;
    };

    spyOn(window, 'SpeechSynthesisUtterance').and.callFake(MockSpeechSynthesisUtterance);

    fixture = TestBed.createComponent(VoiceReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start reading when startReading is called', () => {
    component.startReading();
    expect(component.isReading).toBeTrue();
  });

  it('should pause and resume reading', () => {
    component.startReading();
    component.playPause();
    expect(component.isPaused).toBeTrue();
    component.playPause();
    expect(component.isPaused).toBeFalse();
  });

  it('should open and close voice settings modal', () => {
    component.toggleModal();
    expect(component.overlayRef).not.toBeNull();
    component.toggleModal();
    expect(component.overlayRef).toBeNull();
  });

  // Añade más pruebas según las funcionalidades específicas que desees verificar
});

// Puedes emitir valores en currentPageTextSubject para simular cambios de texto durante las pruebas
// currentPageTextSubject.next({ text: 'Nuevo texto', detonationManual: false }); 