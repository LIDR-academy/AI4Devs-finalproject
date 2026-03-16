import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SltPrimaryComponent } from './slt-primary.component';

describe('SltPrimaryComponent', () => {
  let component: SltPrimaryComponent;
  let fixture: ComponentFixture<SltPrimaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SltPrimaryComponent ],
      imports: []
    }).compileComponents();

    fixture = TestBed.createComponent(SltPrimaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
