import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, map } from 'rxjs/operators';

// Interfaz para crear un nuevo reporte
interface NuevoReporte {
  descripcion: string;
  latitud: number;
  longitud: number;
  categoria: string;
}

// Interfaz para reportes existentes
interface Reporte extends NuevoReporte {
  id: string;
  ratingPromedio: number;
  cantidadRatings: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) { }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.authToken}`
    });
  }

  consultarReportes(latitud: number, longitud: number, rango: number = 1): Observable<Reporte[]> {
    const params = new HttpParams()
      .set('latitud', latitud.toString())
      .set('longitud', longitud.toString())
      .set('rango', rango.toString());

    return this.http.get<Reporte[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: params
    });
  }

  grabarReporte(reporte: NuevoReporte): Observable<Reporte> {
    return this.http.post<Reporte>(this.apiUrl, reporte, { 
      headers: this.getHeaders() 
    });
  }

  eliminarReporte(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('URL de eliminación:', url);
    console.log('Headers:', this.getHeaders().keys());
    
    return this.http.delete<void>(url, { 
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
        console.log('Status:', response.status);
      }),
      map(response => void 0)
    );
  }
}