/**
 * Puerto del alta de suscriptores (`accounts-roles` → "Titularidad adulta" y
 * "Datos de envío del suscriptor").
 */

export interface NewSubscriber {
  email: string;
  passwordHash: string;
  fullName: string;
  acceptedTermsAt: Date;
  address: {
    line1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  /**
   * Tarjeta **simulada** (PRD §5): solo marca, últimos 4 y caducidad. El número
   * completo no se pide ni se guarda — con una pasarela real llegaría ya tokenizado,
   * y almacenarlo aquí sería un problema de cumplimiento que el MVP no necesita.
   */
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export type CreateSubscriberOutcome =
  | { outcome: "created"; userId: string }
  /** Ya hay una cuenta con ese email. */
  | { outcome: "email_taken" };

export interface SubscriberRepository {
  /**
   * Crea la cuenta con su dirección y su método de pago **en una transacción**: un
   * suscriptor sin dirección de envío no es un alta a medias, es un alta inválida
   * (la spec la rechaza), así que las tres filas entran juntas o no entra ninguna.
   */
  createSubscriber(input: NewSubscriber): Promise<CreateSubscriberOutcome>;
}
