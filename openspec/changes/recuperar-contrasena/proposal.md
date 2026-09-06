## Why

La ventana de acceso solo tiene una puerta: quien olvida su contraseña **no tiene
ninguna forma de volver a entrar**. Ni él ni el back-office — `argon2id` no se
invierte y no existe ninguna pantalla que permita a un operador reponer credenciales.
La única salida documentada hoy es la que dice `.env.example` sobre las semillas:
"si se pierden, la única salida es resetear la instancia".

Para una aplicación que se evalúa en un despliegue público, eso convierte cualquier
olvido en una cuenta muerta. El alta ya crea usuarios reales con contraseñas que
elige cada persona (`POST /api/auth/register`), así que el olvido no es hipotético.

## What Changes

- **Nuevo: solicitud de restablecimiento.** Desde `/login` se llega a
  `/recuperar-contrasena`, donde se pide el email. El sistema envía a esa dirección un
  **enlace de un solo uso y caducable** y responde **siempre lo mismo**, exista o no la
  cuenta: la pantalla de recuperación no puede convertirse en el oráculo de enumeración
  que el login evita desde el primer día (ADR-0002 §1).
- **Nuevo: consumo del enlace.** `/restablecer-contrasena?token=…` pide la contraseña
  nueva dos veces y la aplica. El token es **de un solo uso**, caduca en **1 hora**, y
  al gastarse se **cierran todas las sesiones abiertas** del usuario: si el olvido
  venía de un robo de cuenta, el ladrón se queda fuera en el mismo acto.
- **Nuevo: transporte de correo como puerto.** No había ninguno. Se añade un puerto
  `Mailer` con un **adaptador de consola** que registra el mensaje en el log — la
  decisión del propietario para esta entrega. El enlace **nunca se persiste**: se
  guarda solo el hash del token, igual que con las sesiones.
- **Nuevo: dos avisos de seguridad** en el buzón que ya existe (`notifications`):
  "se ha pedido restablecer tu contraseña" y "tu contraseña ha cambiado". Es lo que
  permite a la titular legítima enterarse de un intento que no ha hecho ella. Ninguno
  de los dos lleva el enlace.
- **Modelo de datos:** una tabla nueva, `password_reset_tokens`. Nada más cambia.

No cambia: el login, el alta, el modelo de sesión ni el contrato de errores más allá
de un código nuevo. **No hay MFA** — el propietario lo deja fuera de alcance
explícitamente.

## Capabilities

### New Capabilities

Ninguna. El cambio se apoya en capabilities existentes.

### Modified Capabilities

- `accounts-roles`: nuevo requisito de restablecimiento de contraseña por correo, con
  sus reglas de no enumeración, caducidad, un solo uso y revocación de sesiones.
- `notifications`: dos tipos de aviso nuevos, ambos de seguridad de la cuenta y
  ninguno con el enlace dentro.

## Impact

**Modelo de datos**

- `prisma/schema.prisma` + migración: modelo `PasswordResetToken` (`tokenHash` único,
  `expiresAt`, `usedAt`, FK a `User` con `onDelete: Cascade`).

**Código a añadir**

- `src/domain/auth/password-reset.ts`: generación/hash del token, caducidad y estado
  usable — puro, sin Prisma ni HTTP, como `session.ts`.
- `src/mail/`: puerto `Mailer` y adaptador de consola; `messages.ts` con el mensaje.
- `src/repositories/password-reset.repository.ts` (+ adaptador Prisma y doble en
  memoria en `tests/fakes/`).
- `src/use-cases/auth/request-password-reset.ts` y `reset-password.ts`.
- `app/api/auth/password-reset/route.ts` y `.../confirm/route.ts`.
- `app/(public)/recuperar-contrasena/` y `app/(public)/restablecer-contrasena/`.
- `src/http/base-url.ts`: origen público para construir el enlace (`APP_URL` o las
  cabeceras de la petición).
- Código de error `RESET_TOKEN_INVALID` → **410 Gone** en `src/domain/errors.ts` y
  `src/http/problem.ts`.

**Código a tocar**

- `app/(public)/login/login-form.tsx`: enlace "¿Has olvidado la contraseña?".
- `src/domain/notifications/events.ts`: dos tipos y dos eventos nuevos.

**Documentación**

- `.env.example` (`APP_URL` pasa a leerse de verdad; `MAIL_FROM`), `readme.md`,
  `documents/PRD.md` §4.1 y `documents/user_stories.md`.
