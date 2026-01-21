import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DangerComponent } from './danger.component';

describe('DangerComponent', () => {
  let component: DangerComponent;
  let fixture: ComponentFixture<DangerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DangerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
