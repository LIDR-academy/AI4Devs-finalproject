import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ArtistCard, ShowcaseItem } from '../../../core/models/showcase.models';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatIconModule],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
  readonly item = input<ShowcaseItem | null>(null);
  readonly artist = input<ArtistCard | null>(null);

  readonly cardArtist = computed(() => this.artist() ?? this.item()?.artist ?? null);
  readonly cardImage = computed(() => this.item()?.imageUrl ?? this.cardArtist()?.featuredImageUrl ?? this.cardArtist()?.profilePhotoUrl ?? '');
  readonly cardStyle = computed(() => this.item()?.style ?? this.cardArtist()?.styles[0] ?? 'Sin estilo');
}
