import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Componente de captcha matemático simple
 * Genera una operación matemática aleatoria para verificación
 */
@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="captcha-container">
      <div class="captcha-challenge">
        <span class="captcha-question">
          {{ num1 }} + {{ num2 }} = ?
        </span>
        <button
          mat-icon-button
          type="button"
          (click)="regenerate()"
          matTooltip="Generar nueva operación"
        >
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
      <mat-form-field appearance="outline" class="captcha-input">
        <mat-label>Resultado</mat-label>
        <input
          matInput
          type="number"
          [(ngModel)]="userAnswer"
          (input)="onAnswerChange()"
          placeholder="Ingrese el resultado"
        />
      </mat-form-field>
      <div *ngIf="error" class="captcha-error">
        <mat-icon>error</mat-icon>
        <span>Resultado incorrecto. Intente nuevamente.</span>
      </div>
    </div>
  `,
  styles: [`
    .captcha-container {
      margin-top: 16px;
      padding: 16px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
    }

    .captcha-challenge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .captcha-question {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937; /* gray-800 */
    }

    .captcha-input {
      width: 100%;
    }

    .captcha-error {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      color: #ef4444; /* red-500 */
      font-size: 13px;
    }

    .captcha-error mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class CaptchaComponent implements OnInit {
  @Output() resolved = new EventEmitter<string>();

  num1 = 0;
  num2 = 0;
  correctAnswer = 0;
  userAnswer: number | null = null;
  error = false;

  ngOnInit(): void {
    this.regenerate();
  }

  /**
   * Regenera una nueva operación matemática
   */
  regenerate(): void {
    // Generar números aleatorios entre 1 y 20
    this.num1 = Math.floor(Math.random() * 20) + 1;
    this.num2 = Math.floor(Math.random() * 20) + 1;
    this.correctAnswer = this.num1 + this.num2;
    this.userAnswer = null;
    this.error = false;
  }

  /**
   * Valida la respuesta cuando el usuario escribe
   */
  onAnswerChange(): void {
    this.error = false;

    if (this.userAnswer !== null && this.userAnswer === this.correctAnswer) {
      // Generar un token simple (en producción usar algo más seguro)
      const token = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.resolved.emit(token);
    } else if (this.userAnswer !== null && this.userAnswer !== this.correctAnswer) {
      // Solo mostrar error si el usuario ha ingresado algo y es incorrecto
      // No mostrar error mientras está escribiendo
      if (this.userAnswer.toString().length >= this.correctAnswer.toString().length) {
        this.error = true;
      }
    }
  }
}

