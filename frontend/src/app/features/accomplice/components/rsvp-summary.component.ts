import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface RsvpSummary {
  confirmed: number;
  declined: number;
  pending: number;
}

@Component({
  selector: 'app-rsvp-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rsvp-summary" *ngIf="summary">
      <h3>RSVP Summary</h3>
      <div class="stats-grid">
        <div class="stat-card confirmed">
          <span class="value">{{ summary.confirmed }}</span>
          <span class="label">Confirmed</span>
        </div>
        <div class="stat-card declined">
          <span class="value">{{ summary.declined }}</span>
          <span class="label">Declined</span>
        </div>
        <div class="stat-card pending">
          <span class="value">{{ summary.pending }}</span>
          <span class="label">Pending</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rsvp-summary {
      margin-top: 2rem;
      width: 100%;
    }

    h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .stat-card {
      background-color: var(--surface-light);
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .stat-card .value {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }

    .stat-card .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    .stat-card.confirmed .value { color: #059669; }
    .stat-card.declined .value { color: #dc2626; }
    .stat-card.pending .value { color: #d97706; }
  `]
})
export class RsvpSummaryComponent implements OnInit {
  @Input() eventSlug!: string;
  private http = inject(HttpClient);
  
  summary: RsvpSummary | null = null;

  ngOnInit() {
    if (this.eventSlug) {
      this.fetchSummary();
    }
  }

  private fetchSummary() {
    this.http.get<any>(`${environment.apiBaseUrl}/events/${this.eventSlug}/rsvps`).subscribe({
      next: (res) => {
        const rsvps: any[] = res || [];
        this.summary = {
          confirmed: rsvps.filter(r => r.status === 'Confirmed').length,
          declined: rsvps.filter(r => r.status === 'Declined').length,
          pending: rsvps.filter(r => r.status === 'Pending').length
        };
      },
      error: () => {
        // Handle gracefully, might not have permission
        this.summary = { confirmed: 0, declined: 0, pending: 0 };
      }
    });
  }
}
