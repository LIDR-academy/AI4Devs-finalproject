import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Componente que muestra la fortaleza de una contraseña
 * Calcula y muestra un indicador visual de la seguridad de la contraseña
 */
@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="password-strength-container">
      <mat-progress-bar
        [mode]="'determinate'"
        [value]="strengthPercentage"
        [color]="strengthColor"
        class="strength-bar"
      ></mat-progress-bar>
      <div class="strength-label" [class]="strengthClass">
        {{ strengthLabel }}
      </div>
    </div>
  `,
  styles: [`
    .password-strength-container {
      width: 100%;
      margin-top: 8px;
    }

    .strength-bar {
      height: 4px;
      border-radius: 2px;
    }

    .strength-label {
      margin-top: 4px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
    }

    .strength-very-weak {
      color: #dc2626; /* red-600 */
    }

    .strength-weak {
      color: #ea580c; /* orange-600 */
    }

    .strength-fair {
      color: #f59e0b; /* amber-500 */
    }

    .strength-good {
      color: #10b981; /* green-500 */
    }

    .strength-strong {
      color: #059669; /* green-600 */
    }
  `],
})
export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = '';

  strengthPercentage = 0;
  strengthColor: 'primary' | 'accent' | 'warn' = 'primary';
  strengthLabel = '';
  strengthClass = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password']) {
      this.calculateStrength();
    }
  }

  private calculateStrength(): void {
    if (!this.password || this.password.length === 0) {
      this.strengthPercentage = 0;
      this.strengthLabel = '';
      this.strengthClass = '';
      return;
    }

    let score = 0;
    const checks = {
      length: this.password.length >= 8,
      hasLower: /[a-z]/.test(this.password),
      hasUpper: /[A-Z]/.test(this.password),
      hasNumber: /[0-9]/.test(this.password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(this.password),
      longEnough: this.password.length >= 12,
    };

    // Calcular score
    if (checks.length) score += 20;
    if (checks.hasLower) score += 15;
    if (checks.hasUpper) score += 15;
    if (checks.hasNumber) score += 15;
    if (checks.hasSpecial) score += 20;
    if (checks.longEnough) score += 15;

    // Ajustar score según longitud
    if (this.password.length >= 16) score = Math.min(100, score + 10);

    this.strengthPercentage = Math.min(100, score);

    // Determinar nivel y color
    if (score < 20) {
      this.strengthLabel = 'Muy débil';
      this.strengthColor = 'warn';
      this.strengthClass = 'strength-very-weak';
    } else if (score < 40) {
      this.strengthLabel = 'Débil';
      this.strengthColor = 'warn';
      this.strengthClass = 'strength-weak';
    } else if (score < 60) {
      this.strengthLabel = 'Aceptable';
      this.strengthColor = 'accent';
      this.strengthClass = 'strength-fair';
    } else if (score < 80) {
      this.strengthLabel = 'Fuerte';
      this.strengthColor = 'primary';
      this.strengthClass = 'strength-good';
    } else {
      this.strengthLabel = 'Muy fuerte';
      this.strengthColor = 'primary';
      this.strengthClass = 'strength-strong';
    }
  }
}

