import { hash, verify, type Algorithm } from "@node-rs/argon2";

/**
 * Hashing de contraseñas con **argon2id** (ADR-0002 §1).
 *
 * Los parámetros son los que trae por defecto `@node-rs/argon2` (m=19456 KiB,
 * t=2, p=1), que coinciden con la recomendación de OWASP para argon2id. Se
 * declaran de forma explícita para que un cambio futuro sea deliberado y quede
 * registrado aquí, no oculto tras un default de la librería.
 */
const OPTIONS = {
  // `Algorithm` es un `const enum` ambiente: con `isolatedModules` no se puede leer
  // en tiempo de ejecución, así que se usa su valor (Argon2id = 2) con el tipo puesto.
  algorithm: 2 as Algorithm,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

/**
 * Devuelve `false` en vez de propagar cuando el hash almacenado está corrupto o
 * usa un formato desconocido: para quien llama es indistinguible de una
 * contraseña incorrecta, que es justo lo que debe responder el login.
 */
export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashed, plain, OPTIONS);
  } catch {
    return false;
  }
}
