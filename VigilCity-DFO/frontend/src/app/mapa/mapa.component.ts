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
import { finalize } from 'rxjs/operators';

// Definir el tipo de datos para los marcadores
type Marker = {
  id?: string;
  lat: number;
  lng: number;
  isCurrentLocation?: boolean;
  description?: string;
  category?: string;
  isDeleting?: boolean;
  ratingPromedio?: number;
  cantidadRatings?: number;
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
    :host {
      display: block;
      height: 95vh;  /* Esto hará que el componente ocupe el 95% de la altura de la ventana */
    }

    :host ::ng-deep .map-container {
      width: 100%;
      height: 100%;
      position: absolute;
    }

    :host ::ng-deep google-map {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }

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

  // Agregar una propiedad para mantener referencia a la ventana de información activa
  private activeInfoWindow: google.maps.InfoWindow | null = null;

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
      console.log('Marcador eliminado del mapa');
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
          const nuevoReporte = {
            descripcion: result.description,
            latitud: lat,
            longitud: lng,
            categoria: result.category
          };

          console.log('Enviando nuevo reporte:', nuevoReporte);

          this.reporteService.grabarReporte(nuevoReporte).subscribe({
            next: (response) => {
              console.log('Respuesta completa del servidor:', response);
              
              if (!response.id) {
                console.error('El servidor no devolvió un ID');
                return;
              }

              const marker: Marker = {
                id: response.id,
                lat: lat,
                lng: lng,
                description: result.description,
                category: result.category
              };

              console.log('Nuevo marcador creado:', marker);
              this.markers.push(marker);
            },
            error: (error) => {
              console.error('Error detallado al grabar reporte:', error);
              if (error.error) {
                console.error('Mensaje del servidor:', error.error);
              }
              if (error.status) {
                console.error('Código de estado HTTP:', error.status);
              }
              alert('Error al grabar el reporte. Por favor, intente nuevamente.');
            }
          });
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

        // Consultar reportes cercanos una vez que tengamos la ubicación
        this.reporteService.consultarReportes(this.lat, this.lng).subscribe({
          next: (reportes) => {
            console.log('Reportes cercanos obtenidos:', reportes);
            // Convertir los reportes a marcadores y agregarlos al array existente
            const marcadoresCercanos: Marker[] = reportes.map(reporte => ({
              id: reporte.id,
              lat: Number(reporte.latitud),  // Convertir explícitamente a número
              lng: Number(reporte.longitud), // Convertir explícitamente a número
              description: reporte.descripcion,
              category: reporte.categoria,
              ratingPromedio: reporte.ratingPromedio,
              cantidadRatings: reporte.cantidadRatings
            }));
            
            console.log('Marcadores convertidos:', marcadoresCercanos);
            // Agregar los nuevos marcadores al array existente
            this.markers.push(...marcadoresCercanos);
          },
          error: (error) => {
            console.error('Error al consultar reportes cercanos:', error);
          }
        });
      }, (error) => {
        console.error("Error al obtener la ubicación: ", error);
        alert("No se pudo obtener la ubicación.");
      });
    }
  }

  onSubmitForm() {
    const nuevoReporte = {
      descripcion: this.formData.description || '',
      latitud: this.formData.lat,
      longitud: this.formData.lng,
      categoria: this.formData.category || ''
    };
    
    console.log('Intentando grabar reporte:', nuevoReporte);
    console.log('URL API:', this.reporteService['apiUrl']); // Para verificar la URL

    this.reporteService.grabarReporte(nuevoReporte).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        const newMarker: Marker = {
          lat: this.formData.lat,
          lng: this.formData.lng,
          description: this.formData.description || '',
          category: this.formData.category || ''
        };
        this.markers.push(newMarker);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error detallado al grabar el reporte:', error);
        if (error.error) {
          console.error('Mensaje del servidor:', error.error);
        }
        if (error.status) {
          console.error('Código de estado HTTP:', error.status);
        }
      }
    });
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
    // Cerrar la ventana de información activa si existe
    if (this.activeInfoWindow) {
      this.activeInfoWindow.close();
    }

    // Crear la nueva ventana de información
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

    // Guardar referencia a la ventana activa
    this.activeInfoWindow = infoWindow;

    (window as any).openComments = () => {
      infoWindow.close();
      console.log('Abriendo diálogo con marcador:', marker);
      
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '500px',
        data: {
          marker: {
            id: marker.id,
            category: marker.category,
            description: marker.description,
            lat: marker.lat,
            lng: marker.lng,
            ratingPromedio: marker.ratingPromedio,
            cantidadRatings: marker.cantidadRatings
          },
          onDelete: () => this.onDelete(marker)
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.removeMarker(marker);
        }
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
    if (!marker.id) {
      console.error('No se puede eliminar: el marcador no tiene ID', marker);
      return;
    }

    // Evitar múltiples eliminaciones del mismo marcador
    if (marker.isDeleting) {
      console.log('Ya se está procesando la eliminación de este marcador');
      return;
    }

    marker.isDeleting = true; // Flag para evitar múltiples eliminaciones

    console.log('Iniciando eliminación del marcador:', marker.id);
    
    this.reporteService.eliminarReporte(marker.id)
      .pipe(
        finalize(() => {
          marker.isDeleting = false; // Limpiar el flag al finalizar
        })
      )
      .subscribe({
        next: () => {
          console.log('Marcador eliminado exitosamente');
          this.removeMarker(marker);
          this.dialog.closeAll();
        },
        error: (error) => {
          // Si ya fue eliminado (404), considerarlo como éxito
          if (error.status === 404) {
            console.log('El marcador ya fue eliminado previamente');
            this.removeMarker(marker);
            this.dialog.closeAll();
          } else {
            console.error('Error al eliminar el marcador:', error);
            alert('Error al eliminar el marcador');
          }
        }
      });
  }
}