import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../models/auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const loginResponse: LoginResponse = {
    token: 'fake-jwt-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: '1',
      email: 'camila.rojas@example.cl',
      firstName: 'Camila',
      lastName: 'Rojas',
      role: 'client',
      avatarUrl: null,
      artistProfileId: null
    }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('login stores token and exposes the authenticated user', () => {
    service.login('camila.rojas@example.cl', 'Test1234!').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    // The password is sent but never stored anywhere
    req.flush(loginResponse);

    expect(service.getToken()).toBe('fake-jwt-token');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('camila.rojas@example.cl');
    expect(localStorage.getItem('inklink_user')).not.toContain('Test1234!');
  });

  it('logout clears the session', () => {
    service.login('camila.rojas@example.cl', 'Test1234!').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(loginResponse);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('inklink_token')).toBeNull();
  });

  it('expired tokens are not returned', () => {
    localStorage.setItem('inklink_token', 'stale-token');
    localStorage.setItem('inklink_token_expires', new Date(Date.now() - 1000).toISOString());

    expect(service.getToken()).toBeNull();
  });
});
