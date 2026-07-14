import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const fillForm = (email: string, password: string) => {
    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector('input[type="email"]');
    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('input[formControlName="password"]');
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('does not call the API when the form is invalid', () => {
    fillForm('not-an-email', '');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it('shows a generic error message on invalid credentials', () => {
    fillForm('camila.rojas@example.cl', 'wrong-password');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    httpMock
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush(
        { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401, statusText: 'Unauthorized' }
      );
    fixture.detectChanges();

    const error: HTMLElement = fixture.nativeElement.querySelector('.error-message');
    expect(error).toBeTruthy();
    expect(error.textContent).toContain('Credenciales inválidas');
  });
});
