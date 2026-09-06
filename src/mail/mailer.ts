/**
 * Puerto de salida de correo.
 *
 * No vive en `src/repositories` a propósito: ese directorio declara en su README que
 * guarda **interfaces de persistencia**, y enviar un correo no persiste nada. El
 * patrón sí es el mismo —puerto aquí, adaptador al lado, dependencia por parámetro en
 * el caso de uso—, así que cambiar de transporte no toca ni el dominio ni los casos de
 * uso: se cablea otro adaptador.
 */

export interface EmailMessage {
  /** Dirección del destinatario, ya normalizada por quien compone el mensaje. */
  to: string;
  subject: string;
  /**
   * Cuerpo en texto plano. El MVP no manda HTML: un correo transaccional de dos
   * párrafos y un enlace se lee igual, y no arrastra la maquinaria de plantillas ni
   * los problemas de accesibilidad del HTML en clientes de correo.
   */
  text: string;
}

export interface Mailer {
  /**
   * Entrega el mensaje. **Propaga el fallo**: el puerto no decide qué significa no
   * poder enviar. Quien llama sí — y en el restablecimiento la respuesta al cliente no
   * puede cambiar por eso, o el fallo de envío delataría qué direcciones tienen cuenta
   * (design.md §3).
   */
  send(message: EmailMessage): Promise<void>;
}
