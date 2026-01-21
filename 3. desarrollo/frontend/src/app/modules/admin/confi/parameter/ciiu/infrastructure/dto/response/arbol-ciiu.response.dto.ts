/**
 * DTO de respuesta para Árbol CIIU (desde backend)
 */
export interface ArbolCiiuResponseDto {
  nivel: number;
  id: number;
  parent_id: number | null;
  codigo: string;
  descripcion: string;
  tipo: 'seccion' | 'division' | 'grupo' | 'clase' | 'subclase' | 'actividad';
  semaf_cod?: number | null;
  semaf_des?: string | null;
}

