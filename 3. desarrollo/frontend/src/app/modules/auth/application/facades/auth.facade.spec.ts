import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { AuthAdapter } from '../../infrastructure/adapters/auth.adapter';
import { TokenStorageService } from '../../infrastructure/services/token-storage.service';
import { LoginCredentials } from '../../domain/value-objects/login-credentials.vo';
import { UserEntity, OfficeEntity } from '../../domain/entities';
import { LoginResponse } from '../../domain/ports/auth.port';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let authAdapter: jasmine.SpyObj<AuthAdapter>;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser: UserEntity = new UserEntity(
    1,
    'uuid-123',
    'testuser',
    'Usuario de Prueba',
    'test@example.com',
    1,
    1,
    1,
    'EMPLEADO',
    false,
    false,
    false,
    []
  );

  const mockLoginResponse: LoginResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'Bearer',
    user: mockUser,
  };

  beforeEach(() => {
    const authAdapterSpy = jasmine.createSpyObj('AuthAdapter', [
      'login',
      'logout',
      'refreshToken',
      'forgotPassword',
      'resetPassword',
      'changePassword',
      'forceLogin',
      'selectOffice',
    ]);

    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'saveTokens',
      'getAccessToken',
      'getRefreshToken',
      'clearTokens',
      'saveRememberedUsername',
      'getRememberedUsername',
      'clearRememberedUsername',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthAdapter, useValue: authAdapterSpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    facade = TestBed.inject(AuthFacade);
    authAdapter = TestBed.inject(AuthAdapter) as jasmine.SpyObj<AuthAdapter>;
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('debe crearse correctamente', () => {
    expect(facade).toBeTruthy();
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente y guardar tokens', async () => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'password123',
        rememberMe: true,
      });
      authAdapter.login.and.returnValue(of(mockLoginResponse));
      tokenStorage.getRememberedUsername.and.returnValue(null);

      // Act
      await facade.login(credentials);

      // Assert
      expect(authAdapter.login).toHaveBeenCalledWith(credentials);
      expect(tokenStorage.saveTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
      expect(tokenStorage.saveRememberedUsername).toHaveBeenCalledWith('testuser');
      
      facade.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(true);
      });
    });

    it('debe manejar error de login e incrementar intentos fallidos', async () => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'wrongpassword',
      });
      const error = new Error('Credenciales inválidas');
      authAdapter.login.and.returnValue(throwError(() => error));

      // Act & Assert
      try {
        await facade.login(credentials);
        fail('Debería haber lanzado un error');
      } catch (e) {
        expect(e).toBe(error);
      }

      facade.failedAttempts$.subscribe((attempts) => {
        expect(attempts).toBe(1);
      });

      facade.remainingAttempts$.subscribe((remaining) => {
        expect(remaining).toBe(4); // 5 - 1
      });
    });

    it('debe mostrar captcha después de 3 intentos fallidos', async () => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'wrongpassword',
      });
      const error = new Error('Credenciales inválidas');
      authAdapter.login.and.returnValue(throwError(() => error));

      // Act - 3 intentos fallidos
      for (let i = 0; i < 3; i++) {
        try {
          await facade.login(credentials);
        } catch (e) {
          // Esperado
        }
      }

      // Assert
      facade.captchaRequired$.subscribe((required) => {
        expect(required).toBe(true);
      });
    });

    it('debe abrir modal de cambio de contraseña si es requerido', async () => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'password123',
      });
      const responseWithPasswordChange = {
        ...mockLoginResponse,
        requirePasswordChange: true,
      };
      authAdapter.login.and.returnValue(of(responseWithPasswordChange));

      // Act
      await facade.login(credentials);

      // Assert
      facade.requirePasswordChange$.subscribe((required) => {
        expect(required).toBe(true);
      });
    });

    it('debe redirigir a selección de oficina si el usuario la necesita', async () => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'password123',
      });
      const userWithMultipleOffices = new UserEntity(
        1,
        'uuid-123',
        'testuser',
        'Usuario de Prueba',
        'test@example.com',
        1,
        null, // Sin oficina seleccionada
        1,
        'EMPLEADO',
        false,
        false,
        false,
        [
          new OfficeEntity(1, 'OF1', 'Oficina 1', 'Dirección 1', true),
          new OfficeEntity(2, 'OF2', 'Oficina 2', 'Dirección 2', true),
        ]
      );
      const responseWithOffices = {
        ...mockLoginResponse,
        user: userWithMultipleOffices,
      };
      authAdapter.login.and.returnValue(of(responseWithOffices));

      // Act
      await facade.login(credentials);

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/auth/select-office']);
    });
  });

  describe('logout', () => {
    it('debe cerrar sesión y limpiar tokens', async () => {
      // Arrange
      authAdapter.logout.and.returnValue(of(undefined));

      // Act
      await facade.logout();

      // Assert
      expect(authAdapter.logout).toHaveBeenCalled();
      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);

      facade.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
      });
    });

    it('debe limpiar estado incluso si el logout falla', async () => {
      // Arrange
      authAdapter.logout.and.returnValue(throwError(() => new Error('Error de red')));

      // Act
      await facade.logout();

      // Assert
      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      facade.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
      });
    });
  });

  describe('forgotPassword', () => {
    it('debe solicitar recuperación de contraseña exitosamente', async () => {
      // Arrange
      const email = 'test@example.com';
      authAdapter.forgotPassword.and.returnValue(of(undefined));

      // Act
      await facade.forgotPassword(email);

      // Assert
      expect(authAdapter.forgotPassword).toHaveBeenCalledWith(email);
      facade.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
      });
    });

    it('debe manejar error en forgotPassword', async () => {
      // Arrange
      const email = 'test@example.com';
      const error = new Error('Error al solicitar recuperación');
      authAdapter.forgotPassword.and.returnValue(throwError(() => error));

      // Act & Assert
      try {
        await facade.forgotPassword(email);
        fail('Debería haber lanzado un error');
      } catch (e) {
        expect(e).toBe(error);
      }

      facade.error$.subscribe((err) => {
        expect(err).toBeTruthy();
      });
    });
  });

  describe('resetPassword', () => {
    it('debe restablecer contraseña exitosamente', async () => {
      // Arrange
      const token = 'reset-token';
      const password = 'newPassword123';
      authAdapter.resetPassword.and.returnValue(of(undefined));

      // Act
      await facade.resetPassword(token, password);

      // Assert
      expect(authAdapter.resetPassword).toHaveBeenCalledWith(token, password);
      facade.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
      });
    });
  });

  describe('changePassword', () => {
    it('debe cambiar contraseña exitosamente', async () => {
      // Arrange
      const currentPassword = 'oldPassword123';
      const newPassword = 'newPassword123';
      authAdapter.changePassword.and.returnValue(of(undefined));

      // Act
      await facade.changePassword(currentPassword, newPassword);

      // Assert
      expect(authAdapter.changePassword).toHaveBeenCalledWith(currentPassword, newPassword);
      facade.requirePasswordChange$.subscribe((required) => {
        expect(required).toBe(false);
      });
    });
  });

  describe('selectOffice', () => {
    it('debe seleccionar oficina exitosamente', async () => {
      // Arrange
      const officeId = 1;
      authAdapter.selectOffice.and.returnValue(of(undefined));
      
      // Primero necesitamos tener un usuario en el estado para que selectOffice funcione
      const mockUser = new UserEntity(
        1,
        'uuid-123',
        'testuser',
        'Usuario de Prueba',
        'test@example.com',
        1,
        null,
        1,
        'EMPLEADO',
        false,
        false,
        false,
        []
      );
      // Simular que hay un usuario autenticado
      (facade as any).updateState({ user: mockUser, isAuthenticated: true });

      // Act
      await facade.selectOffice(officeId);

      // Assert
      expect(authAdapter.selectOffice).toHaveBeenCalledWith(officeId);
      facade.isLoading$.subscribe((loading) => {
        expect(loading).toBe(false);
      });
    });
  });

  describe('clearError', () => {
    it('debe limpiar el error del estado', () => {
      // Act
      facade.clearError();

      // Assert
      facade.error$.subscribe((error) => {
        expect(error).toBeNull();
      });
    });
  });

  describe('resetFailedAttempts', () => {
    it('debe resetear los intentos fallidos', () => {
      // Act
      facade.resetFailedAttempts();

      // Assert
      facade.failedAttempts$.subscribe((attempts) => {
        expect(attempts).toBe(0);
      });
      facade.captchaRequired$.subscribe((required) => {
        expect(required).toBe(false);
      });
    });
  });

  describe('selectores', () => {
    it('debe emitir valores iniciales correctos', (done) => {
      // Assert
      facade.isAuthenticated$.subscribe((isAuth) => {
        expect(isAuth).toBe(false);
        done();
      });
    });

    it('debe emitir cambios de estado', (done) => {
      // Arrange
      const credentials = LoginCredentials.fromPlain({
        username: 'testuser',
        password: 'password123',
      });
      authAdapter.login.and.returnValue(of(mockLoginResponse));

      // Act
      facade.login(credentials).then(() => {
        facade.user$.subscribe((user) => {
          expect(user).toEqual(mockUser);
          done();
        });
      });
    });
  });
});

