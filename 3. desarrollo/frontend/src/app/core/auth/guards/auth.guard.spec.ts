import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';
import { TokenStorageService } from 'app/modules/auth/infrastructure/services/token-storage.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

describe('AuthGuard', () => {
  let guard: typeof AuthGuard;
  let router: jasmine.SpyObj<Router>;
  let authFacade: jasmine.SpyObj<AuthFacade>;
  let tokenStorage: jasmine.SpyObj<TokenStorageService>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', [], {
      isAuthenticated$: of(true),
    });
    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', ['getAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: TokenStorageService, useValue: tokenStorageSpy },
      ],
    });

    guard = AuthGuard;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    tokenStorage = TestBed.inject(TokenStorageService) as jasmine.SpyObj<TokenStorageService>;
    route = {} as ActivatedRouteSnapshot;
    state = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('debe permitir acceso cuando hay token válido y usuario autenticado', async () => {
    // Arrange
    const validToken = 'valid.jwt.token';
    tokenStorage.getAccessToken.and.returnValue(validToken);
    spyOn(AuthUtils, 'isTokenExpired').and.returnValue(false);
    Object.defineProperty(authFacade, 'isAuthenticated$', {
      value: of(true),
      writable: true,
    });
    router.parseUrl.and.returnValue({} as any);

    // Act
    const result = guard(route, state);

    // Assert
    const allowed = await firstValueFrom(result as any);
    expect(allowed).toBe(true);
  });

  it('debe redirigir a login cuando no hay token', async () => {
    // Arrange
    tokenStorage.getAccessToken.and.returnValue(null);
    const urlTree = { toString: () => '/auth/login' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalledWith('/auth/login?redirectURL=/dashboard');
    expect(redirect).toBe(urlTree);
  });

  it('debe redirigir a login cuando el token ha expirado', async () => {
    // Arrange
    const expiredToken = 'expired.jwt.token';
    tokenStorage.getAccessToken.and.returnValue(expiredToken);
    spyOn(AuthUtils, 'isTokenExpired').and.returnValue(true);
    const urlTree = { toString: () => '/auth/login' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalled();
    expect(redirect).toBe(urlTree);
  });

  it('debe redirigir a login cuando el usuario no está autenticado', async () => {
    // Arrange
    const validToken = 'valid.jwt.token';
    tokenStorage.getAccessToken.and.returnValue(validToken);
    spyOn(AuthUtils, 'isTokenExpired').and.returnValue(false);
    Object.defineProperty(authFacade, 'isAuthenticated$', {
      value: of(false),
      writable: true,
    });
    const urlTree = { toString: () => '/auth/login' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, state);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalled();
    expect(redirect).toBe(urlTree);
  });

  it('no debe agregar redirectURL para ruta sign-out', async () => {
    // Arrange
    tokenStorage.getAccessToken.and.returnValue(null);
    const signOutState = { url: '/sign-out' } as RouterStateSnapshot;
    const urlTree = { toString: () => '/auth/login' } as any;
    router.parseUrl.and.returnValue(urlTree);

    // Act
    const result = guard(route, signOutState);

    // Assert
    const redirect = await firstValueFrom(result as any);
    expect(router.parseUrl).toHaveBeenCalledWith('/auth/login?');
  });
});
