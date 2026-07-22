import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RsvpService, RsvpInfoResponse, SubmitRsvpRequest } from '../../../core/services/rsvp.service';

@Component({
  selector: 'app-rsvp-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        
        <div *ngIf="isLoading" class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading your invitation...</p>
        </div>

        <div *ngIf="errorState === 'invalid'" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 class="mt-4 text-xl font-bold text-gray-900">Invalid Invitation Link</h2>
          <p class="mt-2 text-sm text-gray-600">This invitation link is not valid or has been deleted. Please contact the host for a new link.</p>
        </div>

        <div *ngIf="errorState === 'deadline'" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="mt-4 text-xl font-bold text-gray-900">RSVP Deadline Passed</h2>
          <p class="mt-2 text-sm text-gray-600">The RSVP deadline for this event has passed. You can no longer submit or update your response.</p>
        </div>

        <div *ngIf="info && !errorState && !isLoading" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-extrabold text-gray-900">{{ info.coupleNames }}</h2>
            <p class="mt-2 text-lg text-gray-600">invite you to celebrate their wedding</p>
            <div class="mt-4 text-sm font-medium text-gray-500">
              <p>{{ info.eventDate | date:'fullDate' }}</p>
              <p>{{ info.venueName }}</p>
              <p>{{ info.venueAddress }}</p>
            </div>
            <h3 class="mt-6 text-xl font-medium text-gray-900">Hi {{ info.guestName }},</h3>
          </div>

          <form (ngSubmit)="onSubmit()" #rsvpForm="ngForm" class="space-y-6">
            
            <fieldset>
              <legend class="text-base font-medium text-gray-900">Will you be attending?</legend>
              <div class="mt-4 space-y-4">
                <div class="flex items-center">
                  <input id="attend-yes" name="attendance" type="radio" value="Yes" [(ngModel)]="request.attendance" required class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                  <label for="attend-yes" class="ml-3 block text-sm font-medium text-gray-700">Joyfully accepts</label>
                </div>
                <div class="flex items-center">
                  <input id="attend-no" name="attendance" type="radio" value="No" [(ngModel)]="request.attendance" required class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                  <label for="attend-no" class="ml-3 block text-sm font-medium text-gray-700">Regretfully declines</label>
                </div>
                <div class="flex items-center">
                  <input id="attend-maybe" name="attendance" type="radio" value="Maybe" [(ngModel)]="request.attendance" required class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300">
                  <label for="attend-maybe" class="ml-3 block text-sm font-medium text-gray-700">Not sure yet</label>
                </div>
              </div>
            </fieldset>

            <div *ngIf="request.attendance === 'Yes' || request.attendance === 'Maybe'" class="space-y-6">
              <div>
                <label for="dietary" class="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
                <div class="mt-1">
                  <textarea id="dietary" name="dietaryRestrictions" rows="2" [(ngModel)]="request.dietaryRestrictions" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="e.g. Vegetarian, Nut allergy"></textarea>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input id="transport" name="needsTransport" type="checkbox" [(ngModel)]="request.needsTransport" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                  <label for="transport" class="font-medium text-gray-700">I need transportation</label>
                  <p class="text-gray-500">Check this if you plan to use the provided shuttle service.</p>
                </div>
              </div>

              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input id="plusOne" name="bringingPlusOne" type="checkbox" [(ngModel)]="request.bringingPlusOne" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                </div>
                <div class="ml-3 text-sm">
                  <label for="plusOne" class="font-medium text-gray-700">I am bringing a +1</label>
                </div>
              </div>

              <div *ngIf="request.bringingPlusOne">
                <label for="plusOneName" class="block text-sm font-medium text-gray-700">Plus One's Name</label>
                <div class="mt-1">
                  <input type="text" id="plusOneName" name="plusOneName" [(ngModel)]="request.plusOneName" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-700">Message for the couple</label>
              <div class="mt-1">
                <textarea id="message" name="personalMessage" rows="3" [(ngModel)]="request.personalMessage" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Leave a wish or message!"></textarea>
              </div>
            </div>

            <div *ngIf="submitError" class="text-sm text-red-600">
              {{ submitError }}
            </div>

            <div>
              <button type="submit" [disabled]="!rsvpForm.form.valid || isSubmitting" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                {{ isSubmitting ? 'Submitting...' : 'Submit RSVP' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  `
})
export class RsvpFormPageComponent implements OnInit {
  token = '';
  isLoading = true;
  isSubmitting = false;
  errorState: 'invalid' | 'deadline' | null = null;
  submitError = '';
  info: RsvpInfoResponse | null = null;

  request: SubmitRsvpRequest = {
    attendance: 'Yes',
    needsTransport: false,
    bringingPlusOne: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rsvpService: RsvpService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.errorState = 'invalid';
      this.isLoading = false;
      return;
    }

    this.rsvpService.getRsvpInfo(this.token).subscribe({
      next: (res) => {
        this.info = res;
        if (res.deadlinePassed) {
          this.errorState = 'deadline';
        } else if (res.existingRsvp) {
          this.request = {
            attendance: res.existingRsvp.attendance,
            dietaryRestrictions: res.existingRsvp.dietaryRestrictions,
            needsTransport: res.existingRsvp.needsTransport,
            bringingPlusOne: res.existingRsvp.bringingPlusOne,
            plusOneName: res.existingRsvp.plusOneName,
            personalMessage: res.existingRsvp.personalMessage
          };
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorState = 'invalid';
        } else {
          this.errorState = 'invalid'; // Fallback for other errors
        }
      }
    });
  }

  onSubmit() {
    if (!this.request.attendance) return;
    this.isSubmitting = true;
    this.submitError = '';

    this.rsvpService.submitRsvp(this.token, this.request).subscribe({
      next: (res) => {
        this.router.navigate(['/rsvp', this.token, 'confirmation'], { 
          state: { confirmation: res }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 403) {
          this.errorState = 'deadline';
        } else if (err.status === 429) {
          this.submitError = 'Too many requests. Please try again later.';
        } else {
          this.submitError = 'An error occurred while submitting your RSVP. Please try again.';
        }
      }
    });
  }
}
