import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { LoginCredentials } from '../../../domain/value-objects/login-credentials.vo';
import { InactivityService } from '../../../infrastructure/services/inactivity.service';
import { TelemetryService } from '../../../infrastructure/services/telemetry.service';
import { TokenStorageService } from '../../../infrastructure/services/token-storage.service';
import {
  ServerStatusIndicatorComponent,
  CaptchaComponent,
} from '../../components';
import { ChangePasswordModalComponent } from '../change-password-modal/change-password-modal.component';
import { SessionConflictDialogComponent } from '../session-conflict-dialog/session-conflict-dialog.component';
import { GeneralConstant } from 'app/common/config/constant/general.constant';

/**
 * Componente de login mejorado con todas las funcionalidades
 * - Split-screen layout
 * - Integración con AuthFacade
 * - Captcha después de intentos fallidos
 * - Inactividad timeout
 * - Telemetría
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ServerStatusIndicatorComponent,
    CaptchaComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly inactivityService = inject(InactivityService);
  private readonly telemetryService = inject(TelemetryService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly generalConstant = GeneralConstant;
  readonly year = new Date().getFullYear();

  loginForm: FormGroup;
  showPassword = false;
  subscriptions: Subscription[] = [];

  // Estado del facade
  isLoading = false;
  error: string | null = null;
  failedAttempts = 0;
  remainingAttempts: number | null = null;
  captchaRequired = false;
  requirePasswordChange = false;
  captchaToken: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadRememberedUsername();
    this.subscribeToFacade();
    this.startInactivityTracking();
    this.startTelemetry();
    this.checkServerStatus();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.inactivityService.stopTracking();
    this.telemetryService.stopScreenTimer();
  }

  /**
   * Inicializa el formulario de login
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
      captchaToken: [''],
    });
  }

  /**
   * Carga el nombre de usuario recordado si existe
   */
  private loadRememberedUsername(): void {
    const rememberedUsername = this.tokenStorage.getRememberedUsername();
    if (rememberedUsername) {
      this.loginForm.patchValue({ username: rememberedUsername, rememberMe: true });
    }
  }

  /**
   * Se suscribe a los observables del facade
   */
  private subscribeToFacade(): void {
    this.subscriptions.push(
      this.authFacade.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
        if (loading) {
          this.loginForm.disable();
        } else {
          this.loginForm.enable();
        }
      })
    );

    this.subscriptions.push(
      this.authFacade.error$.subscribe((error) => {
        this.error = error;
      })
    );

    this.subscriptions.push(
      this.authFacade.failedAttempts$.subscribe((attempts) => {
        this.failedAttempts = attempts;
      })
    );

    this.subscriptions.push(
      this.authFacade.remainingAttempts$.subscribe((remaining) => {
        this.remainingAttempts = remaining;
      })
    );

    this.subscriptions.push(
      this.authFacade.captchaRequired$.subscribe((required) => {
        this.captchaRequired = required;
        if (required && !this.loginForm.get('captchaToken')?.value) {
          this.loginForm.get('captchaToken')?.setValidators([Validators.required]);
        } else {
          this.loginForm.get('captchaToken')?.clearValidators();
        }
        this.loginForm.get('captchaToken')?.updateValueAndValidity();
      })
    );

    this.subscriptions.push(
      this.authFacade.requirePasswordChange$.subscribe((required) => {
        this.requirePasswordChange = required;
        if (required) {
          this.openChangePasswordModal();
        }
      })
    );
  }

  /**
   * Inicia el rastreo de inactividad
   */
  private startInactivityTracking(): void {
    this.inactivityService.startTracking(300000); // 5 minutos
    this.subscriptions.push(
      this.inactivityService.onTimeout$.subscribe(() => {
        this.handleInactivityTimeout();
      })
    );
  }

  /**
   * Inicia la telemetría
   */
  private startTelemetry(): void {
    this.telemetryService.startScreenTimer('Login');
  }

  /**
   * Verifica el estado del servidor
   */
  private checkServerStatus(): void {
    this.authFacade.checkServerStatus();
  }

  /**
   * Maneja el timeout de inactividad
   */
  private handleInactivityTimeout(): void {
    this.loginForm.reset();
    this.authFacade.clearError();
    this.authFacade.resetFailedAttempts();
    // Mostrar mensaje de inactividad (opcional)
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Maneja la resolución del captcha
   */
  onCaptchaResolved(token: string): void {
    this.captchaToken = token;
    this.loginForm.patchValue({ captchaToken: token });
  }

  /**
   * Maneja el envío del formulario
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    try {
      const credentials = LoginCredentials.fromPlain({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe,
        captchaToken: this.captchaToken || undefined,
      });

      await this.authFacade.login(credentials);

      // Si llegamos aquí, el login fue exitoso
      // El facade maneja la redirección
    } catch (error: any) {
      // El error ya está manejado por el facade
      // Si hay sesión activa, mostrar diálogo
      if (error?.code === 'ALREADY_LOGGED_IN') {
        this.openSessionConflictDialog(error.activeSession);
      }
    }
  }

  /**
   * Abre el modal de cambio de contraseña
   */
  private openChangePasswordModal(): void {
    const dialogRef = this.dialog.open(ChangePasswordModalComponent, {
      width: '500px',
      disableClose: true, // No se puede cerrar sin cambiar la contraseña
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // El cambio de contraseña fue exitoso
        // El facade ya maneja la redirección
      }
    });
  }

  /**
   * Abre el diálogo de conflicto de sesión
   */
  private openSessionConflictDialog(activeSession: any): void {
    const dialogRef = this.dialog.open(SessionConflictDialogComponent, {
      width: '500px',
      data: { activeSession },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.forceLogin) {
        // Forzar login cerrando otra sesión
        const credentials = LoginCredentials.fromPlain({
          username: this.loginForm.value.username,
          password: this.loginForm.value.password,
          rememberMe: this.loginForm.value.rememberMe,
        });
        this.authFacade.forceLogin(credentials);
      }
    });
  }

  /**
   * Navega a la página de recuperación de contraseña
   */
  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return controlName === 'username'
        ? 'El nombre de usuario es requerido'
        : 'La contraseña es requerida';
    }
    if (control?.hasError('minlength')) {
      return controlName === 'username'
        ? 'El nombre de usuario debe tener al menos 3 caracteres'
        : 'La contraseña debe tener al menos 8 caracteres';
    }
    if (control?.hasError('maxlength')) {
      return 'El nombre de usuario no puede exceder 50 caracteres';
    }
    return '';
  }
}

