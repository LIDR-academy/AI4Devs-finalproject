import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadingOptionsComponent } from './reading-options.component';
import { PdfService } from '../../services/pdf.service';
import { WebContentService } from '../../services/web-content.service';
import { ReaderModeService } from '@shared/services/reader-mode.service';
import { ReadingMode } from '@shared/types/reading.types';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

class MockPdfService {
  setReadingMode(mode: ReadingMode) {}
  initializeViewer() {}
}

class MockWebContentService {
  setReadingMode(mode: ReadingMode) {}
  initializeViewer() {}
}

class MockReaderModeService {
  getMode() { return 'pdf'; }
}

describe('ReadingOptionsComponent', () => {
  let component: ReadingOptionsComponent;
  let fixture: ComponentFixture<ReadingOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, ReadingOptionsComponent],
      providers: [
        { provide: PdfService, useClass: MockPdfService },
        { provide: WebContentService, useClass: MockWebContentService },
        { provide: ReaderModeService, useClass: MockReaderModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReadingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect mobile device', () => {
    spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('iPhone');
    component.ngOnInit();
    expect(component.isMobileDevice).toBeTrue();
  });


  it('should emit reading mode selected', () => {
    spyOn(component.readingModeSelected, 'emit');
    component.selectedMode = 'textToSpeech';
    component.onContinue();
    expect(component.readingModeSelected.emit).toHaveBeenCalledWith('textToSpeech');
  });

  it('should initialize PDF viewer', () => {
    const pdfService = TestBed.inject(PdfService);
    spyOn(pdfService, 'setReadingMode');
    spyOn(pdfService, 'initializeViewer');
    component.onContinue();
    expect(pdfService.setReadingMode).toHaveBeenCalledWith(component.selectedMode);
    expect(pdfService.initializeViewer).toHaveBeenCalled();
  });

  it('should initialize Web viewer', () => {
    const webContentService = TestBed.inject(WebContentService);
    const readerModeService = TestBed.inject(ReaderModeService);
    spyOn(readerModeService, 'getMode').and.returnValue('web');
    spyOn(webContentService, 'setReadingMode');
    spyOn(webContentService, 'initializeViewer');
    component.onContinue();
    expect(webContentService.setReadingMode).toHaveBeenCalledWith(component.selectedMode);
    expect(webContentService.initializeViewer).toHaveBeenCalled();
  });
}); 