/**
 * Entidad de dominio para Sesión
 * Representa una sesión activa del usuario
 */
export class SessionEntity {
  constructor(
    public readonly id: string,
    public readonly device: string,
    public readonly ip: string,
    public readonly lastActivity: Date,
    public readonly current: boolean
  ) {}

  /**
   * Verifica si la sesión está activa (última actividad reciente)
   * Considera activa si la última actividad fue hace menos de 30 minutos
   */
  estaActiva(): boolean {
    const ahora = new Date();
    const diferencia = ahora.getTime() - this.lastActivity.getTime();
    const minutos = diferencia / (1000 * 60);
    return minutos < 30;
  }

  /**
   * Obtiene el tiempo transcurrido desde la última actividad en formato legible
   */
  getTiempoDesdeUltimaActividad(): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - this.lastActivity.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'Hace unos momentos';
  }
}

