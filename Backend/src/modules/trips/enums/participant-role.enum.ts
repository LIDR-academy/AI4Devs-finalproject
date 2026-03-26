/**
 * Enum que representa los roles contextuales de un participante en un viaje.
 * Los roles son específicos por viaje, no globales al usuario.
 */
export enum ParticipantRole {
  /**
   * Creador del viaje. Tiene permisos completos de administración.
   */
  CREATOR = 'CREATOR',

  /**
   * Miembro del viaje. Puede agregar gastos pero no administrar el viaje.
   */
  MEMBER = 'MEMBER',
}
