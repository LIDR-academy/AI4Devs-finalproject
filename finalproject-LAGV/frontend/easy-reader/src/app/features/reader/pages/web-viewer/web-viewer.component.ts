import { Component, DestroyRef, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReadingMode, WebViewerState } from '@shared/types/reading.types';
import { WebContentService } from '../../services/web-content.service';
import { UrlReaderComponent } from '../../components/url-reader/url-reader.component';
import { UrlViewerComponent } from '../../components/url-viewer/url-viewer.component';
import { ReaderControlComponent } from '../../components/reader-control/reader-control.component';
import { ReaderModeService } from '@shared/services/reader-mode.service';
import { VoiceCommandIframeComponent } from '../../components/voice-commnad-iframe/voice-command-iframe.component';

@Component({
  selector: 'app-web-viewer',
  standalone: true,
  imports: [
    CommonModule,
    UrlReaderComponent,
    UrlViewerComponent,
    ReaderControlComponent,
    VoiceCommandIframeComponent
  ],
  templateUrl: './web-viewer.component.html',
  styleUrls: ['./web-viewer.component.scss']
})
export class WebViewerComponent implements AfterViewInit {
  @ViewChild('webViewerContainer') webViewerContainer!: ElementRef<HTMLDivElement>;
  
  private webContentService = inject(WebContentService);
  private readerModeService = inject(ReaderModeService);
  private destroyRef = inject(DestroyRef);

  isReading = false;
  scrollSpeed = 1;
  webUrl: string = '';
  viewerState: WebViewerState | null = null;
  readingMode: ReadingMode = 'manual';

  constructor() {
    this.readerModeService.setMode('web');

    this.webContentService.viewerState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.viewerState = state;
        this.readingMode = state.config.readingMode;
      });
  }

  ngAfterViewInit(): void {
    // Suscribirse a eventos de desplazamiento
    this.webContentService.upPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('upPage Automatic');
        if (this.readingMode === 'voiceCommands') {
          this.scrollUp();
        }
      });

    this.webContentService.downPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('downPage Automatic');
        if (this.readingMode === 'voiceCommands') {
          this.scrollDown();
        }
      });

    this.webContentService.topPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('topPage Automatic');
        if (this.readingMode === 'voiceCommands') {
          this.scrollToTop();
        }
      });

    this.webContentService.bottomPage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        console.log('bottomPage Automatic');
        if (this.readingMode === 'voiceCommands') {
          this.scrollToBottom();
        }
      });
  }

  scrollUp(): void {
    if (this.webViewerContainer) {
      const container = this.webViewerContainer.nativeElement;
      debugger;
      container.scrollBy({
        top: -300,
        behavior: 'smooth'
      });
    }
  }

  scrollDown(): void {
    if (this.webViewerContainer) {
      const container = this.webViewerContainer.nativeElement;
      container.scrollBy({
        top: 300,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop(): void {
    if (this.webViewerContainer) {
      const container = this.webViewerContainer.nativeElement;
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  scrollToBottom(): void {
    if (this.webViewerContainer) {
      const container = this.webViewerContainer.nativeElement;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  onReadingModeChange(mode: ReadingMode): void {
    console.log('Modo de lectura cambiado a:', mode);
    this.readingMode = mode;
  }

  onScrollSpeedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scrollSpeed = +input.value;
  }
}