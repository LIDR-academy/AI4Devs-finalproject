import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SponsorBadge } from '../../../core/models/showcase.models';

const MAX_VISIBLE_BADGES = 3;

@Component({
  selector: 'app-sponsor-badges',
  standalone: true,
  templateUrl: './sponsor-badges.component.html',
  styleUrl: './sponsor-badges.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorBadgesComponent {
  readonly badges = input<SponsorBadge[]>([]);

  private readonly failedLogos = signal<ReadonlySet<string>>(new Set());

  readonly visibleBadges = computed(() => this.badges().slice(0, MAX_VISIBLE_BADGES));
  readonly hiddenCount = computed(() => Math.max(0, this.badges().length - MAX_VISIBLE_BADGES));

  showLogo(badge: SponsorBadge): boolean {
    return !!badge.brandLogoUrl && !this.failedLogos().has(badge.brandName);
  }

  onLogoError(badge: SponsorBadge): void {
    this.failedLogos.update(failed => new Set(failed).add(badge.brandName));
  }
}
