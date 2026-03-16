import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { PasswordStrengthComponent, PasswordRequirementsComponent } from '../../components';

/**
 * Modal para cambio de contraseña obligatorio
 * No se puede cerrar sin cambiar la contraseña
 */
@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PasswordStrengthComponent,
    PasswordRequirementsComponent,
  ],
  template: `
    <div class="change-password-modal">
      <h2 mat-dialog-title>Cambiar Contraseña</h2>
      
      <mat-dialog-content>
        <p class="mb-4 text-gray-600 dark:text-gray-400">
          Por seguridad, debe cambiar su contraseña antes de continuar.
        </p>

        <form [formGroup]="changePasswordForm" class="space-y-4">
          <!-- Current password -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Contraseña actual</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              [type]="showCurrentPassword ? 'text' : 'password'"
              formControlName="currentPassword"
              autocomplete="current-password"
            />
            <button
              mat-icon-button
              type="button"
              matSuffix
              (click)="showCurrentPassword = !showCurrentPassword"
            >
              <mat-icon>{{ showCurrentPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            @if (changePasswordForm.get('currentPassword')?.hasError('required') && changePasswordForm.get('currentPassword')?.touched) {
              <mat-error>La contraseña actual es requerida</mat-error>
            }
          </mat-form-field>

          <!-- New password -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Nueva contraseña</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input
              matInput
              [type]="showNewPassword ? 'text' : 'password'"
              formControlName="newPassword"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              type="button"
              matSuffix
              (click)="showNewPassword = !showNewPassword"
            >
              <mat-icon>{{ showNewPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            @if (changePasswordForm.get('newPassword')?.hasError('required') && changePasswordForm.get('newPassword')?.touched) {
              <mat-error>La nueva contraseña es requerida</mat-error>
            }
          </mat-form-field>

          <!-- Password strength indicator -->
          @if (changePasswordForm.get('newPassword')?.value) {
            <app-password-strength [password]="changePasswordForm.get('newPassword')?.value"></app-password-strength>
            <app-password-requirements
              [password]="changePasswordForm.get('newPassword')?.value"
              [minLength]="8"
            ></app-password-requirements>
          }

          <!-- Confirm password -->
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirmar contraseña</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input
              matInput
              [type]="showConfirmPassword ? 'text' : 'password'"
              formControlName="confirmPassword"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              type="button"
              matSuffix
              (click)="showConfirmPassword = !showConfirmPassword"
            >
              <mat-icon>{{ showConfirmPassword ? 'visibility' : 'visibility_off' }}</mat-icon>
            </button>
            @if (changePasswordForm.get('confirmPassword')?.hasError('required') && changePasswordForm.get('confirmPassword')?.touched) {
              <mat-error>Confirme la nueva contraseña</mat-error>
            }
            @if (changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch') && changePasswordForm.get('confirmPassword')?.touched) {
              <mat-error>Las contraseñas no coinciden</mat-error>
            }
          </mat-form-field>

          <!-- Error message -->
          @if (error) {
            <div class="error-message flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-4">
              <mat-icon>error</mat-icon>
              <span>{{ error }}</span>
            </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="px-6 pb-4">
        <button
          mat-raised-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="isLoading || changePasswordForm.invalid"
        >
          @if (isLoading) {
            <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
            <span>Cambiando...</span>
          } @else {
            <span>Cambiar Contraseña</span>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .change-password-modal {
      min-width: 500px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `],
})
export class ChangePasswordModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<ChangePasswordModalComponent>);
  private readonly authFacade = inject(AuthFacade);
  private readonly formBuilder = inject(FormBuilder);

  changePasswordForm: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToLoading();
  }

  private initializeForm(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private subscribeToLoading(): void {
    this.authFacade.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
      if (loading) {
        this.changePasswordForm.disable();
      } else {
        this.changePasswordForm.enable();
      }
    });

    this.authFacade.error$.subscribe((error) => {
      this.error = error;
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      return;
    }

    try {
      const currentPassword = this.changePasswordForm.value.currentPassword;
      const newPassword = this.changePasswordForm.value.newPassword;

      await this.authFacade.changePassword(currentPassword, newPassword);

      // Cerrar modal con éxito
      this.dialogRef.close({ success: true });
    } catch (error: any) {
      // El error ya está manejado por el facade
      this.error = error.message || 'Error al cambiar la contraseña';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

