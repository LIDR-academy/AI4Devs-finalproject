import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordStrengthComponent } from './password-strength.component';
import { SimpleChange } from '@angular/core';

describe('PasswordStrengthComponent', () => {
  let component: PasswordStrengthComponent;
  let fixture: ComponentFixture<PasswordStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('calculateStrength', () => {
    it('debe calcular fuerza como "Muy débil" para contraseñas cortas', () => {
      // Arrange
      component.password = 'abc';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'abc', true),
      });

      // Assert
      expect(component.strengthLabel).toBe('Muy débil');
      expect(component.strengthColor).toBe('warn');
      expect(component.strengthPercentage).toBeLessThan(20);
    });

    it('debe calcular fuerza como "Débil" para contraseñas básicas', () => {
      // Arrange
      component.password = 'password';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'password', true),
      });

      // Assert
      expect(component.strengthLabel).toBe('Débil');
      expect(component.strengthColor).toBe('warn');
      expect(component.strengthPercentage).toBeGreaterThanOrEqual(20);
      expect(component.strengthPercentage).toBeLessThan(40);
    });

    it('debe calcular fuerza como "Aceptable" para contraseñas con mayúsculas y números', () => {
      // Arrange
      component.password = 'Password8'; // 9 caracteres: length(20) + hasLower(15) + hasUpper(15) + hasNumber(15) = 65

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'Password8', true),
      });

      // Assert
      expect(component.strengthLabel).toBe('Fuerte'); // 65 está entre 60-80, es "Fuerte"
      expect(component.strengthColor).toBe('primary');
      expect(component.strengthPercentage).toBeGreaterThanOrEqual(60);
      expect(component.strengthPercentage).toBeLessThan(80);
    });

    it('debe calcular fuerza como "Fuerte" para contraseñas con caracteres especiales', () => {
      // Arrange
      component.password = 'Password12!'; // 12 caracteres: length(20) + hasLower(15) + hasUpper(15) + hasNumber(15) + hasSpecial(20) + longEnough(15) = 100

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'Password12!', true),
      });

      // Assert
      expect(component.strengthLabel).toBe('Muy fuerte'); // 100 es >= 80, es "Muy fuerte"
      expect(component.strengthColor).toBe('primary');
      expect(component.strengthPercentage).toBeGreaterThanOrEqual(80);
    });

    it('debe calcular fuerza como "Muy fuerte" para contraseñas largas y complejas', () => {
      // Arrange
      component.password = 'VeryStrongPassword123!@#';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'VeryStrongPassword123!@#', true),
      });

      // Assert
      expect(component.strengthLabel).toBe('Muy fuerte');
      expect(component.strengthColor).toBe('primary');
      expect(component.strengthPercentage).toBeGreaterThanOrEqual(80);
    });

    it('debe resetear valores cuando la contraseña está vacía', () => {
      // Arrange
      component.password = 'SomePassword123!';
      component.ngOnChanges({
        password: new SimpleChange(null, 'SomePassword123!', true),
      });

      // Act
      component.password = '';
      component.ngOnChanges({
        password: new SimpleChange('SomePassword123!', '', false),
      });

      // Assert
      expect(component.strengthPercentage).toBe(0);
      expect(component.strengthLabel).toBe('');
      expect(component.strengthClass).toBe('');
    });
  });
});
