import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces para los tipos de datos
interface Rating {
  id?: string;
  reporteId: string;
  valor: number;
  comentario: string;
}

interface RatingUpdate {
  comentario: string;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.authToken}`
    });
  }

  // Crear un nuevo rating
  crearRating(rating: Rating): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, rating, {
      headers: this.getHeaders()
    });
  }

  // Editar un rating existente
  editarRating(id: string, update: RatingUpdate): Observable<Rating> {
    return this.http.put<Rating>(`${this.apiUrl}/${id}`, update, {
      headers: this.getHeaders()
    });
  }

  // Consultar todos los ratings de un reporte
  consultarRatingsPorReporte(reporteId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/report/${reporteId}`, {
      headers: this.getHeaders()
    });
  }
}
