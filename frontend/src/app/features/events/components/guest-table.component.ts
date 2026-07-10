import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { GuestResponse } from '../../../core/services/guest.service';
import { ButtonComponent } from '../../../shared/components/button.component';

@Component({
  selector: 'app-guest-table',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonComponent],
  template: `
    <div class="table-container">
      <table class="guest-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Category</th>
            <th>RSVP Status</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="guests.length === 0">
            <td colspan="6" class="empty-state">No guests found.</td>
          </tr>
          <tr *ngFor="let guest of guests">
            <td><strong>{{ guest.name }}</strong></td>
            <td>{{ guest.email || '-' }}</td>
            <td>{{ guest.phone || '-' }}</td>
            <td>
              <span class="badge" [ngClass]="'badge-' + (guest.category | lowercase)">
                {{ guest.category }}
              </span>
            </td>
            <td>
              <span class="status-badge" [ngClass]="'status-' + (guest.inviteStatus | lowercase)">
                {{ guest.inviteStatus }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="action-btn text-red-500" (click)="onDelete(guest.id)" title="Delete Guest">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      width: 100%;
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: white;
    }
    .guest-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .guest-table th, .guest-table td {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .guest-table th {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .guest-table tbody tr:hover {
      background-color: #f1f5f9;
    }
    .empty-state {
      text-align: center;
      padding: 3rem !important;
      color: #64748b;
      font-style: italic;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-family { background-color: #dbeafe; color: #1e40af; }
    .badge-friends { background-color: #dcfce7; color: #166534; }
    .badge-colleagues { background-color: #fef3c7; color: #92400e; }
    .badge-other { background-color: #f1f5f9; color: #475569; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status-pending { color: #94a3b8; }
    .status-sent { color: #3b82f6; }
    .status-delivered { color: #8b5cf6; }
    .status-opened { color: #14b8a6; }
    .status-failed { color: #ef4444; }

    .actions-header { width: 80px; text-align: right; }
    .actions-cell { text-align: right; }
    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #ef4444;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }
    .action-btn:hover { background-color: #fee2e2; }
    .action-btn svg { width: 1.25rem; height: 1.25rem; }
  `]
})
export class GuestTableComponent {
  @Input() guests: GuestResponse[] = [];
  @Output() deleteGuest = new EventEmitter<string>();

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this guest?')) {
      this.deleteGuest.emit(id);
    }
  }
}
