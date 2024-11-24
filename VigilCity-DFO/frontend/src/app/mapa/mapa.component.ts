import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '../services/http-client.module';
import { MarkerFormDialogComponent } from '../marker-form-dialog/marker-form-dialog.component';
import { CommentsDialogComponent } from '../comments-dialog/comments-dialog.component';
import { ReporteService } from '../services/reporte.service';

// Definir el tipo de datos para los marcadores
type Marker = {
  lat: number;
  lng: number;
  isCurrentLocation?: boolean;
  description?: string;
  category?: string;
};

// Agregar al inicio del archivo junto con los otros tipos
interface NuevoReporte {
  descripcion: string;
  latitud: number;
  longitud: number;
  categoria: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GoogleMapsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommentsDialogComponent,
    HttpClientModule
  ],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css'],
  styles: [`
    :host ::ng-deep .info-window-content {
      padding: 10px;
      min-width: 250px;
    }

    :host ::ng-deep .button-container {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      justify-content: flex-end;
    }

    :host ::ng-deep .custom-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
    }

    :host ::ng-deep .comments-button {
      background-color: #3f51b5;
      color: white;
    }

    :host ::ng-deep .delete-button {
      background-color: #f44336;
      color: white;
    }

    :host ::ng-deep .custom-button:hover {
      opacity: 0.9;
    }
  `]
})
export class MapaComponent implements OnInit {
  lat = 0;
  lng = 0;
  zoom = 15;
  markers: Marker[] = [];
  currentLocationMarker: Marker | null = null;
  infoWindowContent = '';
  google: any = google;

  // Nuevas propiedades para el formulario
  showForm = false;
  formData: {
    description: string;
    lat: number;
    lng: number;
    category: string;
  } = {
    description: '',
    lat: 0,
    lng: 0,
    category: ''
  };

  categories = [
    'Iluminación',
    'Robo',
    'Vandalismo',
    'Drogadicción',
    'Vías en mal estado',
    'Asalto en transporte público',
    'Esquina peligrosa'
  ];

  selectedMarker: Marker | null = null;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP,
  };

  constructor(private dialog: MatDialog, private reporteService: ReporteService) {
    this.google = google;
  }

  ngOnInit() {
    this.getLocation();
  }

  removeMarker(marker: Marker) {
    const index = this.markers.indexOf(marker);
    if (index > -1) {
      this.markers.splice(index, 1);
    }
  }

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      const dialogRef = this.dialog.open(MarkerFormDialogComponent, {
        data: {
          lat: lat,
          lng: lng,
          description: '',
          category: ''
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const marker: Marker = {
            lat: result.lat,
            lng: result.lng,
            description: result.description,
            category: result.category
          };
          this.markers.push(marker);
        }
      });
    }
  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.currentLocationMarker = {
          lat: this.lat,
          lng: this.lng,
          isCurrentLocation: true
        };
      }, (error) => {
        console.error("Error al obtener la ubicación: ", error);
        alert("No se pudo obtener la ubicación.");
      });
    }
  }

  onSubmitForm() {
    const newMarker: Marker = {
      lat: this.formData.lat,
      lng: this.formData.lng,
      description: this.formData.description || '',
      category: this.formData.category || ''
    };
    
    this.markers.push(newMarker);
    
    const nuevoReporte: NuevoReporte = {
      descripcion: newMarker.description || '',
      latitud: newMarker.lat,
      longitud: newMarker.lng,
      categoria: newMarker.category || ''
    };
    
    this.reporteService.grabarReporte(nuevoReporte).subscribe(response => {
      console.log('Reporte grabado:', response);
    }, error => {
      console.error('Error al grabar el reporte:', error);
    });

    this.resetForm();
  }

  onCancelForm() {
    this.resetForm();
  }

  private resetForm() {
    this.showForm = false;
    this.formData = {
      description: '',
      lat: 0,
      lng: 0,
      category: ''
    };
  }

  getInfoContent(marker: Marker): string {
    return `
      <div style="padding: 10px;">
        <strong>${marker.category}</strong><br>
        ${marker.description}
      </div>
    `;
  }

  onMarkerClick(marker: Marker, mapMarker: MapMarker) {
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <strong>${marker.category}</strong><br>
          ${marker.description}<br>
          <div style="margin-top: 10px;">
            <button onclick="window.openComments()">Ver Comentarios</button>
          </div>
        </div>
      `
    });

    (window as any).openComments = () => {
      infoWindow.close();
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '500px',
        data: { marker: marker, onDelete: () => this.onDelete(marker) }
      });
    };

    infoWindow.open({
      anchor: mapMarker.marker,
      shouldFocus: false,
    });
  }

  onMouseOver(marker: Marker, mapMarker: MapMarker) {
    console.log('Mouse enter:', marker);
    this.selectedMarker = marker;
    this.infoWindowContent = `
      <div style="padding: 8px;">
        <strong>${marker.category}</strong><br>
        ${marker.description}
      </div>
    `;
    this.infoWindow.open(mapMarker);
  }

  onMouseOut() {
    console.log('Mouse leave');
    if (this.infoWindow) {
      this.infoWindow.close();
    }
  }

  onDelete(marker: Marker) {
    this.removeMarker(marker);
  }
}