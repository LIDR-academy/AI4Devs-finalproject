import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PdfService } from '../../services/pdf.service';
import { UploadFile, UploadStatus } from '@shared/types/reading.types';
import { ReadingOptionsComponent } from '../reading-options/reading-options.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-pdf-uploader',
  standalone: true,
  imports: [CommonModule, ReadingOptionsComponent],
  templateUrl: './pdf-uploader.component.html',
  styleUrls: ['./pdf-uploader.component.scss']
})
export class PdfUploaderComponent {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB en bytes
  private destroyRef = inject(DestroyRef);
  private pdfService = inject(PdfService);

  isDragging = false;
  currentFile: UploadFile | null = null;

  constructor(private router: Router) {
    this.pdfService.currentFile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(file => {
        this.currentFile = file;
      });
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  openFileDialog(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => this.onFileInputChange(e);
    input.click();
  }

  removeFile(): void {
    this.pdfService.removeFile();
    this.currentFile = null;
  }

  private handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    if (file.size > this.MAX_FILE_SIZE) {
      alert('File size exceeds 5MB limit');
      return;
    }

    this.currentFile = {
      name: file.name,
      size: file.size.toString(),
      progress: 0,
      status: 'uploading' as UploadStatus,
      file
    };
    this.pdfService.uploadFile(file);
  }

  closeComponent() {
    // Navegar de regreso a la página de inicio
    this.pdfService.clearPdf();
    this.router.navigate(['/reader']);
  }

} 