import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../services/pdf.service';
import { Router } from '@angular/router';
import { ReadingMode } from '@shared/types/reading.types';
import { map, Subject, takeUntil } from 'rxjs';
declare const pdfjsLib: any;

@Component({
  selector: 'app-pdf-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-content.component.html',
  styleUrls: ['./pdf-content.component.scss']
})
export class PdfContentComponent implements OnInit, AfterViewInit {
  @ViewChild('pdfContainer') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('pdfCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pageInfo') pageInfo!: ElementRef;

  private pdfService = inject(PdfService);
  private pdfDoc: any = null;
  private pageRendering = false;
  private pageNumPending: number | null = null;
  private scale = 3.0;
  private ctx!: CanvasRenderingContext2D;
  private destroy$ = new Subject<void>();

  currentPage = 1;
  totalPages = 0;
  documentTitle: string = '';
  currentPageText: string = '';
  readingMode: ReadingMode | null = null;
  constructor(private router: Router, private cdr: ChangeDetectorRef) {
    // Configurar el worker de PDF.js
    // pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.mjs';

    this.pdfService.viewerState$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.readingMode = state.config.readingMode;
      this.documentTitle = state.title;
    });
  }

  ngOnInit(): void {
    const currentUrl = this.pdfService.getCurrentUrl();
    if (currentUrl) {
      this.loadPdf(currentUrl);
    }
    
    // Suscribirse a las solicitudes de cambio de página
    this.pdfService.nextPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('nextPage Automatic');
      if (this.readingMode === 'textToSpeech' && this.currentPage < this.totalPages) {
        this.nextPage(false);
      } else if (this.readingMode === 'voiceCommands') {
        this.nextPage(false);
      }
    });

    // Suscribirse a las solicitudes de página anterior
    this.pdfService.previousPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('previousPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.previousPage(false);
      }
    });

    // Suscribirse a las solicitudes de ir a la última página
    this.pdfService.lastPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('lastPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.lastPage(false);
      }
    });

    // Suscribirse a las solicitudes de ir a la primera página
    this.pdfService.firstPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('firstPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.firstPage(false);
      }
    });

    // Agregar nueva suscripción para bottom
    this.pdfService.bottomPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('bottomPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        debugger;
        this.scrollToBottom();
      }
    });

    // Agregar nueva suscripción para top
    this.pdfService.topPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('topPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.scrollToTop();
      }
    });

    // Agregar nueva suscripción para up
    this.pdfService.upPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('upPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.scrollUp();
      }
    });

    // Agregar nueva suscripción para down
    this.pdfService.downPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('downPage Automatic');
      if (this.readingMode === 'voiceCommands') {
        this.scrollDown();
      }
    });

    // Agregar nueva suscripción para goToPage
    this.pdfService.goToPage$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((pageNumber) => {
      console.log('goToPage Automatic', pageNumber);
      if (this.readingMode === 'voiceCommands') {
        this.goToPage(pageNumber, false);
      }
    });
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPdf(url: string): Promise<void> {
    try {
      this.pdfDoc = await pdfjsLib.getDocument(url).promise;
      this.totalPages = this.pdfDoc.numPages;
      await this.renderPage(this.currentPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  private async renderPage(pageNumber: number, detonationManual: boolean = true): Promise<void> {
    this.pageRendering = true;

    try {
      const page = await this.pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: this.scale });

      const canvas = this.canvasRef.nativeElement;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      await renderTask.promise;
      

      if (this.readingMode === 'textToSpeech') {
        // Extraer el texto de la página actual
        const textContent = await page.getTextContent();
        this.currentPageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        // Actualizar el servicio con el texto actual
        this.pdfService.setCurrentPageText(this.currentPageText, detonationManual);
      }

      this.pageRendering = false;
      
      if (this.pageNumPending !== null) {
        await this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      this.pageRendering = false;
    }
  }

  private async queueRenderPage(pageNumber: number, detonationManual: boolean = true): Promise<void> {
    if (this.pageRendering) {
      this.pageNumPending = pageNumber;
    } else {
      await this.renderPage(pageNumber, detonationManual);
    }
  }

  private applyShakeEffect(): void {
    const pageInfoElement = this.pageInfo.nativeElement;
    pageInfoElement.classList.add('shake-animation');
    if (this.cdr) {
      this.cdr.detectChanges();
    }
    
    setTimeout(() => {
      pageInfoElement.classList.remove('shake-animation');
      if (this.cdr) {
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  async previousPage(detonationManual: boolean = true): Promise<void> {
    if (this.currentPage <= 1) {
      this.applyShakeEffect();
      return;
    }
    
    this.currentPage--;

    if (this.cdr) {
      this.cdr.detectChanges();
    }

    await this.queueRenderPage(this.currentPage, detonationManual);
  }

  async nextPage(detonationManual: boolean = true): Promise<void> {
    if (this.currentPage >= this.totalPages) {
      this.applyShakeEffect();
      return;
    }
    
    this.currentPage++;

    if (this.cdr) {
      this.cdr.detectChanges();
    }

    await this.queueRenderPage(this.currentPage, detonationManual);
  }

  async lastPage(detonationManual: boolean = true): Promise<void> {
    if (this.currentPage === this.totalPages) {
      this.applyShakeEffect();
      return;
    }
    
    this.currentPage = this.totalPages;

    if (this.cdr) {
      this.cdr.detectChanges();
    }

    await this.queueRenderPage(this.currentPage, detonationManual);
  }

  async firstPage(detonationManual: boolean = true): Promise<void> {
    if (this.currentPage === 1) {
      this.applyShakeEffect();
      return;
    }
    
    this.currentPage = 1;

    if (this.cdr) {
      this.cdr.detectChanges();
    }

    await this.queueRenderPage(this.currentPage, detonationManual);
  }

  closeDocument() {
    // Limpiar el PDF del servicio
    this.pdfService.clearPdf();
    // Navegar de regreso a la página de inicio
    this.router.navigate(['/reader']);
  }

  // Agregar nuevo método para scroll
  private scrollToBottom(): void {
    debugger;
    const container = this.containerRef.nativeElement;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }

  // Agregar nuevo método para scroll hacia arriba
  private scrollToTop(): void {
    const container = this.containerRef.nativeElement;
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Agregar nuevos métodos para scroll incremental
  private scrollUp(): void {
    const container = this.containerRef.nativeElement;
    const scrollAmount = container.clientHeight * 0.25; // Scroll del 25% de la altura visible
    container.scrollBy({
      top: -scrollAmount,
      behavior: 'smooth'
    });
  }

  private scrollDown(): void {
    const container = this.containerRef.nativeElement;
    const scrollAmount = container.clientHeight * 0.25; // Scroll del 25% de la altura visible
    container.scrollBy({
      top: scrollAmount,
      behavior: 'smooth'
    });
  }

  // Agregar nuevo método
  async goToPage(pageNumber: number, detonationManual: boolean = true): Promise<void> {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      this.applyShakeEffect();
      return;
    }
    
    this.currentPage = pageNumber;

    if (this.cdr) {
      this.cdr.detectChanges();
    }

    await this.queueRenderPage(this.currentPage, detonationManual);
  }
}