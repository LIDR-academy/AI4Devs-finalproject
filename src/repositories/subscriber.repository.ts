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

/**
 * Vuelta de un cliente que canceló: la cuenta sigue ahí y lo que se rehace es la
 * **suscripción**, con los datos de envío y pago que traiga el formulario nuevo.
 */
export interface Resubscription {
  userId: string;
  fullName: string;
  acceptedTermsAt: Date;
  address: NewSubscriber["address"];
  card: NewSubscriber["card"];
  subscription: NewSubscriber["subscription"];
}

export type ResubscribeOutcome =
  | { outcome: "resubscribed" }
  | { outcome: "not_found" }
  /** Tiene una suscripción vigente: no hay nada que reabrir. */
  | { outcome: "already_subscribed" };

export interface SubscriberRepository {
  /**
   * Crea la cuenta con su dirección, su método de pago y su suscripción **en una
   * transacción**: un suscriptor sin dirección de envío —o sin plan— no es un alta a
   * medias, es un alta inválida (la spec la rechaza), así que las cuatro filas entran
   * juntas o no entra ninguna.
   */
  createSubscriber(input: NewSubscriber): Promise<CreateSubscriberOutcome>;

  /**
   * Reabre la suscripción de una cuenta existente, en una transacción y **con la
   * comprobación de "no tiene otra vigente" dentro**: entre consultarlo y escribir
   * cabe otra alta simultánea, y entonces el cliente acabaría con dos suscripciones.
   *
   * Actualiza también nombre, dirección y tarjeta con lo que traiga el formulario: si
   * vuelve al cabo de un año, sus datos de envío son los nuevos, no los de entonces.
   */
  resubscribe(input: Resubscription): Promise<ResubscribeOutcome>;
}
