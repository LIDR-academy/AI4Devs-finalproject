import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { InactivityService } from '../../../infrastructure/services/inactivity.service';
import { TelemetryService } from '../../../infrastructure/services/telemetry.service';
import { TokenStorageService } from '../../../infrastructure/services/token-storage.service';
import { LoginCredentials } from '../../../domain/value-objects/login-credentials.vo';
import { UserEntity } from '../../../domain/entities';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authFacade: jasmine.SpyObj<AuthFacade>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let inactivityService: jasmine.SpyObj<InactivityService>;
  let telemetryService: jasmine.SpyObj<TelemetryService>;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;

  beforeEach(async () => {
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', [
      'login',
      'checkServerStatus',
      'clearError',
      'resetFailedAttempts',
    ], {
      isLoading$: of(false),
      error$: of(null),
      failedAttempts$: of(0),
      remainingAttempts$: of(null),
      captchaRequired$: of(false),
      requirePasswordChange$: of(false),
      serverOnline$: of(true),
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const inactivitySpy = jasmine.createSpyObj('InactivityService', ['startTracking', 'stopTracking'], {
      onTimeout$: of(undefined),
    });
    const telemetrySpy = jasmine.createSpyObj('TelemetryService', ['startScreenTimer', 'stopScreenTimer']);
    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', ['getRememberedUsername']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: InactivityService, useValue: inactivitySpy },
        { provide: TelemetryService, useValue: telemetrySpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    inactivityService = TestBed.inject(InactivityService) as jasmine.SpyObj<InactivityService>;
    telemetryService = TestBed.inject(TelemetryService) as jasmine.SpyObj<TelemetryService>;
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
    
    // NO llamar detectChanges aquí para que ngOnInit no se ejecute automáticamente
    // Esto permite que los tests configuren los mocks antes de llamar ngOnInit
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe inicializar el formulario correctamente', () => {
      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.loginForm).toBeTruthy();
      expect(component.loginForm.get('username')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
      expect(component.loginForm.get('rememberMe')).toBeTruthy();
    });

    it('debe cargar el nombre de usuario recordado si existe', () => {
      // Arrange - Configurar el mock ANTES de llamar ngOnInit
      // El componente se crea en beforeEach pero ngOnInit NO se llama automáticamente
      tokenStorage.getRememberedUsername.and.returnValue('remembereduser');
      Object.defineProperty(authFacade, 'serverOnline$', {
        value: of(true),
        writable: true,
        configurable: true,
      });
      
      // Act - Llamar ngOnInit con el mock configurado
      // ngOnInit llama a initializeForm() primero, luego loadRememberedUsername()
      component.ngOnInit();
      fixture.detectChanges();

      // Assert - Verificar que se llamó al método y que el formulario tiene los valores
      expect(tokenStorage.getRememberedUsername).toHaveBeenCalled();
      expect(component.loginForm).toBeTruthy();
      // El formulario debería tener el username recordado después de ngOnInit
      expect(component.loginForm.get('username')?.value).toBe('remembereduser');
      expect(component.loginForm.get('rememberMe')?.value).toBe(true);
    });

    it('debe iniciar el rastreo de inactividad', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(inactivityService.startTracking).toHaveBeenCalledWith(300000);
    });

    it('debe iniciar la telemetría', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(telemetryService.startScreenTimer).toHaveBeenCalledWith('Login');
    });

    it('debe verificar el estado del servidor', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(authFacade.checkServerStatus).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('debe detener el rastreo de inactividad', () => {
      // Arrange
      component.ngOnInit();

      // Act
      component.ngOnDestroy();

      // Assert
      expect(inactivityService.stopTracking).toHaveBeenCalled();
    });

    it('debe detener la telemetría', () => {
      // Arrange
      component.ngOnInit();

      // Act
      component.ngOnDestroy();

      // Assert
      expect(telemetryService.stopScreenTimer).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('debe llamar a authFacade.login con credenciales válidas', async () => {
      // Arrange
      component.ngOnInit();
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123',
        rememberMe: false,
      });
      authFacade.login.and.returnValue(Promise.resolve());

      // Act
      await component.onSubmit();

      // Assert
      expect(authFacade.login).toHaveBeenCalled();
      const callArgs = authFacade.login.calls.mostRecent().args[0];
      expect(callArgs).toBeInstanceOf(LoginCredentials);
    });

    it('no debe enviar el formulario si es inválido', async () => {
      // Arrange
      component.ngOnInit();
      component.loginForm.patchValue({
        username: '', // Inválido
        password: '',
      });

      // Act
      await component.onSubmit();

      // Assert
      expect(authFacade.login).not.toHaveBeenCalled();
    });

    it('debe manejar errores de login', async () => {
      // Arrange
      component.ngOnInit();
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpassword',
      });
      const mockSession = {
        id: 'session-id',
        device: 'Test Device',
        ip: '192.168.1.1',
        lastActivity: new Date(),
        current: false,
      };
      const error = { code: 'ALREADY_LOGGED_IN', activeSession: mockSession };
      authFacade.login.and.returnValue(Promise.reject(error));
      const mockDialogRef = {
        afterClosed: jasmine.createSpy('afterClosed').and.returnValue(of('cancel')),
      };
      dialog.open.and.returnValue(mockDialogRef as any);

      // Act
      await component.onSubmit();

      // Assert
      expect(authFacade.login).toHaveBeenCalled();
      // El componente debe manejar el error sin lanzar excepción
    });
  });

  describe('togglePasswordVisibility', () => {
    it('debe alternar la visibilidad de la contraseña', () => {
      // Arrange
      component.showPassword = false;

      // Act
      component.togglePasswordVisibility();

      // Assert
      expect(component.showPassword).toBe(true);

      // Act
      component.togglePasswordVisibility();

      // Assert
      expect(component.showPassword).toBe(false);
    });
  });

  describe('onCaptchaResolved', () => {
    it('debe guardar el token del captcha', () => {
      // Arrange
      component.ngOnInit();
      const captchaToken = 'captcha-token-123';

      // Act
      component.onCaptchaResolved(captchaToken);

      // Assert
      expect(component.captchaToken).toBe(captchaToken);
      expect(component.loginForm.get('captchaToken')?.value).toBe(captchaToken);
    });
  });

  describe('onForgotPassword', () => {
    it('debe navegar a la página de recuperación de contraseña', () => {
      // Act
      component.onForgotPassword();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/auth/forgot-password']);
    });
  });

  describe('getErrorMessage', () => {
    it('debe retornar mensaje de error para campo requerido', () => {
      // Arrange
      component.ngOnInit();
      component.loginForm.get('username')?.markAsTouched();
      component.loginForm.get('username')?.setErrors({ required: true });

      // Act
      const error = component.getErrorMessage('username');

      // Assert
      expect(error).toBe('El nombre de usuario es requerido');
    });

    it('debe retornar mensaje de error para longitud mínima', () => {
      // Arrange
      component.ngOnInit();
      component.loginForm.get('username')?.markAsTouched();
      component.loginForm.get('username')?.setErrors({ minlength: true });

      // Act
      const error = component.getErrorMessage('username');

      // Assert
      expect(error).toBe('El nombre de usuario debe tener al menos 3 caracteres');
    });
  });
});

