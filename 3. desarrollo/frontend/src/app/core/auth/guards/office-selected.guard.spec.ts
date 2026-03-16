import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { OfficeSelectedGuard } from './office-selected.guard';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';
import { UserEntity, OfficeEntity } from 'app/modules/auth/domain/entities';

describe('OfficeSelectedGuard', () => {
  let guard: typeof OfficeSelectedGuard;
  let router: jasmine.SpyObj<Router>;
  let authFacade: jasmine.SpyObj<AuthFacade>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  const createMockUser = (needsOfficeSelection: boolean, hasOfficeId: boolean): UserEntity => {
    return new UserEntity(
      1,
      'uuid-123',
      'testuser',
      'Usuario de Prueba',
      'test@example.com',
      1,
      hasOfficeId ? 1 : null,
      1,
      'EMPLEADO',
      false,
      false,
      false,
      needsOfficeSelection
        ? [
            new OfficeEntity(1, 'OF1', 'Oficina 1', 'Dirección 1', true),
            new OfficeEntity(2, 'OF2', 'Oficina 2', 'Dirección 2', true),
          ]
        : []
    );
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', [], {
      user$: of(null),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthFacade, useValue: authFacadeSpy },
      ],
    });

    guard = OfficeSelectedGuard;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('debe redirigir a login cuando no hay usuario', async () => {
    // Arrange
    Object.defineProperty(authFacade, 'user$', {
      value: of(null),
      writable: true,
    });
    const urlTree = { toString: () => '/auth/login' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalledWith('/auth/login');
    expect(redirect).toBe(urlTree);
  });

  it('debe permitir acceso cuando el usuario no necesita seleccionar oficina', async () => {
    // Arrange
    const user = createMockUser(false, true);
    Object.defineProperty(authFacade, 'user$', {
      value: of(user),
      writable: true,
    });

    // Act
    const result = guard(route, state);

    // Assert
    const allowed = await firstValueFrom(result as any);
    expect(allowed).toBe(true);
  });

  it('debe permitir acceso cuando el usuario necesita seleccionar oficina pero ya la tiene seleccionada', async () => {
    // Arrange
    const user = createMockUser(true, true);
    Object.defineProperty(authFacade, 'user$', {
      value: of(user),
      writable: true,
    });

    // Act
    const result = guard(route, state);

    // Assert
    const allowed = await firstValueFrom(result as any);
    expect(allowed).toBe(true);
  });

  it('debe redirigir a selección de oficina cuando el usuario necesita seleccionar pero no la tiene', async () => {
    // Arrange
    const user = createMockUser(true, false);
    Object.defineProperty(authFacade, 'user$', {
      value: of(user),
      writable: true,
    });
    const urlTree = { toString: () => '/auth/select-office' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalledWith('/auth/select-office');
    expect(redirect).toBe(urlTree);
  });
});
