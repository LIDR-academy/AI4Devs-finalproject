import { Component, Input, computed, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestExportDto } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-guest-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="guest-table-container">
      <div class="filters">
        <label for="rsvpFilter">Filter by RSVP:</label>
        <select id="rsvpFilter" [value]="filterStatus()" (change)="onFilterChange($event)">
          <option value="All">All</option>
          <option value="Yes">Confirmed</option>
          <option value="No">Declined</option>
          <option value="Maybe">Maybe</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>RSVP Status</th>
              <th>Transport</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let guest of filteredGuests()">
              <td>
                <div class="guest-name">{{ guest.name }}</div>
                <div class="guest-contact" *ngIf="guest.email || guest.phone">
                  {{ guest.email }} {{ guest.email && guest.phone ? '•' : '' }} {{ guest.phone }}
                </div>
              </td>
              <td>{{ guest.category }}</td>
              <td>
                <span class="badge" [ngClass]="getBadgeClass(guest.rsvpStatus)">
                  {{ guest.rsvpStatus === 'Yes' ? 'Confirmed' : guest.rsvpStatus === 'No' ? 'Declined' : guest.rsvpStatus }}
                </span>
              </td>
              <td>{{ guest.transportNeeds ? 'Yes' : 'No' }}</td>
            </tr>
            <tr *ngIf="filteredGuests().length === 0">
              <td colspan="4" class="text-center py-4 text-gray">No guests found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .guest-table-container {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-top: 1.5rem;
    }
    .filters {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .filters select {
      padding: 0.5rem;
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .table th {
      padding: 0.75rem 1rem;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      color: #374151;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .table td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #111827;
      vertical-align: top;
    }
    .guest-name {
      font-weight: 500;
    }
    .guest-contact {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-green { background-color: #d1fae5; color: #065f46; }
    .badge-red { background-color: #fee2e2; color: #991b1b; }
    .badge-yellow { background-color: #fef3c7; color: #92400e; }
    .badge-gray { background-color: #f3f4f6; color: #374151; }
    .text-center { text-align: center; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .text-gray { color: #6b7280; }
  `]
})
export class GuestTableComponent implements OnChanges {
  @Input() guests: GuestExportDto[] = [];
  
  filterStatus = signal('All');
  
  filteredGuests = computed(() => {
    const status = this.filterStatus();
    if (status === 'All') return this.guests;
    return this.guests.filter(g => g.rsvpStatus === status);
  });

  ngOnChanges() {
    // Component will automatically update `guests` reference which re-evaluates `filteredGuests`
  }

  onFilterChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.filterStatus.set(target.value);
  }

  getBadgeClass(status: string): string {
    switch(status) {
      case 'Yes': return 'badge-green';
      case 'No': return 'badge-red';
      case 'Maybe': return 'badge-yellow';
      default: return 'badge-gray';
    }
  }
}
