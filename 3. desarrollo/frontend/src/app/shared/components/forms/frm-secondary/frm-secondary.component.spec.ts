import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrmSecondaryComponent } from './frm-secondary.component';

describe('FrmSecondaryComponent', () => {
  let component: FrmSecondaryComponent;
  let fixture: ComponentFixture<FrmSecondaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrmSecondaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrmSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
