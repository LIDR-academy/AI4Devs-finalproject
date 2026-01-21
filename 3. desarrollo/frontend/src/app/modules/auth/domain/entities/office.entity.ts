/**
 * Entidad de dominio para Oficina
 * Representa una oficina de la cooperativa
 */
export class OfficeEntity {
  constructor(
    public readonly id: number,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly direccion: string,
    public readonly activo: boolean
  ) {}

  /**
   * Obtiene el nombre completo de la oficina con su código
   */
  getNombreCompleto(): string {
    return `${this.codigo} - ${this.nombre}`;
  }

  /**
   * Obtiene la descripción completa con dirección
   */
  getDescripcionCompleta(): string {
    return `${this.nombre} - ${this.direccion}`;
  }
}

