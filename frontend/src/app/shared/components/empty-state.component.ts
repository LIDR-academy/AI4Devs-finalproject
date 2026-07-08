import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border-light rounded-lg">
      <div *ngIf="icon" class="mb-4 text-text-muted">
        <!-- Optional slot for SVG icon -->
        <ng-content select="[icon]"></ng-content>
      </div>
      <h3 class="text-lg font-heading text-text-primary mb-2">{{ title }}</h3>
      <p class="text-sm text-text-secondary mb-6 max-w-sm">{{ description }}</p>
      <ng-content select="[actions]"></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'No data available';
  @Input() description = 'There is currently no data to display in this section.';
  @Input() icon = false;
}
