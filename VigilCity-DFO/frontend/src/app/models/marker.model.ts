export interface Marker {
    id?: string;      // ID del reporte en la base de datos
    lat: number;      // Latitud
    lng: number;      // Longitud
    description?: string;  // Descripción
    category?: string;    // Categoría
  }