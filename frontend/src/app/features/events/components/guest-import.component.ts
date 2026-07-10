import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button.component';
import { ImportError } from '../../../core/services/guest.service';

@Component({
  selector: 'app-guest-import',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="import-container">
      <div 
        class="drop-zone" 
        (dragover)="onDragOver($event)" 
        (dragleave)="onDragLeave($event)" 
        (drop)="onDrop($event)"
        [class.drag-over]="isDragging()">
        
        <input type="file" #fileInput (change)="onFileSelected($event)" accept=".csv" style="display: none;">
        
        <div class="drop-content" (click)="fileInput.click()">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p class="drop-text">Drag and drop a CSV file here, or click to browse</p>
          <p class="drop-hint">CSV must include 'name' column. Optional: 'email', 'phone', 'category'.</p>
        </div>
      </div>

      <div *ngIf="selectedFile()" class="file-info">
        <p>Selected file: <strong>{{ selectedFile()?.name }}</strong></p>
        <app-button (click)="upload()" [disabled]="isUploading()" variant="primary">
          {{ isUploading() ? 'Uploading...' : 'Upload Guests' }}
        </app-button>
        <app-button (click)="clearFile()" [disabled]="isUploading()" variant="secondary" class="ml-2">
          Clear
        </app-button>
      </div>

      <div *ngIf="errors().length > 0" class="error-preview">
        <h4>Import Errors ({{ errors().length }})</h4>
        <div class="error-table-container">
          <table class="error-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Field</th>
                <th>Error Message</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let error of errors()">
                <td>{{ error.row }}</td>
                <td><span class="error-field">{{ error.field }}</span></td>
                <td>{{ error.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .import-container { margin-bottom: 2rem; }
    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 0.5rem;
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: #f8fafc;
    }
    .drop-zone:hover, .drop-zone.drag-over {
      border-color: #6366f1;
      background-color: #eef2ff;
    }
    .upload-icon {
      width: 3rem;
      height: 3rem;
      margin: 0 auto 1rem;
      color: #94a3b8;
    }
    .drop-text { font-size: 1.125rem; font-weight: 500; color: #334155; margin-bottom: 0.5rem; }
    .drop-hint { font-size: 0.875rem; color: #64748b; margin: 0; }
    .file-info {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #f1f5f9;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .file-info p { margin: 0; flex-grow: 1; color: #334155; }
    .ml-2 { margin-left: 0.5rem; }
    .error-preview { margin-top: 2rem; }
    .error-preview h4 { color: #ef4444; margin-bottom: 1rem; }
    .error-table-container {
      overflow-x: auto;
      border: 1px solid #fee2e2;
      border-radius: 0.5rem;
    }
    .error-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .error-table th, .error-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #fee2e2; }
    .error-table th { background-color: #fef2f2; color: #991b1b; font-weight: 600; font-size: 0.875rem; }
    .error-table tr:last-child td { border-bottom: none; }
    .error-table td { font-size: 0.875rem; color: #7f1d1d; }
    .error-field { font-family: monospace; background-color: #fee2e2; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
  `]
})
export class GuestImportComponent {
  @Input() isUploading = signal<boolean>(false);
  @Input() errors = signal<ImportError[]>([]);
  @Output() fileUpload = new EventEmitter<File>();

  isDragging = signal(false);
  selectedFile = signal<File | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        this.selectedFile.set(file);
      } else {
        alert('Please upload a valid .csv file.');
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedFile.set(file);
    } else {
      alert('Please upload a valid .csv file.');
    }
    // reset input
    event.target.value = '';
  }

  clearFile() {
    this.selectedFile.set(null);
    this.errors.set([]);
  }

  upload() {
    const file = this.selectedFile();
    if (file) {
      this.fileUpload.emit(file);
    }
  }
}
