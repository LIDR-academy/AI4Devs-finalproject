import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwipeButtonComponent } from './swipe-button.component';

describe('SwipeButtonComponent', () => {
  let component: SwipeButtonComponent;
  let fixture: ComponentFixture<SwipeButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwipeButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SwipeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit swipeComplete when threshold is not met', () => {
    spyOn(component.swipeComplete, 'emit');
    
    // Simulate container width 300
    Object.defineProperty(component.containerRef.nativeElement, 'offsetWidth', { value: 300, configurable: true });
    
    // Start drag
    component.onMouseDown(new MouseEvent('mousedown', { clientX: 0 }));
    // Move slightly
    component.onDocumentMouseMove(new MouseEvent('mousemove', { clientX: 100 }));
    // End drag
    component.onDocumentMouseUp();

    expect(component.swipeComplete.emit).not.toHaveBeenCalled();
    expect(component.currentX).toBe(0); // Should snap back
  });

  it('should emit swipeComplete when threshold is met', () => {
    spyOn(component.swipeComplete, 'emit');
    
    // Simulate container width 300
    Object.defineProperty(component.containerRef.nativeElement, 'offsetWidth', { value: 300, configurable: true });
    
    // Max drag X is 300 - 48 - 8 = 244. 80% of 244 is 195.2
    component.onMouseDown(new MouseEvent('mousedown', { clientX: 0 }));
    component.onDocumentMouseMove(new MouseEvent('mousemove', { clientX: 200 }));
    component.onDocumentMouseUp();

    expect(component.swipeComplete.emit).toHaveBeenCalled();
  });

  it('should show hint when tapped without dragging', () => {
    component.onClick();
    expect(component.showHint).toBeTrue();
  });
});
