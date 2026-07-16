import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { SponsorshipDto, SponsorshipRelationType } from '../../../../core/models/artist-profile.models';

const RELATION_LABELS: Record<SponsorshipRelationType, string> = {
  ambassador: 'Embajador',
  sponsored: 'Auspiciado',
  certified: 'Certificado'
};

@Component({
  selector: 'app-sponsorship-section',
  standalone: true,
  templateUrl: './sponsorship-section.component.html',
  styleUrl: './sponsorship-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SponsorshipSectionComponent {
  readonly sponsorships = input<SponsorshipDto[]>([]);

  private readonly failedLogos = signal<ReadonlySet<string>>(new Set());

  relationLabel(type: SponsorshipRelationType): string {
    return RELATION_LABELS[type] ?? type;
  }

  showFallback(sponsorship: SponsorshipDto): boolean {
    return !sponsorship.brandLogoUrl || this.failedLogos().has(sponsorship.id);
  }

  onLogoError(sponsorship: SponsorshipDto): void {
    this.failedLogos.update(failed => new Set(failed).add(sponsorship.id));
  }

  brandInitial(brandName: string): string {
    return brandName.charAt(0).toUpperCase();
  }
}
