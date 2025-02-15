import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReporteService } from '../services/reporte.service';
import { RatingService } from '../services/rating.service';

interface Rating {
  valor: number;
  comentario: string;
}

interface Comment {
  rating: number;
  text: string;
}

interface RatingResponse {
  ratings: Array<{valor: number, comentario: string}>;
  cantidadRatings: number;
  ratingPromedio: number;
}

@Component({
  selector: 'app-comments-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  template: `
    <div mat-dialog-title class="title-container">
      <span>{{data.marker.category}}</span>
      <div class="rating-summary">
        <div class="rating-count">
          <span class="people-icon">👥</span>
          {{cantidadRatings}}
        </div>
        <div class="stars">
          <span *ngFor="let star of [1,2,3,4,5]" 
                class="star"
                [class.active]="star <= (ratingPromedio ? Math.round(ratingPromedio) : 0)">
            ★
          </span>
        </div>
      </div>
    </div>
    
    <mat-dialog-content>
      <p class="description">{{data.marker.description}}</p>

      <div class="rating-section">
        <div class="stars rating-stars">
          <span *ngFor="let star of [1,2,3,4,5]" 
                class="star"
                [class.active]="star <= newRating"
                (click)="setRating(star)">
            ★
          </span>
        </div>
      </div>

      <mat-form-field class="comment-input">
        <textarea matInput
                  [(ngModel)]="newComment"
                  placeholder="Escribe tu comentario"
                  maxlength="250"
                  rows="3"></textarea>
        <mat-hint align="end">{{newComment.length}}/250</mat-hint>
      </mat-form-field>

      <div class="comments-list">
        <div class="comment-item" *ngFor="let comment of comments">
          <div class="stars">
            <span *ngFor="let star of [1,2,3,4,5]" 
                  class="star"
                  [class.active]="star <= comment.rating">
              ★
            </span>
          </div>
          <p class="comment-text">{{comment.text}}</p>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-button color="warn" (click)="onDelete()">Eliminar</button>
      <button mat-raised-button color="primary" (click)="onAccept()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .rating-summary {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .rating-count {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 14px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 16px;
      color: #e0e0e0;
    }

    .star.active {
      color: #ffd700;
    }

    .description {
      margin-bottom: 20px;
      color: #666;
    }

    .rating-section {
      margin: 20px 0;
    }

    .stars {
      display: flex;
      gap: 5px;
    }

    .rating-stars .star {
      font-size: 48px;  /* Doble tamaño para las estrellas de calificación */
    }

    .star {
      font-size: 24px;
      cursor: pointer;
      color: #e0e0e0;
      transition: color 0.2s;
    }

    .star.active {
      color: #ffd700;
    }

    .comment-input {
      width: 100%;
      margin: 20px 0;
    }

    .comments-list {
      margin-top: 30px;
    }

    .comment-item {
      margin: 15px 0;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .comment-text {
      margin: 5px 0;
      color: #666;
    }

    .people-icon {
      font-size: 14px;
      margin-right: 4px;
    }
  `]
})
export class CommentsDialogComponent {
  newRating: number = 0;
  newComment: string = '';
  comments: Comment[] = [];
  Math = Math;
  cantidadRatings: number = 0;
  ratingPromedio: number = 0;

  constructor(
    public dialogRef: MatDialogRef<CommentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private reporteService: ReporteService,
    private ratingService: RatingService
  ) {
    if (this.data.marker) {
      this.cantidadRatings = this.data.marker.cantidadRatings || 0;
      this.ratingPromedio = this.data.marker.ratingPromedio || 0;
    }

    if (this.data.marker?.id) {
      this.ratingService.consultarRatingsPorReporte(this.data.marker.id).subscribe({
        next: (response: Rating[]) => {
          console.log('Respuesta del servicio:', response);
          this.comments = response.map(rating => ({
            rating: rating.valor,
            text: rating.comentario
          }));
          this.cantidadRatings = response.length;
          this.ratingPromedio = response.reduce((acc, curr) => acc + curr.valor, 0) / response.length || 0;
        },
        error: (error) => {
          console.error('Error al cargar los ratings:', error);
        }
      });
    }
  }

  setRating(rating: number) {
    this.newRating = rating;
  }

  onDelete() {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta marca?');
    
    if (confirmar) {
      console.log('Intentando eliminar marcador:', this.data.marker);
      
      if (!this.data.marker?.id) {
        console.error('Error: No hay ID de marcador:', this.data.marker);
        alert('Error: No se puede eliminar el reporte porque falta el ID');
        return;
      }

      this.reporteService.eliminarReporte(this.data.marker.id).subscribe({
        next: () => {
          console.log('Reporte eliminado exitosamente');
          if (this.data.onDelete) {
            this.data.onDelete();
          }
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al eliminar:', error);
          alert('Error al eliminar el reporte');
        }
      });
    }
  }

  onAccept() {
    if (this.newRating && this.newComment.trim()) {
      const nuevoRating = {
        reporteId: this.data.marker.id,
        valor: this.newRating,
        comentario: this.newComment.trim()
      };

      this.ratingService.crearRating(nuevoRating).subscribe({
        next: (response) => {
          console.log('Rating guardado exitosamente:', response);
          this.comments.unshift({
            rating: this.newRating,
            text: this.newComment
          });
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Error al guardar el rating:', error);
          alert('Error al guardar el comentario. Por favor, intente nuevamente.');
        }
      });
    } else {
      alert('Por favor, asegúrate de que has seleccionado una calificación y escrito un comentario.');
    }
  }
}
