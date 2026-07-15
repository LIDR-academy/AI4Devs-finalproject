import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DashboardService, DashboardStatsResponse } from '../../../core/services/dashboard.service';
import { StatsCardComponent } from '../components/stats-card.component';
import { GuestTableComponent } from '../components/guest-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { Subscription, interval, switchMap, startWith, catchError, of } from 'rxjs';

@Component({
  selector: 'app-control-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatsCardComponent, GuestTableComponent, EmptyStateComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Event Dashboard</h1>
        <button class="btn btn-primary" (click)="exportCsv()" [disabled]="!stats() || stats()!.totalInvited === 0">
          Export CSV
        </button>
      </div>

      <ng-container *ngIf="stats() as data; else loading">
        
        <!-- Empty State: No guests -->
        <app-empty-state 
          *ngIf="data.totalInvited === 0"
          title="Add guests to get started"
          description="You haven't added any guests yet. Once you add guests, their RSVP stats will appear here."
          [icon]="true">
          <span icon class="material-icons">group</span>
        </app-empty-state>

        <!-- Empty State: No RSVPs yet -->
        <app-empty-state 
          *ngIf="data.totalInvited > 0 && data.confirmed === 0 && data.declined === 0 && data.maybe === 0"
          title="Waiting for responses"
          description="Your guests haven't responded yet. Stats will update automatically as responses come in."
          [icon]="true">
          <span icon class="material-icons">schedule</span>
        </app-empty-state>

        <ng-container *ngIf="data.totalInvited > 0 && (data.confirmed > 0 || data.declined > 0 || data.maybe > 0)">
          
          <!-- Stats Cards -->
          <div class="stats-grid">
            <app-stats-card title="Total Invited" [value]="data.totalInvited">
              <span icon class="material-icons">people</span>
            </app-stats-card>
            <app-stats-card title="Confirmed" [value]="data.confirmed" colorClass="text-green">
              <span icon class="material-icons">check_circle</span>
            </app-stats-card>
            <app-stats-card title="Declined" [value]="data.declined" colorClass="text-red">
              <span icon class="material-icons">cancel</span>
            </app-stats-card>
            <app-stats-card title="Pending" [value]="data.pending" colorClass="text-yellow">
              <span icon class="material-icons">pending</span>
            </app-stats-card>
          </div>

          <!-- Additional Panels -->
          <div class="panels-grid mt-6">
            <div class="panel">
              <h3>Dietary Restrictions</h3>
              <ul *ngIf="data.dietaryRestrictions.length > 0; else noDietary">
                <li *ngFor="let res of data.dietaryRestrictions">
                  <strong>{{ res.guestName }}:</strong> {{ res.restrictions }}
                </li>
              </ul>
              <ng-template #noDietary>
                <p class="text-gray">No dietary restrictions reported.</p>
              </ng-template>
            </div>

            <div class="panel">
              <h3>Logistics Needs</h3>
              <div class="logistic-stat">
                <span class="material-icons">directions_bus</span>
                <span>{{ data.transportNeedsCount }} guests need transport</span>
              </div>
              <div class="logistic-stat mt-2">
                <span class="material-icons">group_add</span>
                <span>{{ data.plusOneCount }} guests bringing a +1</span>
              </div>
            </div>
          </div>

          <!-- Guest List Table -->
          <app-guest-table [guests]="data.guestList"></app-guest-table>

        </ng-container>
      </ng-container>

      <ng-template #loading>
        <div class="loading-state">Loading dashboard...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .panels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    .panel {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .panel h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 1.125rem;
      color: #374151;
    }
    .panel ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    .panel li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .panel li:last-child {
      border-bottom: none;
    }
    .logistic-stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #4b5563;
    }
    .mt-6 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-weight: 500;
    }
    .btn-primary {
      background-color: #4f46e5;
      color: white;
    }
    .btn-primary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
    .text-gray { color: #6b7280; }
    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }
  `]
})
export default class ControlDashboardPageComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private route = inject(ActivatedRoute);

  stats = signal<DashboardStatsResponse | null>(null);
  eventSlug = '';
  private pollingSub?: Subscription;

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      this.eventSlug = params.get('slug') || '';
      if (this.eventSlug) {
        this.startPolling();
      }
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  private startPolling() {
    this.pollingSub = interval(5000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getDashboardStats(this.eventSlug).pipe(
        catchError(err => {
          console.error('Error fetching dashboard stats', err);
          return of(null);
        })
      ))
    ).subscribe(response => {
      if (response) {
        this.stats.set(response);
      }
    });
  }

  exportCsv() {
    if (this.eventSlug) {
      this.dashboardService.exportGuestListCsv(this.eventSlug).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `guests-${this.eventSlug}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: (err) => console.error('Error exporting CSV', err)
      });
    }
  }
}
