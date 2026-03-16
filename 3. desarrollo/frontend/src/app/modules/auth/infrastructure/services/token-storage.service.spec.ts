import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('saveTokens', () => {
    it('debe guardar tokens en localStorage', () => {
      // Act
      service.saveTokens('access-token', 'refresh-token');

      // Assert
      expect(localStorage.getItem('accessToken')).toBe('access-token');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
    });
  });

  describe('getAccessToken', () => {
    it('debe retornar el token de acceso guardado', () => {
      // Arrange
      localStorage.setItem('accessToken', 'test-access-token');

      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBe('test-access-token');
    });

    it('debe retornar null si no hay token guardado', () => {
      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('debe retornar el refresh token guardado', () => {
      // Arrange
      localStorage.setItem('refreshToken', 'test-refresh-token');

      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBe('test-refresh-token');
    });

    it('debe retornar null si no hay token guardado', () => {
      // Act
      const token = service.getRefreshToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('debe limpiar todos los tokens', () => {
      // Arrange
      service.saveTokens('access-token', 'refresh-token');

      // Act
      service.clearTokens();

      // Assert
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('saveRememberedUsername', () => {
    it('debe guardar el nombre de usuario recordado', () => {
      // Act
      service.saveRememberedUsername('testuser');

      // Assert
      expect(localStorage.getItem('rememberedUsername')).toBe('testuser');
    });
  });

  describe('getRememberedUsername', () => {
    it('debe retornar el nombre de usuario recordado', () => {
      // Arrange
      localStorage.setItem('rememberedUsername', 'testuser');

      // Act
      const username = service.getRememberedUsername();

      // Assert
      expect(username).toBe('testuser');
    });

    it('debe retornar null si no hay username guardado', () => {
      // Act
      const username = service.getRememberedUsername();

      // Assert
      expect(username).toBeNull();
    });
  });

  describe('clearRememberedUsername', () => {
    it('debe limpiar el nombre de usuario recordado', () => {
      // Arrange
      service.saveRememberedUsername('testuser');

      // Act
      service.clearRememberedUsername();

      // Assert
      expect(localStorage.getItem('rememberedUsername')).toBeNull();
    });
  });

  describe('hasTokens', () => {
    it('debe retornar true si hay ambos tokens', () => {
      // Arrange
      service.saveTokens('access-token', 'refresh-token');

      // Act
      const hasTokens = service.hasTokens();

      // Assert
      expect(hasTokens).toBe(true);
    });

    it('debe retornar false si falta algún token', () => {
      // Arrange
      localStorage.setItem('accessToken', 'access-token');
      // No hay refreshToken

      // Act
      const hasTokens = service.hasTokens();

      // Assert
      expect(hasTokens).toBe(false);
    });

    it('debe retornar false si no hay tokens', () => {
      // Act
      const hasTokens = service.hasTokens();

      // Assert
      expect(hasTokens).toBe(false);
    });
  });
});

