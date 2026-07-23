import { Component, OnInit, inject, signal, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription, debounceTime, tap, catchError, of, switchMap } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button.component';
import { EventService } from '../../../core/services/event.service';
import { TemplateService } from '../../../core/services/template.service';
import { EventResponse } from '../../../core/models/event.model';
import { Template } from '../../../core/models/template.model';

@Component({
  selector: 'app-edit-event-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './edit-event.page.html',
  styleUrls: ['./edit-event.page.css']
})
export default class EditEventPage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly templateService = inject(TemplateService);

  eventSlug = signal<string>('');
  eventData = signal<EventResponse | null>(null);
  templates = signal<Template[]>([]);
  
  // Save state: 'saved' | 'saving' | 'unsaved' | 'error'
  saveState = signal<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  errorMessage = signal<string | null>(null);
  isUploading = signal(false);

  editorForm: FormGroup;
  private formChangeSub?: Subscription;

  // We use a Subject to push form values and debounce them before saving
  private autoSaveSubject = new Subject<any>();

  constructor() {
    this.editorForm = this.fb.group({
      templateId: ['', Validators.required],
      primaryColor: ['#000000', Validators.required],
      secondaryColor: ['#ffffff', Validators.required],
      fontFamily: ['Inter', Validators.required],
      heroImageUrl: [''],
      thankYouMessage: [''],
      photoGalleryUrl: ['']
    });

    // Auto-save logic
    this.autoSaveSubject.pipe(
      tap(() => this.saveState.set('saving')),
      debounceTime(2000),
      switchMap(formValues => {
        const currentEvent = this.eventData();
        if (!currentEvent) return of(null);
        
        const updateRequest = {
          name: currentEvent.name,
          coupleNames: currentEvent.coupleNames,
          eventDate: currentEvent.eventDate,
          venueName: currentEvent.venueName,
          venueAddress: currentEvent.venueAddress,
          ...formValues
        };
        
        return this.eventService.updateEvent(this.eventSlug(), updateRequest).pipe(
          catchError(err => {
            console.error('Auto-save failed', err);
            this.saveState.set('error');
            return of(null);
          })
        );
      })
    ).subscribe(result => {
      if (result) {
        this.saveState.set('saved');
      }
    });
  }

  ngOnInit() {
    this.loadTemplates();
    
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.eventSlug.set(slug);
        this.loadEvent(slug);
      }
    });

    // Track form changes for UI unsaved state and triggering auto-save
    this.formChangeSub = this.editorForm.valueChanges.subscribe(values => {
      // Don't mark unsaved if we are currently saving or saved recently, 
      // but to keep it simple, whenever user types, it's unsaved.
      if (this.editorForm.valid) {
        this.saveState.set('unsaved');
        this.autoSaveSubject.next(values);
      }
    });
  }

  ngOnDestroy() {
    if (this.formChangeSub) {
      this.formChangeSub.unsubscribe();
    }
    this.autoSaveSubject.complete();
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges()) {
      $event.returnValue = true;
    }
  }

  hasUnsavedChanges(): boolean {
    return this.saveState() === 'unsaved' || this.saveState() === 'saving';
  }

  forceSave(): import('rxjs').Observable<any> {
    const currentEvent = this.eventData();
    if (!currentEvent) return of(true);
    
    const formValues = this.editorForm.value;
    const updateRequest = {
      name: currentEvent.name,
      coupleNames: currentEvent.coupleNames,
      eventDate: currentEvent.eventDate,
      venueName: currentEvent.venueName,
      venueAddress: currentEvent.venueAddress,
      ...formValues
    };
    
    return this.eventService.updateEvent(this.eventSlug(), updateRequest).pipe(
      tap(() => this.saveState.set('saved')),
      catchError(() => of(true)) // allow navigation even if it fails, or handle differently
    );
  }

  private loadTemplates() {
    this.templateService.getTemplates().subscribe({
      next: (data) => this.templates.set(data),
      error: (err) => console.error('Failed to load templates', err)
    });
  }

  private loadEvent(slug: string) {
    this.eventService.getEvent(slug).subscribe({
      next: (event) => {
        this.eventData.set(event);
        this.editorForm.patchValue({
          templateId: event.templateId || '',
          primaryColor: event.primaryColor || '#000000',
          secondaryColor: event.secondaryColor || '#ffffff',
          fontFamily: event.fontFamily || 'Inter',
          heroImageUrl: event.heroImageUrl || '',
          thankYouMessage: event.thankYouMessage || '',
          photoGalleryUrl: event.photoGalleryUrl || ''
        }, { emitEvent: false }); // Don't trigger auto-save on initial load
      },
      error: (err) => {
        this.errorMessage.set('Event not found or access denied.');
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadHeroImage(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.uploadHeroImage(file);
    }
  }

  private uploadHeroImage(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }
    if (!file.type.match(/image\/(jpeg|png)/)) {
      alert('Only JPG and PNG files are allowed.');
      return;
    }

    this.isUploading.set(true);
    this.eventService.uploadHeroImage(this.eventSlug(), file).subscribe({
      next: (response) => {
        this.editorForm.patchValue({ heroImageUrl: response.url });
        this.isUploading.set(false);
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Failed to upload image.');
        this.isUploading.set(false);
      }
    });
  }

  // Helper for preview
  getPreviewStyles(): { [key: string]: string } {
    const values = this.editorForm.value;
    const styles: { [key: string]: string } = {
      '--primary-color': values.primaryColor,
      '--secondary-color': values.secondaryColor,
      'font-family': values.fontFamily,
    };
    return styles;
  }

  getSelectedTemplateName(): string {
    const id = this.editorForm.get('templateId')?.value;
    const tpl = this.templates().find(t => t.id === id);
    return tpl ? tpl.name : 'Default';
  }
}
