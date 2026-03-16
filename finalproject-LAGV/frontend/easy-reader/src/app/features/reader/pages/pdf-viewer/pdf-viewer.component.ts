import { Component, ViewChild, ElementRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReadingMode } from '@shared/types/reading.types';
import { PdfService } from '../../services/pdf.service';
import { PdfUploaderComponent } from '../../components/pdf-uploader/pdf-uploader.component';
import { PdfViewerState } from '@shared/types/reading.types';
import { PdfContentComponent } from '../../components/pdf-content/pdf-content.component';
import { VoiceReaderComponent } from '../../components/voice-reader/voice-reader.component';
import { ReaderControlComponent } from '../../components/reader-control/reader-control.component';
import { ReaderModeService } from '@shared/services/reader-mode.service';
@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [
    CommonModule,
    PdfUploaderComponent,
    PdfContentComponent,
    VoiceReaderComponent,
    ReaderControlComponent
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {
  private pdfService = inject(PdfService);
  private destroyRef = inject(DestroyRef);
  private readerModeService = inject(ReaderModeService);


  isReading = false;
  scrollSpeed = 1;
  pdfLoaded = false;
  viewerState: PdfViewerState | null = null;

  constructor() {
    this.readerModeService.setMode('pdf');
    
    this.pdfService.viewerState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.viewerState = state;
      });

    this.pdfService.pdfUrl$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(url => {
        this.pdfLoaded = !!url;
      });
  }

  onReadingModeChange(mode: ReadingMode): void {
    console.log('Modo de lectura cambiado a:', mode);
  }

  onScrollSpeedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scrollSpeed = +input.value;
  }
}