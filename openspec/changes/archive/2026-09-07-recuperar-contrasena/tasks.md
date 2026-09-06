# Tasks: Recuperar contraseña

> Tests no negociables, igual que en el MVP: priorizar caminos de error y casos
> límite. Aquí los que más importan son los **tres rechazos indistinguibles** del
> enlace (caducado, gastado, inexistente), la **respuesta idéntica** exista o no la
> cuenta, y que el consumo del token sea **atómico**.
>
> Orden pensado para que el repositorio nunca quede coherente a medias: primero la
> pieza pura (token), luego la persistencia, luego los casos de uso, y solo al final
> las pantallas — que son lo único que hace visible el flujo.

## 1. Token y transporte

- [x] 1.1 `src/domain/auth/password-reset.ts`: generación del token (32 bytes,
      base64url), hash SHA-256, `RESET_TTL_MS = 1h`, `resetExpiresAt` y
      `isResetTokenUsable(expiresAt, usedAt, now)` — puro, sin Prisma ni HTTP
- [x] 1.2 `src/mail/mailer.ts`: puerto `Mailer` (`send({to, subject, text})`) y
      `console-mailer.ts`, el adaptador que registra el mensaje **entero** en el log
      (design.md §2: el enlace no vive en ningún otro sitio)
- [x] 1.3 `src/mail/messages.ts`: `passwordResetEmail({fullName, link, expiresAt})`
      como función pura; el mensaje no revela nada de la cuenta salvo el nombre
- [x] 1.4 `src/http/base-url.ts`: `APP_URL` si está, y si no `x-forwarded-proto` +
      `host` de la petición
- [x] 1.5 Tests: dos tokens seguidos no coinciden; el hash es estable; un token
      caducado y uno gastado no son usables; el mensaje contiene el enlace y la hora
      de caducidad y **no** contiene el token suelto

## 2. Persistencia

- [x] 2.1 `prisma/schema.prisma`: modelo `PasswordResetToken` (`tokenHash` `@unique`,
      `expiresAt`, `usedAt?`, `createdAt`, `requestedIp?`, FK a `User` con
      `onDelete: Cascade`, índice por `userId`)
- [x] 2.2 Migración con `--create-only` + revisión del SQL a mano (el caveat de flujo
      de AGENTS.md: `migrate dev` aborta en no interactivo ante cualquier warning)
- [x] 2.3 Puerto `src/repositories/password-reset.repository.ts`: `create`,
      `invalidateForUser`, `findByTokenHash`, `consume` (CAS sobre `usedAt IS NULL`)
      y `updatePassword`
- [x] 2.4 Adaptador Prisma y doble en memoria en `tests/fakes/`

## 3. Casos de uso

- [x] 3.1 `requestPasswordReset`: normaliza el email, **invalida los tokens vivos**
      del usuario, crea el nuevo, envía el correo y emite el aviso; devuelve
      **siempre lo mismo** — email desconocido y cuenta suspendida incluidos
      (design.md §3)
- [x] 3.2 `resetPassword`: resuelve el token por su hash, lo consume con el CAS,
      escribe el hash argon2id de la contraseña nueva y **cierra todas las sesiones**
      con `deleteSessionsForUser`; emite el aviso de cambio
- [x] 3.3 Código `RESET_TOKEN_INVALID` en `src/domain/errors.ts` y **410 Gone** en el
      mapa de `src/http/problem.ts`; caducado, gastado e inexistente comparten código
      y mensaje
- [x] 3.4 `src/domain/notifications/events.ts`: tipos `PASSWORD_RESET_REQUESTED` y
      `PASSWORD_CHANGED` con sus eventos y claves de idempotencia **por token** en los
      dos: un enlace se gasta una sola vez, así que identifica sin ambigüedad tanto la
      solicitud como el cambio que provoca, y restablecer otra vez emite otro par
- [x] 3.5 Tests: solicitud con cuenta / sin cuenta / suspendida devuelven lo mismo y
      solo la primera escribe token y correo; la solicitud nueva invalida la anterior;
      restablecer cambia la contraseña, permite entrar con la nueva, **rechaza la
      vieja** y borra las sesiones; el token no se puede usar dos veces; un token
      caducado se rechaza; un fallo del correo **no** deja la cuenta a medias

## 4. API y pantallas

- [x] 4.1 `POST /api/auth/password-reset`: Zod para el email, **202** con cuerpo
      constante, RFC 9457 para lo demás
- [x] 4.2 `POST /api/auth/password-reset/confirm`: token + contraseña nueva (mínimo 8,
      el mismo del alta); un fallo de validación **no** gasta el token
- [x] 4.3 `app/(public)/recuperar-contrasena/`: formulario de email y mensaje neutro,
      con `role="alert"` para el lector de pantalla
- [x] 4.4 `app/(public)/restablecer-contrasena/`: contraseña nueva + confirmación,
      token desde la URL; el enlace inválido muestra el error y ofrece pedir otro
- [x] 4.5 `app/(public)/login/login-form.tsx`: enlace "¿Has olvidado la contraseña?"
- [x] 4.6 Tests E2E: el enlace aparece en el login; el mensaje es **idéntico** para un
      email sembrado y para uno inventado; un token falso se rechaza con la opción de
      pedir otro; y una pasada de accesibilidad de las dos pantallas nuevas
      (ojo: `getByRole("alert")` choca con el anunciador de ruta de Next — hay que
      anclar `p[role="alert"]`)

## 5. Documentación y cierre

- [x] 5.1 `.env.example`: `APP_URL` pasa a leerse de verdad (nota actualizada) y
      `MAIL_FROM`; la nota de `SESSION_SECRET` sobre "el día que haya un enlace
      caducable" queda revisada — este enlace **no** se firma, se guarda hasheado
- [x] 5.2 `readme.md`, `documents/PRD.md` §4.1 y `documents/user_stories.md`: la
      historia de recuperación de acceso
- [x] 5.3 AGENTS.md: hecho de proyecto con la decisión de transporte y sus
      consecuencias (el enlace solo en el log)
- [x] 5.4 Verificación completa: `tsc --noEmit`, `eslint .`, `vitest run`,
      `next build` y `npm run spec:validate` en verde, más una pasada manual del flujo
      contra la base sembrada
