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
  /**
   * Plan contratado en el alta. La suscripción entra en la **misma transacción** que
   * la cuenta (spec `subscriptions` → "Suscripción activa desde el alta"): no existe
   * el estado "cuenta de suscriptor sin suscripción", así que tampoco puede existir el
   * instante intermedio en que la cuenta ya está creada y la suscripción no.
   *
   * Llega resuelto a `planId` —UUID— porque el código del plan ya lo validó el caso de
   * uso contra el puerto de suscripciones; el adaptador no vuelve a decidir qué planes
   * son contratables.
   */
  subscription: {
    planId: string;
    startedAt: Date;
  };
}

export type CreateSubscriberOutcome =
  | { outcome: "created"; userId: string }
  /** Ya hay una cuenta con ese email. */
  | { outcome: "email_taken" };

export interface SubscriberRepository {
  /**
   * Crea la cuenta con su dirección, su método de pago y su suscripción **en una
   * transacción**: un suscriptor sin dirección de envío —o sin plan— no es un alta a
   * medias, es un alta inválida (la spec la rechaza), así que las cuatro filas entran
   * juntas o no entra ninguna.
   */
  createSubscriber(input: NewSubscriber): Promise<CreateSubscriberOutcome>;
}
