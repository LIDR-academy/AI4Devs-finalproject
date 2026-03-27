export class ObraResponseDto {
  id: string;
  titulo: string;
  director?: string;
  duracion_min: number;
  vibe_mood?: string;
  estado_acceso: string;
  plataforma: {
    nombre: string;
    logo_url?: string;
    permite_iframe: boolean;
  };
  hitos: {
    nombre: string;
    anio?: number;
  }[];
}
