import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card">
      <div class="stats-card-header">
        <h3 class="stats-card-title">{{ title }}</h3>
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="stats-card-value" [ngClass]="colorClass">{{ value }}</div>
    </div>
  `,
  styles: [`
    .stats-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .stats-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #6b7280;
    }
    .stats-card-title {
      font-family: 'Inter', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stats-card-value {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 600;
      color: #111827;
    }
    .text-green { color: #10b981; }
    .text-red { color: #ef4444; }
    .text-yellow { color: #f59e0b; }
    .text-gray { color: #6b7280; }
  `]
})
export class StatsCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: number | string;
  @Input() colorClass: string = '';
}
