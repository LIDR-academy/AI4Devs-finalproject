import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpreViewComponent } from './view.component';

describe('EmpreViewComponent', () => {
  let component: EmpreViewComponent;
  let fixture: ComponentFixture<EmpreViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpreViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpreViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
