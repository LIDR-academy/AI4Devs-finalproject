/**
 * Origen público de la aplicación, para construir enlaces que viajan **fuera** (hoy,
 * el del restablecimiento de contraseña).
 *
 * Se resuelve en la capa HTTP y llega al caso de uso como un dato ya decidido: el
 * dominio no tiene por qué saber en qué host corre.
 */

/**
 * `APP_URL` manda cuando está configurada — es la única fuente que no depende de lo
 * que mande el cliente. Sin ella se deriva de la propia petición, que es lo que hace
 * que un despliegue de *preview* funcione sin configurar nada.
 *
 * **La cabecera `Host` la controla quien llama**, así que un enlace construido a
 * partir de ella puede apuntar a un dominio ajeno. En producción, con `APP_URL`
 * puesta, esa vía queda cerrada.
 */
export function resolveBaseUrl(request: Request): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) return stripTrailingSlash(configured);

  const headers = request.headers;
  // Detrás del proxy de la plataforma el esquema real llega en X-Forwarded-Proto; la
  // conexión al servidor de Next es HTTP aunque el usuario esté en HTTPS.
  const proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim() ?? headers.get("host");

  if (host) return `${proto ?? "http"}://${host}`;

  // Sin cabeceras ni configuración solo queda la URL de la petición. Pasa en los
  // tests y en llamadas sintéticas; en un servidor real siempre hay `Host`.
  return stripTrailingSlash(new URL(request.url).origin);
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
