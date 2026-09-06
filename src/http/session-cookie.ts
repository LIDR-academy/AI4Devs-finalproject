/**
 * Cookie de sesión (ADR-0002 §1): `httpOnly` + `Secure` + `SameSite=Lax`.
 *
 * `httpOnly` deja la cookie fuera del alcance de cualquier JS de la página, que es lo
 * que limita el daño de un XSS. `SameSite=Lax` cubre el grueso de CSRF y, al ser un
 * despliegue de mismo origen (ADR-0001 §5), no hay POST cross-site en el MVP.
 */

export const SESSION_COOKIE_NAME = "clickoteca_session";

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires?: Date;
  maxAge?: number;
}

/**
 * `Secure` solo en producción: el navegador descarta una cookie `Secure` servida por
 * `http://localhost`, así que en desarrollo la sesión no llegaría a establecerse.
 *
 * (El nombre no empieza por `use` a propósito: ESLint lo tomaría por un hook de React.)
 */
function secureCookies(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieOptions(expires: Date): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    expires,
  };
}

/** Opciones para borrar la cookie: misma identidad, caducada. */
export function clearedSessionCookieOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: secureCookies(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}
