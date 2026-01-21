import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRequirementsComponent } from './password-requirements.component';
import { SimpleChange } from '@angular/core';

describe('PasswordRequirementsComponent', () => {
  let component: PasswordRequirementsComponent;
  let fixture: ComponentFixture<PasswordRequirementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRequirementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRequirementsComponent);
    component = fixture.componentInstance;
    component.minLength = 8;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('validateRequirements', () => {
    it('debe validar todos los requisitos como no cumplidos para contraseña vacía', () => {
      // Arrange
      component.password = '';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, '', true),
      });

      // Assert
      expect(component.requirements.length).toBe(5);
      component.requirements.forEach((req) => {
        expect(req.valid).toBe(false);
      });
      expect(component.allRequirementsMet()).toBe(false);
    });

    it('debe validar longitud mínima correctamente', () => {
      // Arrange
      component.password = 'short';
      component.minLength = 8;

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'short', true),
      });

      // Assert
      const lengthReq = component.requirements.find((r) => r.label.includes('Mínimo'));
      expect(lengthReq?.valid).toBe(false);

      // Arrange - contraseña con longitud suficiente
      component.password = 'longpassword';

      // Act
      component.ngOnChanges({
        password: new SimpleChange('short', 'longpassword', false),
      });

      // Assert
      const lengthReq2 = component.requirements.find((r) => r.label.includes('Mínimo'));
      expect(lengthReq2?.valid).toBe(true);
    });

    it('debe validar mayúsculas correctamente', () => {
      // Arrange
      component.password = 'lowercase123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'lowercase123', true),
      });

      // Assert
      const upperReq = component.requirements.find((r) => r.label.includes('mayúscula'));
      expect(upperReq?.valid).toBe(false);

      // Arrange - con mayúscula
      component.password = 'Lowercase123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange('lowercase123', 'Lowercase123', false),
      });

      // Assert
      const upperReq2 = component.requirements.find((r) => r.label.includes('mayúscula'));
      expect(upperReq2?.valid).toBe(true);
    });

    it('debe validar minúsculas correctamente', () => {
      // Arrange
      component.password = 'UPPERCASE123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'UPPERCASE123', true),
      });

      // Assert
      const lowerReq = component.requirements.find((r) => r.label.includes('minúscula'));
      expect(lowerReq?.valid).toBe(false);

      // Arrange - con minúscula
      component.password = 'UPPERCASEa123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange('UPPERCASE123', 'UPPERCASEa123', false),
      });

      // Assert
      const lowerReq2 = component.requirements.find((r) => r.label.includes('minúscula'));
      expect(lowerReq2?.valid).toBe(true);
    });

    it('debe validar números correctamente', () => {
      // Arrange
      component.password = 'NoNumbers!';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'NoNumbers!', true),
      });

      // Assert
      const numberReq = component.requirements.find((r) => r.label.includes('número'));
      expect(numberReq?.valid).toBe(false);

      // Arrange - con número
      component.password = 'WithNumbers1!';

      // Act
      component.ngOnChanges({
        password: new SimpleChange('NoNumbers!', 'WithNumbers1!', false),
      });

      // Assert
      const numberReq2 = component.requirements.find((r) => r.label.includes('número'));
      expect(numberReq2?.valid).toBe(true);
    });

    it('debe validar caracteres especiales correctamente', () => {
      // Arrange
      component.password = 'NoSpecial123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'NoSpecial123', true),
      });

      // Assert
      const specialReq = component.requirements.find((r) => r.label.includes('especial'));
      expect(specialReq?.valid).toBe(false);

      // Arrange - con carácter especial
      component.password = 'WithSpecial!123';

      // Act
      component.ngOnChanges({
        password: new SimpleChange('NoSpecial123', 'WithSpecial!123', false),
      });

      // Assert
      const specialReq2 = component.requirements.find((r) => r.label.includes('especial'));
      expect(specialReq2?.valid).toBe(true);
    });

    it('debe retornar true en allRequirementsMet cuando todos los requisitos se cumplen', () => {
      // Arrange
      component.password = 'StrongPassword123!';

      // Act
      component.ngOnChanges({
        password: new SimpleChange(null, 'StrongPassword123!', true),
      });

      // Assert
      expect(component.allRequirementsMet()).toBe(true);
      component.requirements.forEach((req) => {
        expect(req.valid).toBe(true);
      });
    });
  });
});
