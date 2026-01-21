import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TblSecondaryComponent } from './tbl-secondary.component';

describe('TblSecondaryComponent', () => {
  let component: TblSecondaryComponent;
  let fixture: ComponentFixture<TblSecondaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TblSecondaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TblSecondaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
