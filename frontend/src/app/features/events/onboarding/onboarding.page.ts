import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CreateEventRequest } from '../../../core/models/event.model';
import { TemplateSelectionStepComponent } from './components/template-selection-step/template-selection-step.component';
import { EventDetailsStepComponent } from './components/event-details-step/event-details-step.component';
import { GuestImportStepComponent } from './components/guest-import-step/guest-import-step.component';

export type OnboardingStep = 'template' | 'details' | 'guests';

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    CommonModule, 
    TemplateSelectionStepComponent, 
    EventDetailsStepComponent, 
    GuestImportStepComponent
  ],
  template: `
    <div class="onboarding-container">
      <header class="onboarding-header">
        <h1>Create Your Event</h1>
        <div class="steps-indicator">
          <div class="step" [class.active]="currentStep() === 'template'" [class.completed]="currentStep() === 'details' || currentStep() === 'guests'">1. Template</div>
          <div class="step" [class.active]="currentStep() === 'details'" [class.completed]="currentStep() === 'guests'">2. Details</div>
          <div class="step" [class.active]="currentStep() === 'guests'">3. Guests</div>
        </div>
      </header>

      <main class="onboarding-content">
        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }
        @switch (currentStep()) {
          @case ('template') {
            <app-template-selection-step 
              (next)="onTemplateSelected($event)">
            </app-template-selection-step>
          }
          @case ('details') {
            <app-event-details-step 
              [initialData]="eventData"
              (back)="currentStep.set('template')"
              (next)="onDetailsSubmitted($event)">
            </app-event-details-step>
          }
          @case ('guests') {
            <app-guest-import-step 
              (back)="currentStep.set('details')"
              (complete)="onComplete()">
            </app-guest-import-step>
          }
        }
      </main>
    </div>
  `,
  styleUrls: ['./onboarding.page.css'],
  styles: [`
    .error-alert {
      background-color: #fee2e2;
      border: 1px solid #ef4444;
      color: #b91c1c;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 500;
    }
  `]
})
export default class OnboardingPage {
  private readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  currentStep = signal<OnboardingStep>('template');
  errorMessage = signal<string | null>(null);
  
  eventData: Partial<CreateEventRequest> = {
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    fontFamily: 'Inter',
    coupleNames: '',
    name: '',
    venueName: '',
    venueAddress: '',
    eventDate: new Date().toISOString()
  };

  createdEventSlug: string | null = null;

  onTemplateSelected(templateId: string) {
    this.eventData.templateId = templateId;
    this.currentStep.set('details');
  }

  onDetailsSubmitted(details: Partial<CreateEventRequest>) {
    this.errorMessage.set(null);
    this.eventData = { ...this.eventData, ...details };
    
    // Create the event before proceeding to guest import
    if (this.eventData.name && this.eventData.eventDate && this.eventData.coupleNames && this.eventData.venueName && this.eventData.venueAddress) {
      this.eventService.createEvent(this.eventData as CreateEventRequest).subscribe({
        next: (response) => {
          this.createdEventSlug = response.slug;
          this.currentStep.set('guests');
        },
        error: (err) => {
          console.error('Failed to create event', err);
          if (err.error?.errors && err.error.errors.length > 0) {
            this.errorMessage.set(err.error.errors[0].message);
          } else {
            this.errorMessage.set('Failed to create event. Please try again.');
          }
        }
      });
    }
  }

  onComplete() {
    if (this.createdEventSlug) {
      this.router.navigate(['/dashboard']); // Or event detail page
    }
  }
}
