import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { environment } from '../../../environments/environment';
import { GeoFilters, TATTOO_STYLES } from '../../core/models/artist-filter.models';
import { ArtistCard } from '../../core/models/showcase.models';
import { ArtistCardComponent } from '../../shared/components/artist-card/artist-card.component';
import { MapService } from './map.service';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

interface RadiusOption { value: number; label: string; }

const RADIUS_OPTIONS: RadiusOption[] = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 0, label: 'Ciudad' }
];

const SANTIAGO_CENTER: [number, number] = [-33.4489, -70.6693];
const DEFAULT_ZOOM = 13;

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [RouterLink, ArtistCardComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly destroyRef = inject(DestroyRef);
  private readonly mapService = inject(MapService);
  private readonly filterChange$ = new Subject<void>();

  private map: L.Map | null = null;
  private markerClusterGroup: L.MarkerClusterGroup | null = null;
  private userMarker: L.CircleMarker | null = null;

  readonly radiusOptions = RADIUS_OPTIONS;
  readonly tattooStyles = TATTOO_STYLES;

  readonly viewMode = signal<'map' | 'list'>('map');
  readonly selectedRadius = signal<number>(10);
  readonly userLocation = signal<L.LatLngLiteral | null>(null);
  readonly locationLoading = signal(true);
  readonly showFilters = signal(false);

  readonly selectedStyles = signal<string[]>([]);
  readonly minRating = signal<number | undefined>(undefined);
  readonly certifiedOnly = signal<boolean | undefined>(undefined);
  readonly artistType = signal<'independent' | 'studio' | null>(null);

  readonly artists = this.mapService.artists;
  readonly loading = this.mapService.loading;
  readonly error = this.mapService.error;
  readonly artistList = computed(() => this.artists()?.data ?? []);

  constructor() {
    this.filterChange$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadArtists());

    effect(() => {
      const data = this.artistList();
      if (this.map && this.markerClusterGroup) {
        this.updateMarkers(data);
      }
    });
  }

  ngOnInit(): void { this.requestUserLocation(); }

  ngAfterViewInit(): void { this.initializeMap(); }

  setViewMode(mode: 'map' | 'list'): void {
    this.viewMode.set(mode);
    if (mode === 'map') setTimeout(() => this.map?.invalidateSize(), 100);
  }

  onRadiusChange(radius: number): void {
    this.selectedRadius.set(radius);
    this.filterChange$.next();
    this.updateMapZoom(radius);
  }

  toggleFilters(): void { this.showFilters.update(v => !v); }

  onStyleToggle(slug: string, checked: boolean): void {
    const c = this.selectedStyles();
    this.selectedStyles.set(checked ? [...c, slug] : c.filter(s => s !== slug));
    this.filterChange$.next();
  }

  onMinRatingChange(r: number): void {
    this.minRating.set(this.minRating() === r ? undefined : r);
    this.filterChange$.next();
  }

  onCertifiedChange(checked: boolean): void {
    this.certifiedOnly.set(checked ? true : undefined);
    this.filterChange$.next();
  }

  onArtistTypeChange(type: 'independent' | 'studio' | null): void {
    this.artistType.set(type);
    this.filterChange$.next();
  }

  clearAllFilters(): void {
    this.selectedStyles.set([]);
    this.minRating.set(undefined);
    this.certifiedOnly.set(undefined);
    this.artistType.set(null);
    this.filterChange$.next();
  }

  private initializeMap(): void {
    const container = this.mapContainer?.nativeElement;
    if (!container) return;

    this.map = L.map(container, { center: SANTIAGO_CENTER, zoom: DEFAULT_ZOOM, zoomControl: true });

    L.tileLayer(environment.mapTileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.markerClusterGroup = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true
    });
    if (this.markerClusterGroup) this.map.addLayer(this.markerClusterGroup);
  }

  private requestUserLocation(): void {
    if (!navigator.geolocation) { this.locationLoading.set(false); this.useDefaultLocation(); return; }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userLocation.set(loc);
        this.locationLoading.set(false);
        this.map?.setView([loc.lat, loc.lng], DEFAULT_ZOOM);
        this.addUserMarker(loc);
        this.loadArtists();
      },
      () => { this.locationLoading.set(false); this.useDefaultLocation(); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  private useDefaultLocation(): void {
    const loc = { lat: SANTIAGO_CENTER[0], lng: SANTIAGO_CENTER[1] };
    this.userLocation.set(loc);
    this.map?.setView([loc.lat, loc.lng], DEFAULT_ZOOM);
    this.loadArtists();
  }

  private addUserMarker(loc: L.LatLngLiteral): void {
    if (this.userMarker) this.map?.removeLayer(this.userMarker);
    this.userMarker = L.circleMarker([loc.lat, loc.lng], {
      radius: 10, fillColor: '#c9a446', color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9
    }).addTo(this.map!);
    this.userMarker.bindTooltip('Tu ubicación', { permanent: false, direction: 'top' });
  }

  private loadArtists(): void {
    const loc = this.userLocation();
    if (!loc) return;

    const filters: GeoFilters = { lat: loc.lat, lng: loc.lng, radiusKm: this.selectedRadius() };
    const styles = this.selectedStyles();
    if (styles.length > 0) filters.styles = styles;
    if (this.minRating() != null) filters.minRating = this.minRating();
    if (this.certifiedOnly() != null) filters.certified = this.certifiedOnly();
    if (this.artistType()) filters.type = this.artistType();

    this.mapService.loadArtistsByLocation(filters);
  }

  private updateMarkers(artists: ArtistCard[]): void {
    if (!this.markerClusterGroup) return;
    this.markerClusterGroup.clearLayers();
    artists.forEach(a => {
      if (a.latitude == null || a.longitude == null) return;
      this.markerClusterGroup!.addLayer(this.createArtistMarker(a));
    });
  }

  private createArtistMarker(artist: ArtistCard): L.Marker {
    const initials = artist.artistName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const inner = artist.profilePhotoUrl
      ? `<img src="${artist.profilePhotoUrl}" alt="${artist.artistName}" class="marker-photo" />`
      : `<span class="marker-initials">${initials}</span>`;

    const icon = L.divIcon({
      className: 'artist-marker',
      html: `<div class="artist-marker-inner${artist.isCertified ? ' certified' : ''}">${inner}</div>`,
      iconSize: [44, 44], iconAnchor: [22, 44], popupAnchor: [0, -44]
    });

    const marker = L.marker([artist.latitude, artist.longitude], { icon });
    marker.bindPopup(this.buildPopup(artist), { maxWidth: 280, minWidth: 240, className: 'artist-popup' });
    return marker;
  }

  private buildPopup(a: ArtistCard): string {
    const photo = a.profilePhotoUrl
      ? `<img src="${a.profilePhotoUrl}" alt="${a.artistName}" class="popup-photo" />`
      : `<div class="popup-photo-placeholder">${a.artistName.charAt(0)}</div>`;
    const filled = Math.round(a.averageRating);
    const stars = '★'.repeat(filled) + '☆'.repeat(5 - filled);
    const price = a.minSessionPrice.toLocaleString('es-CL');
    const style = a.styles[0] ?? 'Tatuaje';
    return `
      <div class="popup-content">
        <div class="popup-header">${photo}
          <div class="popup-info">
            <h4 class="popup-name">${a.artistName}</h4>
            <div class="popup-rating"><span class="stars">${stars}</span> ${a.averageRating.toFixed(1)}</div>
            <div class="popup-meta">${style} · ${a.commune}</div>
          </div>
        </div>
        <div class="popup-price">Desde $${price}</div>
        <div class="popup-actions">
          <a href="/artista/${a.slug}" class="popup-btn popup-btn--view">Ver perfil</a>
          <a href="/artista/${a.slug}#reservar" class="popup-btn popup-btn--book">Reservar</a>
        </div>
      </div>`;
  }

  private updateMapZoom(radius: number): void {
    if (!this.map) return;
    this.map.setZoom(radius === 0 ? 11 : radius === 1 ? 15 : radius === 5 ? 14 : 13);
  }
}
