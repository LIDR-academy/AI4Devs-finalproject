/**
 * Entidad de dominio AutorizacionTemporal
 * Representa una autorización temporal de acceso fuera del horario
 */
export class AutorizacionTemporalEntity {
  constructor(
    public readonly id: number,
    public readonly usuarioId: number,
    public readonly fecha: Date,
    public readonly horaInicio: string,
    public readonly minutosAutorizados: number,
    public readonly usuarioAutorizadorId: number,
    public readonly motivoAutorizacion: string,
    public readonly activo: boolean,
  ) {}

  /**
   * Verifica si la autorización está activa
   */
  estaActiva(): boolean {
    return this.activo;
  }

  /**
   * Verifica si la autorización está vigente para una fecha y hora específicas
   */
  estaVigente(fecha: Date, hora: string): boolean {
    if (!this.estaActiva()) return false;

    // Verificar que la fecha coincida
    const fechaAuth = new Date(this.fecha);
    const fechaCheck = new Date(fecha);
    
    if (
      fechaAuth.getFullYear() !== fechaCheck.getFullYear() ||
      fechaAuth.getMonth() !== fechaCheck.getMonth() ||
      fechaAuth.getDate() !== fechaCheck.getDate()
    ) {
      return false;
    }

    // Verificar que la hora esté dentro del rango autorizado
    const [horaInicio, minutosInicio] = this.horaInicio.split(':').map(Number);
    const [horaCheck, minutosCheck] = hora.split(':').map(Number);

    const minutosInicioTotal = horaInicio * 60 + minutosInicio;
    const minutosCheckTotal = horaCheck * 60 + minutosCheck;
    const minutosFinTotal = minutosInicioTotal + this.minutosAutorizados;

    return minutosCheckTotal >= minutosInicioTotal && minutosCheckTotal <= minutosFinTotal;
  }
}

