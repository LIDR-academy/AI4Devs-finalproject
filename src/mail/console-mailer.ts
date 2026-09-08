import type { EmailMessage, Mailer } from "@/mail/mailer";

/**
 * Adaptador de correo que **escribe el mensaje en el log**, sin proveedor externo.
 *
 * Es el transporte que se despliega en esta entrega (design.md, Non-Goals). Y por eso
 * registra el cuerpo **entero**, enlace incluido, en vez de un discreto "correo
 * enviado": el enlace de restablecimiento no se guarda en ninguna tabla —en la base
 * solo está su hash—, así que el log es literalmente el único sitio donde existe. En
 * local sale por la consola de `next dev`; en Vercel, en los *runtime logs*.
 *
 * El día que haya proveedor real, esto se sustituye por otro adaptador del mismo
 * puerto y nada más cambia.
 */

const DEFAULT_FROM = "Clickoteca <no-reply@clickoteca.local>";

export function consoleMailer(from: string = process.env.MAIL_FROM ?? DEFAULT_FROM): Mailer {
  return {
    async send(message: EmailMessage) {
      console.log(
        [
          "[mail] ─────────────────────────────────────────────",
          `[mail] De:      ${from}`,
          `[mail] Para:    ${message.to}`,
          `[mail] Asunto:  ${message.subject}`,
          "[mail]",
          ...message.text.split("\n").map((line) => `[mail] ${line}`),
          "[mail] ─────────────────────────────────────────────",
        ].join("\n")
      );
    },
  };
}
