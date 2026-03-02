import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerFormDialogComponent } from './marker-form-dialog.component';

describe('MarkerFormDialogComponent', () => {
  let component: MarkerFormDialogComponent;
  let fixture: ComponentFixture<MarkerFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkerFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkerFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
