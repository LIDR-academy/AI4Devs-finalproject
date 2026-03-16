import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-primary',
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.scss',
  standalone: false
})
export class IconPrimaryComponent {
  @Input() icon: string = '';

}
