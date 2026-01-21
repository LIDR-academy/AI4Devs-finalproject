import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { NoAuthGuard } from './noAuth.guard';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';

describe('NoAuthGuard', () => {
  let guard: typeof NoAuthGuard;
  let router: jasmine.SpyObj<Router>;
  let authFacade: jasmine.SpyObj<AuthFacade>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', [], {
      isAuthenticated$: of(false),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthFacade, useValue: authFacadeSpy },
      ],
    });

    guard = NoAuthGuard;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/auth/login' } as RouterStateSnapshot;
  });

  it('debe permitir acceso cuando el usuario no está autenticado', async () => {
    // Arrange
    Object.defineProperty(authFacade, 'isAuthenticated$', {
      value: of(false),
      writable: true,
    });

    // Act
    const result = guard(route, state);

    // Assert
    const allowed = await firstValueFrom(result as any);
    expect(allowed).toBe(true);
  });

  it('debe redirigir al dashboard cuando el usuario está autenticado', async () => {
    // Arrange
    Object.defineProperty(authFacade, 'isAuthenticated$', {
      value: of(true),
      writable: true,
    });
    const urlTree = { toString: () => '/signed-in-redirect' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalledWith('/signed-in-redirect');
    expect(redirect).toBe(urlTree);
  });
});
