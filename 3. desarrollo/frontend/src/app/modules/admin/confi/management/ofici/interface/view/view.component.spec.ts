import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OficiViewComponent } from './view.component';

describe('OficiViewComponent', () => {
  let component: OficiViewComponent;
  let fixture: ComponentFixture<OficiViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OficiViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OficiViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
