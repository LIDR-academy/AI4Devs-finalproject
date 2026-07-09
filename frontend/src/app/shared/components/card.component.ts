import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="'bg-card-bg rounded-lg shadow-sm border border-border overflow-hidden ' + customClass">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() customClass = '';
}
