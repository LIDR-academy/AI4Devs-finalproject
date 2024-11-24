import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'tu_api_url_aqui';

  constructor(private http: HttpClient) {}

  grabarReporte(reporte: any): Observable<any> {
    return this.http.post(this.apiUrl, reporte);
  }
}