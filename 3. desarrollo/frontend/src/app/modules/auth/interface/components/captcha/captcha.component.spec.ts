import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CaptchaComponent } from './captcha.component';

describe('CaptchaComponent', () => {
  let component: CaptchaComponent;
  let fixture: ComponentFixture<CaptchaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptchaComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe generar una operación matemática al inicializar', () => {
    // Assert
    expect(component.num1).toBeGreaterThan(0);
    expect(component.num2).toBeGreaterThan(0);
    expect(component.correctAnswer).toBe(component.num1 + component.num2);
  });

  describe('regenerate', () => {
    it('debe generar una nueva operación matemática', () => {
      // Arrange
      const oldNum1 = component.num1;
      const oldNum2 = component.num2;
      const oldAnswer = component.correctAnswer;
      component.userAnswer = 5;

      // Act - regenerar múltiples veces para asegurar que cambie
      let attempts = 0;
      let newNum1 = oldNum1;
      let newNum2 = oldNum2;
      while ((newNum1 === oldNum1 && newNum2 === oldNum2) && attempts < 10) {
        component.regenerate();
        newNum1 = component.num1;
        newNum2 = component.num2;
        attempts++;
      }

      // Assert
      // Verificar que al menos uno de los números cambió, o que la respuesta es diferente
      const newAnswer = component.correctAnswer;
      const numbersChanged = newNum1 !== oldNum1 || newNum2 !== oldNum2;
      const answerChanged = newAnswer !== oldAnswer;
      
      // Al menos uno debe cambiar (números o respuesta)
      expect(numbersChanged || answerChanged).toBe(true);
      expect(component.userAnswer).toBeNull();
      expect(component.error).toBe(false);
      // Verificar que la respuesta es correcta
      expect(component.correctAnswer).toBe(component.num1 + component.num2);
    });

    it('debe calcular la respuesta correcta', () => {
      // Arrange
      component.num1 = 5;
      component.num2 = 3;

      // Act
      component.regenerate();

      // Assert
      expect(component.correctAnswer).toBe(component.num1 + component.num2);
    });
  });

  describe('onAnswerChange', () => {
    it('debe emitir evento cuando la respuesta es correcta', () => {
      // Arrange
      spyOn(component.resolved, 'emit');
      component.num1 = 5;
      component.num2 = 3;
      component.correctAnswer = 8;
      component.userAnswer = 8;

      // Act
      component.onAnswerChange();

      // Assert
      expect(component.resolved.emit).toHaveBeenCalled();
      expect(component.error).toBe(false);
    });

    it('debe mostrar error cuando la respuesta es incorrecta y tiene longitud suficiente', () => {
      // Arrange
      component.num1 = 5;
      component.num2 = 3;
      component.correctAnswer = 8;
      component.userAnswer = 9; // Respuesta incorrecta

      // Act
      component.onAnswerChange();

      // Assert
      // El error solo se muestra si la longitud del input es >= longitud de la respuesta correcta
      // Para 8, la longitud es 1, entonces si userAnswer es 9 (longitud 1), no mostrará error
      // Necesitamos un número con más dígitos
      component.userAnswer = 99; // 2 dígitos vs 1 dígito de 8
      component.onAnswerChange();
      expect(component.error).toBe(true);
    });

    it('no debe mostrar error mientras el usuario está escribiendo', () => {
      // Arrange - usar una respuesta correcta con más dígitos para poder probar mejor
      component.num1 = 10;
      component.num2 = 5;
      component.correctAnswer = 15; // Longitud: 2 dígitos
      component.userAnswer = 1; // Respuesta parcial, longitud: 1 dígito (menor que la correcta)

      // Act
      component.onAnswerChange();

      // Assert
      // El error solo se muestra si la longitud del input >= longitud de la respuesta correcta
      // Como userAnswer tiene 1 dígito y correctAnswer tiene 2, no debería mostrar error aún
      expect(component.error).toBe(false);
      
      // Si el usuario ingresa un número incorrecto con la misma longitud que la respuesta correcta
      component.userAnswer = 99; // 2 dígitos vs 2 dígitos de 15, pero incorrecto
      component.onAnswerChange();
      // Ahora sí debería mostrar error porque tiene la misma longitud y es incorrecto
      expect(component.error).toBe(true);
    });

    it('debe limpiar error cuando el usuario corrige la respuesta', () => {
      // Arrange
      component.error = true;
      component.userAnswer = null;

      // Act
      component.onAnswerChange();

      // Assert
      expect(component.error).toBe(false);
    });
  });
});
