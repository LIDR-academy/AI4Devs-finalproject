import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ArtistCard, ShowcaseItem } from '../../../core/models/showcase.models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { SponsorBadgesComponent } from '../sponsor-badges/sponsor-badges.component';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe, MatIconModule, SponsorBadgesComponent],
  templateUrl: './artist-card.component.html',
  styleUrl: './artist-card.component.scss'
})
export class ArtistCardComponent {
  protected readonly favoritesService = inject(FavoritesService);

  readonly item = input<ShowcaseItem | null>(null);
  readonly artist = input<ArtistCard | null>(null);
  readonly layout = input<'grid' | 'list'>('grid');

  protected readonly stars = [1, 2, 3, 4, 5];

  readonly cardArtist = computed(() => this.artist() ?? this.item()?.artist ?? null);
  readonly cardImage = computed(() => this.item()?.imageUrl ?? this.cardArtist()?.featuredImageUrl ?? this.cardArtist()?.profilePhotoUrl ?? '');
  readonly cardStyles = computed(() => this.cardArtist()?.styles.slice(0, this.layout() === 'list' ? 4 : 2) ?? []);
  readonly roundedRating = computed(() => Math.round(this.cardArtist()?.averageRating ?? 0));
  readonly isFavorite = computed(() => {
    const id = this.cardArtist()?.id;
    return id != null && this.favoritesService.favorites().has(id);
  });
  readonly formattedRate = computed(() => {
    const rate = this.cardArtist()?.hourlyRate;
    return rate != null ? '$' + rate.toLocaleString('es-CL') : '';
  });

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const id = this.cardArtist()?.id;
    if (id != null) {
      this.favoritesService.toggle(id);
    }
  }
}
