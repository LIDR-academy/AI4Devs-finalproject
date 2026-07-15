import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let component: StarRatingComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StarRatingComponent] });
    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Higiene');
    fixture.detectChanges();
  });

  it('muestra la leyenda con el label pasado', () => {
    expect(fixture.nativeElement.textContent).toContain('Higiene');
  });

  it('muestra exactamente 5 botones de estrella', () => {
    const stars: NodeList = fixture.nativeElement.querySelectorAll('.star-rating__star');
    expect(stars.length).toBe(5);
  });

  it('al hacer click en la estrella 3 el valor queda en 3', () => {
    const stars: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.star-rating__star');
    stars[2].click();
    fixture.detectChanges();
    expect(component.value()).toBe(3);
  });

  it('las 3 primeras estrellas se marcan como filled cuando value=3', () => {
    fixture.componentRef.setInput('value', 3);
    fixture.detectChanges();
    const stars: NodeListOf<Element> = fixture.nativeElement.querySelectorAll('.star-rating__star');
    [0, 1, 2].forEach((i) => expect(stars[i].classList).toContain('star-rating__star--filled'));
    [3, 4].forEach((i) => expect(stars[i].classList).not.toContain('star-rating__star--filled'));
  });

  it('ArrowRight aumenta el valor', () => {
    fixture.componentRef.setInput('value', 2);
    const star = fixture.nativeElement.querySelectorAll('.star-rating__star')[0] as HTMLButtonElement;
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe(3);
  });

  it('ArrowLeft disminuye el valor', () => {
    fixture.componentRef.setInput('value', 4);
    const star = fixture.nativeElement.querySelectorAll('.star-rating__star')[0] as HTMLButtonElement;
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe(3);
  });

  it('no baja del valor 1 con ArrowLeft repetido', () => {
    fixture.componentRef.setInput('value', 1);
    const star = fixture.nativeElement.querySelectorAll('.star-rating__star')[0] as HTMLButtonElement;
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe(1);
  });

  it('no sube del valor 5 con ArrowRight repetido', () => {
    fixture.componentRef.setInput('value', 5);
    const star = fixture.nativeElement.querySelectorAll('.star-rating__star')[0] as HTMLButtonElement;
    star.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(component.value()).toBe(5);
  });
});
