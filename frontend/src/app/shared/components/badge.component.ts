import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'pending' | 'confirmed' | 'cancelled' | 'info';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="getClasses()"
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() status: BadgeStatus = 'info';

  getClasses(): string {
    switch (this.status) {
      case 'pending':
        return 'bg-warning-bg text-warning';
      case 'confirmed':
        return 'bg-success-bg text-success';
      case 'cancelled':
        return 'bg-error-bg text-error';
      case 'info':
      default:
        return 'bg-info-bg text-info';
    }
  }
}
