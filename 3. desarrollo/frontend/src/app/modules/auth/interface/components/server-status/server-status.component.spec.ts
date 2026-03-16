import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ServerStatusIndicatorComponent } from './server-status.component';
import { AuthFacade } from '../../../application/facades/auth.facade';

// Importar of de rxjs

describe('ServerStatusIndicatorComponent', () => {
  let component: ServerStatusIndicatorComponent;
  let fixture: ComponentFixture<ServerStatusIndicatorComponent>;
  let authFacade: jasmine.SpyObj<AuthFacade>;

  beforeEach(async () => {
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', ['checkServerStatus']);

    await TestBed.configureTestingModule({
      imports: [ServerStatusIndicatorComponent],
      providers: [{ provide: AuthFacade, useValue: authFacadeSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerStatusIndicatorComponent);
    component = fixture.componentInstance;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    
    // Configurar serverOnline$ como observable
    Object.defineProperty(authFacade, 'serverOnline$', {
      value: of(true),
      writable: true,
      configurable: true,
    });
    
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe verificar estado del servidor al inicializar', () => {
    // Act
    component.ngOnInit();
    
    // Assert
    expect(authFacade.checkServerStatus).toHaveBeenCalled();
  });

  it('debe mostrar estado online cuando el servidor está en línea', (done) => {
    // Arrange
    Object.defineProperty(authFacade, 'serverOnline$', {
      value: of(true),
      writable: true,
      configurable: true,
    });

    // Act
    component.ngOnInit();
    fixture.detectChanges();

    // Assert - verificar que el componente actualizó su estado
    setTimeout(() => {
      expect(component.statusIcon).toBe('cloud_done');
      expect(component.statusClass).toBe('status-online');
      expect(component.tooltipText).toBe('Servidor en línea');
      done();
    }, 100);
  });

  it('debe mostrar estado offline cuando el servidor está desconectado', (done) => {
    // Arrange
    Object.defineProperty(authFacade, 'serverOnline$', {
      value: of(false),
      writable: true,
      configurable: true,
    });

    // Act
    component.ngOnInit();
    fixture.detectChanges();

    // Assert - verificar que el componente actualizó su estado
    setTimeout(() => {
      expect(component.statusIcon).toBe('cloud_off');
      expect(component.statusClass).toBe('status-offline');
      expect(component.tooltipText).toBe('Sin conexión al servidor');
      done();
    }, 100);
  });

  it('debe limpiar suscripciones al destruirse', () => {
    // Arrange
    component.ngOnInit();
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    (component as any).statusSubscription = { unsubscribe: unsubscribeSpy };
    (component as any).pollingSubscription = { unsubscribe: unsubscribeSpy };

    // Act
    component.ngOnDestroy();

    // Assert
    expect(unsubscribeSpy).toHaveBeenCalledTimes(2);
  });
});
