import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-marker-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Nueva Marca</h2>
    <h3 mat-dialog-subtitle>Lat: {{data.lat?.toFixed(6)}}; Lon: {{data.lng?.toFixed(6)}}</h3>
    <mat-dialog-content>
      <form #markerForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select 
            [(ngModel)]="data.category"
            name="category"
            required>
            <mat-option *ngFor="let cat of categories" [value]="cat">
              {{cat}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea 
            matInput
            [(ngModel)]="data.description"
            name="description"
            maxlength="250"
            rows="3"
            placeholder="Describe el incidente...">
          </textarea>
          <mat-hint align="end">{{data.description?.length || 0}}/250</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()">Aceptar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    mat-dialog-content {
      min-width: 300px;
    }
    h3 {
      color: rgba(0, 0, 0, 0.54);
      margin: 0;
      padding: 0 24px;
    }
  `]
})
export class MarkerFormDialogComponent {
  categories = [
    'Iluminación',
    'Robo',
    'Vandalismo',
    'Drogadicción',
    'Vías en mal estado',
    'Asalto en transporte público',
    'Esquina peligrosa'
  ];

  constructor(
    public dialogRef: MatDialogRef<MarkerFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      description?: string;
      lat?: number;
      lng?: number;
      category?: string;
    } = {
      description: '',
      category: ''
    }
  ) {}

  onSubmit(): void {
    this.dialogRef.close(this.data);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
