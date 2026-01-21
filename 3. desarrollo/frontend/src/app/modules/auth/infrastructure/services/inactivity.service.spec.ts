import { TestBed } from '@angular/core/testing';
import { InactivityService } from './inactivity.service';

describe('InactivityService', () => {
  let service: InactivityService;

  beforeEach(() => {
    // NgZone se proporciona automáticamente por Angular en los tests
    TestBed.configureTestingModule({});
    service = TestBed.inject(InactivityService);
  });

  afterEach(() => {
    service.stopTracking();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('startTracking', () => {
    it('debe iniciar el rastreo de inactividad', () => {
      // Act
      service.startTracking(1000); // 1 segundo para tests

      // Assert
      expect(service.isActive()).toBe(true);
    });

    it('debe detener el tracking anterior si ya está activo', () => {
      // Arrange
      service.startTracking(1000);
      const firstTimeout = (service as any).timeoutId;

      // Act
      service.startTracking(2000);
      const secondTimeout = (service as any).timeoutId;

      // Assert
      expect(secondTimeout).not.toBe(firstTimeout);
    });
  });

  describe('stopTracking', () => {
    it('debe detener el rastreo de inactividad', () => {
      // Arrange
      service.startTracking(1000);

      // Act
      service.stopTracking();

      // Assert
      expect(service.isActive()).toBe(false);
    });
  });

  describe('resetTimer', () => {
    it('debe resetear el timer de inactividad', (done) => {
      // Arrange
      let timeoutCalled = false;
      service.startTracking(100);
      
      service.onTimeout$.subscribe(() => {
        timeoutCalled = true;
      });

      // Act - resetear antes de que expire
      setTimeout(() => {
        service.resetTimer(200);
        
        // Esperar más tiempo para verificar que el nuevo timer funciona
        setTimeout(() => {
          expect(timeoutCalled).toBe(false); // No debería haberse llamado aún
          service.stopTracking();
          done();
        }, 150);
      }, 50);
    });
  });

  describe('onTimeout$', () => {
    it('debe emitir cuando se detecta inactividad', (done) => {
      // Arrange
      service.startTracking(100); // 100ms para tests rápidos

      // Act & Assert
      service.onTimeout$.subscribe(() => {
        expect(true).toBe(true);
        service.stopTracking();
        done();
      });
    }, 200); // Timeout de 200ms para el test
  });

  describe('isActive', () => {
    it('debe retornar false cuando no está rastreando', () => {
      // Assert
      expect(service.isActive()).toBe(false);
    });

    it('debe retornar true cuando está rastreando', () => {
      // Arrange
      service.startTracking(1000);

      // Assert
      expect(service.isActive()).toBe(true);
      
      // Cleanup
      service.stopTracking();
    });
  });
});
