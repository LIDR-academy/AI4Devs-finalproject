import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../../services/pdf.service';
import { WebContentService } from '../../services/web-content.service';
import { ReadingMode } from '@shared/types/reading.types';
import { ReaderModeService } from '@shared/services/reader-mode.service';
@Component({
  selector: 'app-reading-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reading-options.component.html',
  styleUrls: ['./reading-options.component.scss']
})
export class ReadingOptionsComponent implements OnInit {
  @Output() readingModeSelected = new EventEmitter<ReadingMode>();
  
  private pdfService = inject(PdfService);
  private webContentService = inject(WebContentService);
  private readerModeService = inject(ReaderModeService);
  selectedMode: ReadingMode = 'voiceCommands';
  isMobileDevice = false;
  hasAccelerometer = false;

  ngOnInit() {
    this.checkDeviceType();
    this.checkDeviceCapabilities();
  }

  private checkDeviceType(): void {
    // Detecta si es un dispositivo móvil usando User Agent
    const userAgent = navigator.userAgent.toLowerCase();
    this.isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }

  private checkDeviceCapabilities(): void {
    // Simplemente verificamos si el dispositivo tiene la API de DeviceMotion
    // this.hasAccelerometer = 'DeviceMotionEvent' in window;
  }

  get showManualOption(): boolean {
    return this.readerModeService.getMode() === 'web';
  }

  get showVoiceCommandsOption(): boolean {
    return this.readerModeService.getMode() === 'pdf';
  }
  
  get showTextToSpeechOption(): boolean {
    return this.readerModeService.getMode() === 'pdf';
  }

  get showAccelerometerOption(): boolean {
    return this.isMobileDevice && this.hasAccelerometer;
  }

  get showFaceDetectionOption(): boolean {
    return this.readerModeService.getMode() === 'pdf';
  }

  get showUnsupportedMessage(): boolean {
    return this.isMobileDevice && !this.hasAccelerometer;
  }

  onContinue(): void {
    this.readingModeSelected.emit(this.selectedMode);

    if (this.readerModeService.getMode() === 'pdf') {
      this.pdfService.setReadingMode(this.selectedMode);
      this.pdfService.initializeViewer();
    } else {
      this.webContentService.setReadingMode(this.selectedMode);
      this.webContentService.initializeViewer(); 
    }
  }
} 