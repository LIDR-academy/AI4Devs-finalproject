import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishDialog } from './publish-dialog';

describe('PublishDialog', () => {
  let component: PublishDialog;
  let fixture: ComponentFixture<PublishDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
