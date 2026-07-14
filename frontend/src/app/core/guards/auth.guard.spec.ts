import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const routeSnapshot = {} as ActivatedRouteSnapshot;
  const stateSnapshot = { url: '/mi-cuenta' } as RouterStateSnapshot;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard(routeSnapshot, stateSnapshot));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
  });

  afterEach(() => localStorage.clear());

  it('redirects to /login with returnUrl when not authenticated', () => {
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    const urlTree = result as UrlTree;
    expect(urlTree.toString()).toContain('/login');
    expect(urlTree.queryParams['returnUrl']).toBe('/mi-cuenta');
  });

  it('allows navigation when authenticated', () => {
    localStorage.setItem('inklink_token', 'valid-token');
    localStorage.setItem(
      'inklink_token_expires',
      new Date(Date.now() + 60_000).toISOString()
    );
    localStorage.setItem(
      'inklink_user',
      JSON.stringify({ id: '1', email: 'a@a.cl', firstName: 'A', lastName: 'B', role: 'client', avatarUrl: null, artistProfileId: null })
    );
    // AuthService restores the session from localStorage on creation
    TestBed.inject(AuthService);

    expect(runGuard()).toBeTrue();
  });
});
