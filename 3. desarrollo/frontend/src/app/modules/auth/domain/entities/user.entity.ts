import { OfficeEntity } from './office.entity';

/**
 * Entidad de dominio para Usuario
 * Representa un usuario del sistema con toda su información y reglas de negocio
 */
export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly uuid: string,
    public readonly username: string,
    public readonly nombreCompleto: string,
    public readonly email: string | null,
    public readonly empresaId: number,
    public readonly oficinaId: number | null,
    public readonly perfilId: number,
    public readonly tipoUsuario: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA',
    public readonly esAdmin: boolean,
    public readonly accesoGlobal: boolean,
    public readonly requiereCambioPassword: boolean,
    public readonly oficinasPermitidas: OfficeEntity[] = []
  ) {}

  /**
   * Verifica si el usuario necesita seleccionar una oficina
   * Los contadores y usuarios con múltiples oficinas deben seleccionar
   */
  necesitaSeleccionarOficina(): boolean {
    return this.esContador() || this.oficinasPermitidas.length > 1;
  }

  /**
   * Verifica si el usuario es contador
   */
  esContador(): boolean {
    // TODO: Implementar lógica basada en perfilId o tipoUsuario
    // Por ahora retornamos false, se debe ajustar según reglas de negocio
    return false;
  }

  /**
   * Verifica si el usuario tiene acceso global
   */
  tieneAccesoGlobal(): boolean {
    return this.accesoGlobal || this.esAdmin;
  }
}

