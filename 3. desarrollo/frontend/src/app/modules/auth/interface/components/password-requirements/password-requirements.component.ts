import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

/**
 * Componente que muestra los requisitos de contraseña y su estado de cumplimiento
 * Valida en tiempo real según el usuario escribe
 */
@Component({
  selector: 'app-password-requirements',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="requirements-container">
      <div
        *ngFor="let requirement of requirements"
        class="requirement-item"
        [class.requirement-met]="requirement.valid"
        [class.requirement-unmet]="!requirement.valid"
      >
        <mat-icon class="requirement-icon">
          {{ requirement.valid ? 'check_circle' : 'cancel' }}
        </mat-icon>
        <span class="requirement-label">{{ requirement.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .requirements-container {
      margin-top: 8px;
      padding: 12px;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
    }

    .requirement-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .requirement-item:last-child {
      margin-bottom: 0;
    }

    .requirement-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .requirement-met {
      color: #10b981; /* green-500 */
    }

    .requirement-unmet {
      color: #6b7280; /* gray-500 */
    }

    .requirement-label {
      flex: 1;
    }
  `],
})
export class PasswordRequirementsComponent implements OnChanges {
  @Input() password: string = '';
  @Input() minLength: number = 8;

  requirements: Array<{ label: string; valid: boolean }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['password'] || changes['minLength']) {
      this.validateRequirements();
    }
  }

  private validateRequirements(): void {
    const pwd = this.password || '';

    this.requirements = [
      {
        label: `Mínimo ${this.minLength} caracteres`,
        valid: pwd.length >= this.minLength,
      },
      {
        label: 'Al menos una mayúscula',
        valid: /[A-Z]/.test(pwd),
      },
      {
        label: 'Al menos una minúscula',
        valid: /[a-z]/.test(pwd),
      },
      {
        label: 'Al menos un número',
        valid: /[0-9]/.test(pwd),
      },
      {
        label: 'Al menos un carácter especial (!@#$%^&*)',
        valid: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
      },
    ];
  }

  /**
   * Verifica si todos los requisitos se cumplen
   */
  allRequirementsMet(): boolean {
    return this.requirements.every((req) => req.valid);
  }
}

