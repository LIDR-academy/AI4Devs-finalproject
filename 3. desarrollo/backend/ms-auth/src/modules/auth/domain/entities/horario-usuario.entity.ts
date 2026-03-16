/**
 * Entidad de dominio HorarioUsuario
 * Representa el horario de acceso de un usuario para un día específico
 */
export class HorarioUsuarioEntity {
  constructor(
    public readonly id: number,
    public readonly usuarioId: number,
    public readonly diaSemanaId: number,
    public readonly horaInicio: string,
    public readonly horaFin: string,
    public readonly activo: boolean,
  ) {}
}

