import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { PasswordStrengthComponent, PasswordRequirementsComponent } from '../../components';
import { Subscription } from 'rxjs';

/**
 * Componente para restablecer contraseña con token
 * Se accede mediante un enlace con token único
 */
@Component({
  selector: 'auth-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
    PasswordStrengthComponent,
    PasswordRequirementsComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class AuthResetPasswordComponent implements OnInit {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  error: string | null = null;
  success = false;
  token: string | null = null;
  tokenValid = true;

  ngOnInit(): void {
    // Obtener token de la ruta
    this.token = this.route.snapshot.paramMap.get('token');
    
    if (!this.token) {
      this.tokenValid = false;
      this.error = 'El enlace ha expirado o es inválido';
    }

    this.initializeForm();
    this.subscribeToFacade();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirm: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private subscribeToFacade(): void {
    this.subscriptions.push(
      this.authFacade.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
        if (loading) {
          this.resetPasswordForm.disable();
        } else {
          this.resetPasswordForm.enable();
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
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (!password || !passwordConfirm) {
      return null;
    }

    if (password.value !== passwordConfirm.value) {
      passwordConfirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      passwordConfirm.setErrors(null);
      return null;
    }
  }

  /**
   * Restablece la contraseña
   */
  async resetPassword(): Promise<void> {
    if (this.resetPasswordForm.invalid || !this.token) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    try {
      const password = this.resetPasswordForm.value.password;
      await this.authFacade.resetPassword(this.token, password);

      this.success = true;
      this.error = null;

      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    } catch (error: any) {
      // El error ya está manejado por el facade
      if (error.message?.includes('expirado') || error.message?.includes('inválido')) {
        this.tokenValid = false;
      }
    }
  }

  /**
   * Navega a solicitar nuevo enlace
   */
  requestNewLink(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
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
    const control = this.resetPasswordForm.get(controlName);
    if (control?.hasError('required')) {
      return controlName === 'password'
        ? 'La nueva contraseña es requerida'
        : 'Confirme la nueva contraseña';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
