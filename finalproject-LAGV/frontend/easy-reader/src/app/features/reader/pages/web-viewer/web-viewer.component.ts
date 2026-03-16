import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReadingMode, WebViewerState } from '@shared/types/reading.types';
import { WebContentService } from '../../services/web-content.service';
import { UrlReaderComponent } from '../../components/url-reader/url-reader.component';
import { UrlViewerComponent } from '../../components/url-viewer/url-viewer.component';
import { ReaderControlComponent } from '../../components/reader-control/reader-control.component';
import { ReaderModeService } from '@shared/services/reader-mode.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-web-viewer',
  standalone: true,
  imports: [
    CommonModule,
    UrlReaderComponent,
    UrlViewerComponent,
    ReaderControlComponent
  ],
  templateUrl: './web-viewer.component.html',
  styleUrls: ['./web-viewer.component.scss']
})
export class WebViewerComponent {
  private webContentService = inject(WebContentService);
  private readerModeService = inject(ReaderModeService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  isReading = false;
  scrollSpeed = 1;
  webUrl: string = '';
  viewerState: WebViewerState | null = null;

  constructor() {

    this.readerModeService.setMode('web');

    this.webContentService.viewerState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.viewerState = state;
      });


  }

  onReadingModeChange(mode: ReadingMode): void {
    console.log('Modo de lectura cambiado a:', mode);
  }

  onScrollSpeedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scrollSpeed = +input.value;
  }

  closeComponent(): void {
    this.webContentService.clearViewer();
    this.router.navigate(['/reader']);
  }
} 