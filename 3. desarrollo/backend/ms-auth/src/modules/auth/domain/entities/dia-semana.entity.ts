/**
 * Entidad de dominio DiaSemana
 * Catálogo de días de la semana (datos estáticos)
 */
export class DiaSemanaEntity {
  constructor(
    public readonly id: number, // 1-7
    public readonly nombre: string, // Lunes, Martes...
    public readonly abreviacion: string, // LUN, MAR...
    public readonly numeroOrden: number, // 1=Monday, 7=Sunday
  ) {}
}

