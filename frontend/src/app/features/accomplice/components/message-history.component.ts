import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LiveMessage } from '../../../core/services/live-message.service';

@Component({
  selector: 'app-message-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="history-container">
      <h3>Sent Messages</h3>
      
      <div *ngIf="messages.length === 0" class="empty-state">
        <p>No messages sent yet.</p>
      </div>

      <div class="message-list">
        <div *ngFor="let msg of messages" class="message-item">
          <div class="message-header">
            <span class="message-time">{{ msg.sentAt | date:'shortTime' }}</span>
            <span class="status-badge" [ngClass]="msg.deliveryStatus.toLowerCase()">
              {{ msg.deliveryStatus }}
            </span>
          </div>
          <p class="message-content">{{ msg.content }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-container {
      margin-top: 2rem;
      width: 100%;
    }
    
    h3 {
      font-size: 1.125rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      background-color: var(--surface-light);
      border-radius: 8px;
      color: var(--text-secondary);
    }

    .message-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-item {
      background-color: var(--surface-light);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .message-time {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .status-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.pending {
      background-color: #fef3c7;
      color: #d97706;
    }

    .status-badge.sent {
      background-color: #d1fae5;
      color: #059669;
    }

    .status-badge.delivered {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .status-badge.failed {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .message-content {
      margin: 0;
      font-size: 0.95rem;
      color: var(--text-primary);
      line-height: 1.4;
    }
  `]
})
export class MessageHistoryComponent {
  @Input() messages: LiveMessage[] = [];
}
