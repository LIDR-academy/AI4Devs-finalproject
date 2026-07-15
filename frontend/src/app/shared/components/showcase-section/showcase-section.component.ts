import { Component, input } from '@angular/core';
import { ArtistCardComponent } from '../artist-card/artist-card.component';
import { ShowcaseSection } from '../../../core/models/showcase.models';

@Component({
  selector: 'app-showcase-section',
  standalone: true,
  imports: [ArtistCardComponent],
  templateUrl: './showcase-section.component.html',
  styleUrl: './showcase-section.component.scss'
})
export class ShowcaseSectionComponent {
  readonly section = input.required<ShowcaseSection>();
}
