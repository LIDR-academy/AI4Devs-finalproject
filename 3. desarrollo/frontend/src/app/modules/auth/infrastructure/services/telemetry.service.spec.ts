import { TestBed } from '@angular/core/testing';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TelemetryService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('startScreenTimer', () => {
    it('debe iniciar el timer para una pantalla', () => {
      // Act
      service.startScreenTimer('Login');

      // Assert
      expect(service.isTracking()).toBe(true);
      expect(service.getCurrentScreenName()).toBe('Login');
    });
  });

  describe('stopScreenTimer', () => {
    it('debe detener el timer y retornar el tiempo transcurrido', (done) => {
      // Arrange
      service.startScreenTimer('Login');
      
      setTimeout(() => {
        // Act
        const timeOnScreen = service.stopScreenTimer();

        // Assert
        expect(timeOnScreen).toBeGreaterThan(0);
        expect(service.isTracking()).toBe(false);
        expect(service.getCurrentScreenName()).toBeNull();
        done();
      }, 100);
    });

    it('debe retornar 0 si no hay timer activo', () => {
      // Act
      const timeOnScreen = service.stopScreenTimer();

      // Assert
      expect(timeOnScreen).toBe(0);
    });
  });

  describe('getTimeOnScreen', () => {
    it('debe retornar el tiempo transcurrido sin detener el timer', (done) => {
      // Arrange
      service.startScreenTimer('Login');

      setTimeout(() => {
        // Act
        const timeOnScreen = service.getTimeOnScreen();

        // Assert
        expect(timeOnScreen).toBeGreaterThan(0);
        expect(service.isTracking()).toBe(true); // Debe seguir activo
        done();
      }, 100);
    });

    it('debe retornar 0 si no hay timer activo', () => {
      // Act
      const timeOnScreen = service.getTimeOnScreen();

      // Assert
      expect(timeOnScreen).toBe(0);
    });
  });

  describe('getCurrentScreenName', () => {
    it('debe retornar el nombre de la pantalla actual', () => {
      // Arrange
      service.startScreenTimer('Login');

      // Act
      const screenName = service.getCurrentScreenName();

      // Assert
      expect(screenName).toBe('Login');
    });

    it('debe retornar null si no hay timer activo', () => {
      // Act
      const screenName = service.getCurrentScreenName();

      // Assert
      expect(screenName).toBeNull();
    });
  });

  describe('isTracking', () => {
    it('debe retornar false cuando no hay timer activo', () => {
      // Assert
      expect(service.isTracking()).toBe(false);
    });

    it('debe retornar true cuando hay timer activo', () => {
      // Arrange
      service.startScreenTimer('Login');

      // Assert
      expect(service.isTracking()).toBe(true);
    });
  });
});

