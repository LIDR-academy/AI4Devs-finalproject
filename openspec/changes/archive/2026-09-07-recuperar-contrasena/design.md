## Context

Ver `proposal.md` — Why. Lo que condiciona el enfoque, del código que ya hay:

- **La sesión ya resuelve este problema una vez.** `src/domain/auth/session.ts`
  genera 32 bytes aleatorios, entrega el token en claro y guarda **solo su SHA-256**.
  El enlace de restablecimiento es exactamente la misma figura —un secreto portador,
  caducable— así que la solución no se inventa: se copia la que ya está validada.
- **El login no distingue email desconocido de contraseña incorrecta**, ni por el
  mensaje ni por el tiempo (`login.ts` hashea a la basura para igualar el reloj). Una
  pantalla de recuperación que dijera "ese email no existe" tiraría por tierra esa
  decisión desde la puerta de al lado.
- **`AuthRepository.deleteSessionsForUser` existe y no lo llama nadie.** Su comentario
  dice literalmente "revocación, cambio de contraseña": estaba escrito para este
  momento.
- **Notificar nunca rompe el negocio** (`emit` no propaga errores). Es la garantía que
  permite colgar avisos del restablecimiento sin arriesgar el restablecimiento.
- **No hay transporte de correo.** Las notificaciones son filas en `notifications` que
  el portal pinta; nunca han salido de la aplicación.
- **El plan Hobby de Vercel admite dos crons diarios** y los dos están usados
  (`offers`, `retention`, ADR-0003 §3). No cabe un tercero.

## Goals / Non-Goals

**Goals:**

- Que una persona que olvida su contraseña recupere el acceso **sola**, sin tocar la
  base de datos ni resembrar la instancia.
- Que la pantalla nueva no filtre qué emails están dados de alta.
- Que el enlace robado sirva para poco: caduca pronto, se gasta una sola vez y su
  uso echa fuera a todas las sesiones abiertas.
- Dejar el correo **enchufable**: cuando haya proveedor, se añade un adaptador y no se
  toca ni el dominio ni los casos de uso.

**Non-Goals:**

- **MFA** — excluido explícitamente por el propietario.
- **Proveedor de correo real** (Resend, SMTP): decisión del propietario para esta
  entrega. El adaptador de consola es el que se despliega.
- **Cambio de contraseña con la sesión abierta** ("cambiar mi contraseña" desde el
  portal). Es otra historia, con otra regla —pedir la contraseña actual— y no es lo
  que bloquea el acceso.
- **Reposición de contraseñas desde el back-office.** Un operador que puede fijar la
  contraseña de un tercero es una puerta trasera; que cada cual use su enlace.
- **Barrido periódico de tokens.** Ver Decisión 6.
- **Limitación de frecuencia (rate limiting).** Ver Risks.

## Decisions

### 1. Tabla propia, no columnas en `users`

**Alternativa descartada:** `resetTokenHash` + `resetTokenExpiresAt` en `User`. Ahorra
una tabla y cuesta caro: no deja rastro de cuántos intentos hubo, obliga a limpiar dos
columnas en cada camino de salida y mezcla el estado de un flujo efímero con la fila
que define la identidad. Una tabla aparte se borra en cascada con el usuario, admite
índice único sobre el hash y permite mirar el historial de un incidente.

`PasswordResetToken` guarda `tokenHash` (único), `expiresAt`, `usedAt` y `createdAt`.
La fila **no se borra al gastarse**: se marca `usedAt`. Un token consumido tiene que
seguir siendo reconocible para poder responder "este enlace ya se usó" en vez de
"no existe", que es lo que vería alguien reenviando el mismo correo dos veces.

### 2. El token en claro no entra nunca en la base

Se guarda el SHA-256, igual que el de sesión y por la misma razón (`session.ts`): un
volcado de la base no debe contener credenciales utilizables. SHA-256 a secas y no
argon2 porque el token tiene 256 bits de entropía —no hay diccionario que lo acorte— y
hay que resolverlo por búsqueda directa.

**Consecuencia deliberada:** el enlace **solo existe en el mensaje**. Con el adaptador
de consola eso significa que vive en el log de la aplicación y en ningún otro sitio; en
el despliegue de Vercel se lee en los *runtime logs*. Guardarlo también en la fila de
`Notification` haría cómodo el desarrollo y anularía por completo el hash: quien viera
la tabla podría entrar en cualquier cuenta. No se hace.

### 3. Respuesta idéntica exista o no la cuenta

`POST /api/auth/password-reset` devuelve **202** con el mismo cuerpo siempre: email
desconocido, cuenta suspendida o correo enviado. La pantalla dice "si esa dirección
tiene cuenta, te hemos enviado un enlace".

**Las cuentas suspendidas no reciben enlace.** Restablecer no levanta la suspensión
—`login` sigue rechazándolas con `FORBIDDEN` después de verificar la contraseña—, así
que el enlace solo serviría para gastar el tiempo de quien lo pide.

**Lo que no se iguala es el tiempo de respuesta.** El camino "existe" hace más trabajo
(escribe una fila, compone un mensaje) que el camino "no existe", y no se rellena con
trabajo falso: el hueco es de milisegundos sobre una latencia de red, y taparlo bien
exigiría encolar el envío. Queda anotado como diferencia conocida, no como olvido.

### 4. Cada solicitud invalida las anteriores

Al pedir un enlace nuevo, los tokens vivos de esa cuenta se marcan usados. Solo vale el
último. Es lo que espera cualquiera que pide el correo dos veces porque el primero no
llegaba, y acota cuántos secretos válidos hay a la vez por cuenta: uno.

### 5. Gastar el token cierra todas las sesiones

`deleteSessionsForUser` después de cambiar el hash. Quien restablece la contraseña o la
ha olvidado, o sospecha que alguien más entró; en los dos casos, dejar vivas las
sesiones abiertas sería dejar dentro justo a quien se quiere echar. El precio —volver a
entrar en el móvil— es exactamente lo que la persona acaba de hacer.

El consumo es un **CAS**: `UPDATE … WHERE id = ? AND usedAt IS NULL`, y si no afecta a
ninguna fila el token ya estaba gastado. Comprobarlo antes de escribir dejaría una
ventana para que dos peticiones simultáneas lo usaran las dos.

### 6. Sin barrido periódico

Un token caducado es **inerte**: la comprobación al usarlo no depende de que nadie lo
haya limpiado. Y no cabe un tercer cron en el plan Hobby (ADR-0003 §3). Como cada
solicitud invalida las anteriores, la tabla crece como mucho una fila por solicitud, y
esas filas son el rastro de auditoría del flujo. Se dejan.

### 7. Código de error propio: `RESET_TOKEN_INVALID` → 410 Gone

**Alternativas descartadas:** `VALIDATION_ERROR` (422) trata el enlace caducado como un
formulario mal rellenado, y no hay nada que corregir en el campo; `UNAUTHENTICATED`
(401) invitaría al cliente a mandar al login, que es justo donde la persona no puede
entrar. **410 Gone** dice lo que pasa —el recurso existió y ya no— y deja al frontend
ofrecer lo único útil: pedir otro enlace.

Caducado, ya usado e inexistente comparten código y mensaje. Distinguirlos convertiría
el endpoint en un oráculo de tokens, y a quien lo sufre le da igual: el enlace no vale.

### 8. El puerto `Mailer` vive en `src/mail/`, no en `src/repositories/`

`src/repositories` está declarado en su README como "interfaces de **persistencia**".
El correo es un efecto de salida, no persistencia. `src/mail/` mantiene el patrón
puerto + adaptador (`mailer.ts` / `console-mailer.ts`) sin desdibujar esa frontera, y
el caso de uso lo recibe por parámetro como todo lo demás.

El mensaje lo compone una **función pura** (`messages.ts`): así el test comprueba que
el enlace y la caducidad salen en el texto sin necesidad de un transporte.

### 9. El origen del enlace: `APP_URL`, y si no, la petición

`APP_URL` ya está en `.env.example` — y hoy no lo lee nadie. Pasa a ser la fuente
preferente. Sin ella se deriva de `x-forwarded-proto` + `host`, que es lo que permite
que funcione en un despliegue de preview sin configurar nada. Se resuelve en la capa
HTTP y llega al caso de uso como un `baseUrl` ya decidido: el dominio no adivina en qué
host corre.

## Risks / Trade-offs

- **Sin límite de frecuencia**, alguien puede pedir enlaces en bucle para una dirección
  ajena y llenarle el buzón. No hay infraestructura de *rate limiting* en el proyecto y
  montarla en serverless exige almacenamiento compartido. Se acota lo que sí se puede:
  un solo token válido por cuenta, caducidad corta y ningún dato de la cuenta en el
  mensaje. Queda anotado como deuda.
- **El enlace solo aparece en el log.** Es la consecuencia directa de la decisión de
  transporte del propietario, y el motivo por el que el adaptador registra el mensaje
  entero y no solo "correo enviado". El día del proveedor real: un adaptador nuevo y
  una línea de cableado.
- **El E2E no puede completar el circuito** sin leer el token, que no viaja por HTTP ni
  por la interfaz. Se cubre lo que sí es observable —enlace en el login, mensaje
  neutro idéntico para email conocido y desconocido, enlace inválido rechazado— y el
  camino feliz completo se prueba en los tests de caso de uso.

## Migration Plan

Una migración aditiva: crea `password_reset_tokens`. No toca tablas existentes, no
tiene fase de relleno y se puede revertir borrando la tabla. Nada del código anterior
depende de ella, así que el orden de despliegue es indiferente.
