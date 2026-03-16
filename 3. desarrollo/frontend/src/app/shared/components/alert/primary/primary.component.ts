import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'alert-primary',
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.scss',
  standalone: false,
  animations: fuseAnimations,
})
export class AlertPrimaryComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() show: boolean = false;
  @Input() showIcon: boolean = false;
  @Input() type: 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error' = 'primary';
}
