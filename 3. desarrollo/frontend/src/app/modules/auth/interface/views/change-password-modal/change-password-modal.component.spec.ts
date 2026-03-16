import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ChangePasswordModalComponent } from './change-password-modal.component';
import { AuthFacade } from '../../../application/facades/auth.facade';

describe('ChangePasswordModalComponent', () => {
  let component: ChangePasswordModalComponent;
  let fixture: ComponentFixture<ChangePasswordModalComponent>;
  let authFacade: jasmine.SpyObj<AuthFacade>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ChangePasswordModalComponent>>;

  beforeEach(async () => {
    const authFacadeSpy = jasmine.createSpyObj('AuthFacade', ['changePassword'], {
      isLoading$: of(false),
      error$: of(null),
    });

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordModalComponent],
      providers: [
        { provide: AuthFacade, useValue: authFacadeSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordModalComponent);
    component = fixture.componentInstance;
    authFacade = TestBed.inject(AuthFacade) as jasmine.SpyObj<AuthFacade>;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<ChangePasswordModalComponent>>;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debe inicializar el formulario correctamente', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.changePasswordForm).toBeTruthy();
      expect(component.changePasswordForm.get('currentPassword')).toBeTruthy();
      expect(component.changePasswordForm.get('newPassword')).toBeTruthy();
      expect(component.changePasswordForm.get('confirmPassword')).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('debe cambiar la contraseña exitosamente', async () => {
      // Arrange
      component.ngOnInit();
      component.changePasswordForm.patchValue({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      authFacade.changePassword.and.returnValue(Promise.resolve());

      // Act
      await component.onSubmit();

      // Assert
      expect(authFacade.changePassword).toHaveBeenCalledWith('oldPassword123', 'newPassword123');
      expect(dialogRef.close).toHaveBeenCalledWith({ success: true });
    });

    it('no debe enviar el formulario si es inválido', async () => {
      // Arrange
      component.ngOnInit();
      component.changePasswordForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Act
      await component.onSubmit();

      // Assert
      expect(authFacade.changePassword).not.toHaveBeenCalled();
    });

    it('debe validar que las contraseñas coincidan', async () => {
      // Arrange
      component.ngOnInit();
      component.changePasswordForm.patchValue({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword',
      });

      // Act
      await component.onSubmit();

      // Assert
      expect(component.changePasswordForm.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
      expect(authFacade.changePassword).not.toHaveBeenCalled();
    });

    it('debe manejar errores al cambiar contraseña', async () => {
      // Arrange
      component.ngOnInit();
      component.changePasswordForm.patchValue({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      const error = { message: 'Contraseña actual incorrecta' };
      authFacade.changePassword.and.returnValue(Promise.reject(error));

      // Act
      await component.onSubmit();

      // Assert
      expect(component.error).toBe('Contraseña actual incorrecta');
    });
  });

  describe('togglePasswordVisibility', () => {
    it('debe alternar la visibilidad de las contraseñas', () => {
      // Arrange
      component.showCurrentPassword = false;
      component.showNewPassword = false;
      component.showConfirmPassword = false;

      // Act
      component.showCurrentPassword = true;
      component.showNewPassword = true;
      component.showConfirmPassword = true;

      // Assert
      expect(component.showCurrentPassword).toBe(true);
      expect(component.showNewPassword).toBe(true);
      expect(component.showConfirmPassword).toBe(true);
    });
  });
});

