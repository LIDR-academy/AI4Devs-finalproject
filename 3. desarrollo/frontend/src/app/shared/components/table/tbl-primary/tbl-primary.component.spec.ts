import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TblPrimaryComponent } from './tbl-primary.component';

describe('TblPrimaryComponent', () => {
  let component: TblPrimaryComponent;
  let fixture: ComponentFixture<TblPrimaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TblPrimaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TblPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
