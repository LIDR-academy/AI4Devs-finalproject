import { Component, Input } from '@angular/core';

@Component({
  selector: 'btn-secondary',
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.scss',
  standalone: false
})
export class ButtonSecondaryComponent {
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() label: string = 'Cancelar';
  @Input() icon: string = 'x-mark';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() shortcut: string = '';
}
