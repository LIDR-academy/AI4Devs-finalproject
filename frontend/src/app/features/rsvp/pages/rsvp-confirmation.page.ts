import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RsvpConfirmationResponse } from '../../../core/services/rsvp.service';

@Component({
  selector: 'app-rsvp-confirmation-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div *ngIf="!confirmation" class="text-center">
          <p class="text-gray-600">Loading confirmation details...</p>
        </div>

        <div *ngIf="confirmation" class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">Thank You, {{ confirmation.guestName }}!</h2>
          <p class="mt-2 text-lg text-gray-600">Your RSVP for <strong>{{ confirmation.eventName }}</strong> has been received.</p>
          
          <div class="mt-6 border-t border-gray-200 pt-6">
            <h3 class="text-lg font-medium text-gray-900">Your Response:</h3>
            <p class="mt-2 text-2xl font-bold text-indigo-600">
              <span *ngIf="confirmation.attendance === 'Yes'">Joyfully Accepts</span>
              <span *ngIf="confirmation.attendance === 'No'">Regretfully Declines</span>
              <span *ngIf="confirmation.attendance === 'Maybe'">Not Sure Yet</span>
            </p>
          </div>

          <div class="mt-8 space-y-4">
            <button class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none">
              Add to Calendar
            </button>
            <button class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RsvpConfirmationPageComponent implements OnInit {
  confirmation: RsvpConfirmationResponse | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['confirmation']) {
      this.confirmation = nav.extras.state['confirmation'];
    }
  }

  ngOnInit() {
    if (!this.confirmation) {
      // In a real app we might fetch it from the backend using the token if state is lost on refresh
      // For MVP, we can just show a generic success message or redirect back to form
    }
  }
}
