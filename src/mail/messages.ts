import type { EmailMessage } from "@/mail/mailer";

/**
 * Composición de los mensajes de correo. Funciones **puras**: reciben los datos y
 * devuelven el mensaje, sin transporte de por medio. Así el test comprueba lo que dice
 * el correo sin enviar ninguno.
 */

/** El correo lo lee una persona en España; la hora se le da en su huso, no en UTC. */
const TIME_FORMAT = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Madrid",
});

export interface PasswordResetEmailInput {
  to: string;
  fullName: string;
  link: string;
  expiresAt: Date;
}

/**
 * Correo con el enlace de restablecimiento.
 *
 * Dice **qué hacer si no ha sido uno mismo** —ignorar el mensaje— porque cualquiera
 * puede pedir un enlace para una dirección ajena y el destinatario merece saber que no
 * tiene que hacer nada. No lleva ningún dato de la cuenta más allá del nombre: si el
 * correo acaba en el buzón equivocado, no revela plan, historial ni actividad.
 */
export function passwordResetEmail({
  to,
  fullName,
  link,
  expiresAt,
}: PasswordResetEmailInput): EmailMessage {
  return {
    to,
    subject: "Restablece tu contraseña de Clickoteca",
    text: [
      `Hola, ${fullName}:`,
      "",
      "Has pedido restablecer la contraseña de tu cuenta de Clickoteca. Abre este",
      "enlace para elegir una nueva:",
      "",
      link,
      "",
      `El enlace caduca el ${TIME_FORMAT.format(expiresAt)} y solo se puede usar una vez.`,
      "",
      "Si no has sido tú, no tienes que hacer nada: tu contraseña sigue siendo la de",
      "siempre y este enlace caducará solo.",
      "",
      "— Clickoteca",
    ].join("\n"),
  };
}
