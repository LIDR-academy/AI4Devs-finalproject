import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-import-step',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step-container">
      <h2>Import Guests</h2>
      <p class="subtitle">Your event has been created! Let's invite some people.</p>

      <div class="empty-state">
        <div class="icon">👥</div>
        <h3>No Guests Yet</h3>
        <p>You can import guests from a CSV file or add them manually later.</p>
        <button class="btn btn-outline" disabled>Import CSV (Coming Soon)</button>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="back.emit()">Back</button>
        <button class="btn btn-primary" (click)="complete.emit()">Finish</button>
      </div>
    </div>
  `,
  styles: [`
    .step-container { padding: 1rem 0; text-align: center; }
    h2 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }

    .empty-state {
      background: #f9f9f9;
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 3rem 2rem;
      max-width: 500px;
      margin: 0 auto 2rem;
    }

    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      max-width: 500px;
      margin: 0 auto;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
    
    .btn-outline {
      background: transparent;
      border: 2px solid #ccc;
      color: #666;
    }

    .btn-primary {
      background: #000;
      color: #fff;
    }
  `]
})
export class GuestImportStepComponent {
  @Output() back = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();
}
