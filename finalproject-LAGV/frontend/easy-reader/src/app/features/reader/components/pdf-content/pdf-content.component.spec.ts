import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfContentComponent } from './pdf-content.component';
import { PdfService } from '../../services/pdf.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

class MockPdfService {
  viewerState$ = of({ config: { readingMode: 'textToSpeech' }, title: 'Test PDF' });
  nextPage$ = of<void>();
  previousPage$ = of<void>();
  lastPage$ = of<void>();
  firstPage$ = of<void>();
  bottomPage$ = of<void>();
  topPage$ = of<void>();
  upPage$ = of<void>();
  downPage$ = of<void>();
  goToPage$ = of<number>();
  getCurrentUrl(): string | null { return 'test.pdf'; }
  setCurrentPageText(text: string, detonationManual?: boolean) {}
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockChangeDetectorRef {
  detectChanges() {}
}

describe('PdfContentComponent', () => {
  let component: PdfContentComponent;
  let fixture: ComponentFixture<PdfContentComponent>;
  let pdfService: MockPdfService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfContentComponent],
      providers: [
        { provide: PdfService, useClass: MockPdfService },
        { provide: Router, useClass: MockRouter },
        { provide: ChangeDetectorRef, useClass: MockChangeDetectorRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfContentComponent);
    component = fixture.componentInstance;
    pdfService = TestBed.inject(PdfService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load PDF on init', () => {
    const loadPdfSpy = spyOn<any>(component, 'loadPdf');
    component.ngOnInit();
    expect(loadPdfSpy).toHaveBeenCalledWith('test.pdf');
  });

  it('should navigate to next page', async () => {
    component.currentPage = 1;
    component.totalPages = 3;
    const queueRenderPageSpy = spyOn<any>(component, 'queueRenderPage');
    await component.nextPage();
    expect(component.currentPage).toBe(2);
    expect(queueRenderPageSpy).toHaveBeenCalledWith(2, true);
  });

  it('should not navigate past last page', async () => {
    component.currentPage = 3;
    component.totalPages = 3;
    const applyShakeEffectSpy = spyOn<any>(component, 'applyShakeEffect');
    await component.nextPage();
    expect(component.currentPage).toBe(3);
    expect(applyShakeEffectSpy).toHaveBeenCalled();
  });

  it('should navigate to previous page', async () => {
    component.currentPage = 2;
    const queueRenderPageSpy = spyOn<any>(component, 'queueRenderPage');
    await component.previousPage();
    expect(component.currentPage).toBe(1);
    expect(queueRenderPageSpy).toHaveBeenCalledWith(1, true);
  });

  it('should not navigate before first page', async () => {
    component.currentPage = 1;
    const applyShakeEffectSpy = spyOn<any>(component, 'applyShakeEffect');
    await component.previousPage();
    expect(component.currentPage).toBe(1);
    expect(applyShakeEffectSpy).toHaveBeenCalled();
  });
}); 