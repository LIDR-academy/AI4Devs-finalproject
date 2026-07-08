import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateEventRequest } from '../../../../../core/models/event.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-event-details-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="step-container">
      <h2>Event Details</h2>
      <p class="subtitle">Tell us more about your special day.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="details-form">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Event Name</label>
            <input id="name" type="text" formControlName="name" placeholder="e.g. Pedro & Maria's Wedding" class="form-control">
          </div>
          <div class="form-group">
            <label for="coupleNames">Couple Names</label>
            <input id="coupleNames" type="text" formControlName="coupleNames" placeholder="e.g. Pedro & Maria" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="eventDate">Event Date & Time</label>
            <input id="eventDate" type="datetime-local" formControlName="eventDate" class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="venueName">Venue Name</label>
            <input id="venueName" type="text" formControlName="venueName" placeholder="e.g. The Grand Hotel" class="form-control">
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="venueAddress">Venue Address</label>
            <input id="venueAddress" type="text" formControlName="venueAddress" placeholder="e.g. 123 Wedding St, City" class="form-control">
          </div>
        </div>

        @if (mapUrl) {
          <div class="map-preview">
            <iframe
              width="100%"
              height="250"
              style="border:0; border-radius: 8px;"
              loading="lazy"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
              [src]="mapUrl">
            </iframe>
          </div>
        }

        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="back.emit()">Back</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Create Event</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .step-container { padding: 1rem 0; }
    h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }

    .details-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #000;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
    }

    .map-preview {
      margin-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:hover { background: #e0e0e0; }

    .btn-primary {
      background: #000;
      color: #fff;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class EventDetailsStepComponent implements OnInit {
  @Input() initialData!: Partial<CreateEventRequest>;
  @Output() next = new EventEmitter<Partial<CreateEventRequest>>();
  @Output() back = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  form!: FormGroup;
  mapUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.initialData.name || '', Validators.required],
      coupleNames: [this.initialData.coupleNames || '', Validators.required],
      eventDate: [this.formatDateForInput(this.initialData.eventDate), Validators.required],
      venueName: [this.initialData.venueName || '', Validators.required],
      venueAddress: [this.initialData.venueAddress || '', Validators.required],
    });

    this.form.get('venueAddress')?.valueChanges.subscribe(val => {
      this.updateMapPreview(val);
    });

    if (this.initialData.venueAddress) {
      this.updateMapPreview(this.initialData.venueAddress);
    }
  }

  private formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adjust for local timezone offset to display correctly in datetime-local
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - tzOffset);
    return localDate.toISOString().slice(0, 16);
  }

  private updateMapPreview(address: string) {
    if (!address || address.trim() === '') {
      this.mapUrl = null;
      return;
    }
    // Using simple google maps embed via iframe. Note: In real app, requires API Key.
    // For MVP, we format it as a search query.
    const encodedAddress = encodeURIComponent(address);
    // Use a placeholder or free embed without API key, or standard maps embed with a placeholder key.
    const url = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      // Convert local datetime-local value back to ISO string
      formValue.eventDate = new Date(formValue.eventDate).toISOString();
      this.next.emit(formValue);
    }
  }
}
