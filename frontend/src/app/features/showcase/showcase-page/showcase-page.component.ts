import { Component, OnInit, inject, signal } from '@angular/core';
import { ShowcaseSectionComponent } from '../../../shared/components/showcase-section/showcase-section.component';
import { ShowcaseService } from '../showcase.service';
import { ShowcaseSection } from '../../../core/models/showcase.models';

@Component({
  selector: 'app-showcase-page',
  standalone: true,
  imports: [ShowcaseSectionComponent],
  templateUrl: './showcase-page.component.html',
  styleUrl: './showcase-page.component.scss'
})
export class ShowcasePageComponent implements OnInit {
  private readonly showcaseService = inject(ShowcaseService);

  readonly sections = signal<ShowcaseSection[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.fetchSections(pos.coords.latitude, pos.coords.longitude),
        () => this.fetchSections()
      );
    } else {
      this.fetchSections();
    }
  }

  fetchSections(lat?: number, lng?: number): void {
    this.showcaseService.getShowcase(lat, lng).subscribe({
      next: (data) => {
        this.sections.set(data.sections);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la vitrina. Inténtalo de nuevo más tarde.');
        this.loading.set(false);
      }
    });
  }
}
