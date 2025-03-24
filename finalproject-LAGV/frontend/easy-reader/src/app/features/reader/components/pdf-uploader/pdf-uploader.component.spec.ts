import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfUploaderComponent } from './pdf-uploader.component';
import { PdfService } from '../../services/pdf.service';
import { BehaviorSubject } from 'rxjs';
import { UploadFile, UploadStatus } from '@shared/types/reading.types';


describe('PdfUploaderComponent', () => {
  let component: PdfUploaderComponent;
  let fixture: ComponentFixture<PdfUploaderComponent>;
  let pdfServiceMock: jasmine.SpyObj<PdfService>;

  beforeEach(async () => {
    const currentFileSubject = new BehaviorSubject<UploadFile | null>(null);
    pdfServiceMock = jasmine.createSpyObj('PdfService', ['uploadFile', 'removeFile'], {
      currentFile$: currentFileSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [PdfUploaderComponent],
      providers: [
        { provide: PdfService, useValue: pdfServiceMock }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update isDragging on drag enter and leave', () => {
    const dragEvent = new DragEvent('dragenter');
    component.onDragEnter(dragEvent);
    expect(component.isDragging).toBeTrue();

    const dragLeaveEvent = new DragEvent('dragleave');
    component.onDragLeave(dragLeaveEvent);
    expect(component.isDragging).toBeFalse();
  });

  it('should update currentFile on file input change', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const uploadFile: UploadFile = { name: file.name, size: file.size.toString(), progress: 0, status: 'uploading' as UploadStatus, file };
    const event = { target: { files: [file] } } as unknown as Event;
    component.onFileInputChange(event);
    expect(component.currentFile).toEqual(uploadFile);
  });

  it('should remove currentFile when removeFile is called', () => {
    component.currentFile = { name: 'test.pdf', size: '1234', progress: 0, status: 'uploading' as UploadStatus, file: new File([''], 'test.pdf') };
    component.removeFile();
    expect(component.currentFile).toBeNull();
  });

  // Añade más pruebas según las funcionalidades específicas que desees verificar
}); 