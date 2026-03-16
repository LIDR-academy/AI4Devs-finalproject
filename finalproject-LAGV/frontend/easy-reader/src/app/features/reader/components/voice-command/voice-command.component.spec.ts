import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoiceCommandComponent } from './voice-command.component';
import { Overlay } from '@angular/cdk/overlay';
import { PdfService } from '../../services/pdf.service';
import { ChangeDetectorRef } from '@angular/core';

describe('VoiceCommandComponent', () => {
  let component: VoiceCommandComponent;
  let fixture: ComponentFixture<VoiceCommandComponent>;
  let pdfServiceMock: jasmine.SpyObj<PdfService>;
  let overlayMock: jasmine.SpyObj<Overlay>;
  let cdrMock: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    pdfServiceMock = jasmine.createSpyObj('PdfService', ['requestNextPage', 'requestPreviousPage', 'requestLastPage', 'requestFirstPage', 'requestBottomPage', 'requestTopPage', 'requestUpPage', 'requestDownPage', 'requestGoToPage']);
    overlayMock = jasmine.createSpyObj('Overlay', ['create']);
    cdrMock = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [VoiceCommandComponent],
      providers: [
        { provide: PdfService, useValue: pdfServiceMock },
        { provide: Overlay, useValue: overlayMock },
        { provide: ChangeDetectorRef, useValue: cdrMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoiceCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start listening when startListening is called', () => {
    spyOn(component.recognition, 'start').and.callFake(() => {
      component.recognition.onstart();
      expect(component.isListening).toBeTrue();
    });
    component.startListening();
  });

  it('should stop listening when abortListening is called', () => {
    component.startListening();
    component.abortListening();
    expect(component.isListening).toBeFalse();
  });

  it('should handle command correctly', () => {
    const command = 'siguiente página';
    const transcript = 'siguiente página';
    spyOn(component, 'handleCommand').and.callThrough();
    component.handleCommand(command, transcript);
    expect(component.handleCommand).toHaveBeenCalledWith(command, transcript);
    expect(pdfServiceMock.requestNextPage).toHaveBeenCalled();
  });

  it('should update mic state correctly', () => {
    component.updateMicState('onstart');
    expect(component.micState.message).toBe('Listening');
  });

  it('should toggle instructions modal', () => {
    component.toggleInstructions();
    expect(component.overlayRef).not.toBeNull();
    component.toggleInstructions();
    expect(component.overlayRef).toBeNull();
  });

  it('should open and close commands list modal', () => {
    component.openCommandsList();
    expect(component.isCommandsListOverlayOpen()).toBeTrue();
    component.closeCommandsList();
    expect(component.isCommandsListOverlayOpen()).toBeFalse();
  });

  // Añade más pruebas según las funcionalidades específicas que desees verificar
});
