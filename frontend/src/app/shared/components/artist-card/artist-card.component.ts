import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ShowcaseItem } from '../../../core/models/showcase.models';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatIconModule],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
  readonly item = input.required<ShowcaseItem>();
}
