import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { Subscription } from 'rxjs';

/**
 * Componente para recuperación de contraseña
 * Permite solicitar un enlace de restablecimiento por email
 */
@Component({
  selector: 'auth-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class AuthForgotPasswordComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  forgotPasswordForm: FormGroup;
  isLoading = false;
  success = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFacade();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  private subscribeToFacade(): void {
    this.subscriptions.push(
      this.authFacade.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
        if (loading) {
          this.forgotPasswordForm.disable();
        } else {
          this.forgotPasswordForm.enable();
        }
      })
    );

    this.subscriptions.push(
      this.authFacade.error$.subscribe((error) => {
        this.error = error;
      })
    );
  }

  /**
   * Envía el enlace de recuperación de contraseña
   */
  async sendResetLink(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    try {
      const email = this.forgotPasswordForm.value.email;
      await this.authFacade.forgotPassword(email);

      // Siempre mostrar éxito (seguridad - no revelar si el email existe)
      this.success = true;
      this.error = null;

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } catch (error: any) {
      // El error ya está manejado por el facade
      // Pero igualmente mostramos el mensaje genérico de éxito por seguridad
      this.success = true;
      this.error = null;
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    }
  }

  /**
   * Navega de vuelta al login
   */
  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Marca todos los campos del formulario como touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (control?.hasError('required')) {
      return 'El correo electrónico es requerido';
    }
    if (control?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    return '';
  }
}
