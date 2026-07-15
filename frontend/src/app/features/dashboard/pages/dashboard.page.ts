import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { EventResponse } from '../../../core/models/event.model';

@Component({
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h2>Welcome to your Dashboard!</h2>
        <a routerLink="/events/new" style="padding: 0.75rem 1.5rem; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Create New Event</a>
      </div>
      
      @if (loading()) {
        <p>Loading your events...</p>
      } @else if (events().length === 0) {
        <div style="text-align: center; padding: 4rem; background: #f3f4f6; border-radius: 12px;">
          <p style="margin-bottom: 2rem; color: #4b5563;">You don't have any events yet.</p>
          <a routerLink="/events/new" style="padding: 0.75rem 1.5rem; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Create your first Event</a>
        </div>
      } @else {
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
          @for (event of events(); track event.slug) {
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
              <div style="height: 150px; background-size: cover; background-position: center;"
                   [style.background-image]="event.heroImageUrl ? 'url(' + event.heroImageUrl + ')' : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'">
              </div>
              <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                <h3 style="margin-top: 0; margin-bottom: 0.5rem;">{{ event.name }}</h3>
                <p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.875rem;">{{ event.eventDate | date }}</p>
                <div style="margin-top: auto; display: flex; gap: 0.5rem;">
                  <a [routerLink]="['/events', event.slug, 'edit']" 
                     style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; text-decoration: none; color: #374151; font-weight: 500; font-size: 0.875rem; text-align: center; flex: 1;">
                    Edit Event
                  </a>
                  <a [routerLink]="['/events', event.slug, 'guests']" 
                     style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; text-decoration: none; color: #374151; font-weight: 500; font-size: 0.875rem; text-align: center; flex: 1; background-color: #f9fafb;">
                    Guests
                  </a>
                  <a [routerLink]="['/events', event.slug, 'dashboard']" 
                     style="padding: 0.5rem 1rem; border: 1px solid #4f46e5; border-radius: 6px; text-decoration: none; color: #4f46e5; font-weight: 500; font-size: 0.875rem; text-align: center; flex: 1; background-color: #eef2ff;">
                    Stats
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export default class DashboardPage implements OnInit {
  private readonly eventService = inject(EventService);
  
  events = signal<EventResponse[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.loading.set(false);
      }
    });
  }
}
