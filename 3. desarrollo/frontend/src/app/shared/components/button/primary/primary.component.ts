import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'btn-primary',
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.scss',
  standalone: false
})
export class ButtonPrimaryComponent {
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() label: string = 'Guardar';
  @Input() icon: string | null = 'save';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() shortcut: string = '';

}
