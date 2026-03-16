import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmPrimaryComponent } from './frm-primary.component';

describe('FrmPrimaryComponent', () => {
  let component: FrmPrimaryComponent;
  let fixture: ComponentFixture<FrmPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmPrimaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrmPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
