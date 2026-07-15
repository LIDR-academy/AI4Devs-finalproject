import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-certification-badge',
  standalone: true,
  templateUrl: './certification-badge.component.html',
  styleUrl: './certification-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificationBadgeComponent {
  readonly isCertified = input.required<boolean>();
  readonly size = input<'sm' | 'md'>('sm');
}
