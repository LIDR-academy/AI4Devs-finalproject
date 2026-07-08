import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [ngClass]="getClasses()"
      class="inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() customClass = '';
  @Output() onClick = new EventEmitter<MouseEvent>();

  getClasses(): string {
    const baseClasses = 'px-4 py-2 ';
    let variantClasses = '';
    
    switch (this.variant) {
      case 'primary':
        variantClasses = 'bg-primary text-text-inverse hover:bg-primary-dark focus:ring-primary';
        break;
      case 'secondary':
        variantClasses = 'bg-card-bg text-text-primary border border-border hover:bg-bg-surface focus:ring-secondary';
        break;
      case 'ghost':
        variantClasses = 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface focus:ring-border';
        break;
      case 'danger':
        variantClasses = 'bg-error text-text-inverse hover:opacity-90 focus:ring-error';
        break;
    }
    
    const disabledClasses = this.disabled ? 'opacity-50 cursor-not-allowed ' : '';
    
    return baseClasses + variantClasses + ' ' + disabledClasses + this.customClass;
  }
}
